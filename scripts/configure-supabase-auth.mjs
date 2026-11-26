const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN is required (Supabase personal access token).");
  process.exit(1);
}

const ref = process.env.SUPABASE_PROJECT_REF || "slmycmqgyibihfozyimb";
const endpoint = `https://api.supabase.com/v1/projects/${ref}/config/auth`;
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const siteUrl = "https://computech-nine.vercel.app";
const requiredRedirects = [
  `${siteUrl}/auth/callback`,
  `${siteUrl}/auth/confirm`,
  `${siteUrl}/auth/reset-callback`,
  "http://localhost:3000/auth/callback",
  "http://localhost:3000/auth/confirm",
  "http://localhost:3000/auth/reset-callback",
];

const recoveryTemplate = `<p>Halo,</p>
<p>Klik tombol berikut untuk mengatur ulang kata sandi akun COMPUTECH kamu:</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>
<p>Jika kamu tidak meminta ini, abaikan email ini.</p>`;

async function request(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text.slice(0, 300) };
  }
  if (!response.ok) {
    const error = new Error(`${response.status} ${text.slice(0, 300)}`);
    error.status = response.status;
    error.code = body?.error?.code;
    throw error;
  }
  return body;
}

const current = await request(endpoint, { headers });
const existing = String(current.uri_allow_list ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const uriAllowList = [...new Set([...existing, ...requiredRedirects])].join(",");

const updated = await request(endpoint, {
  method: "PATCH",
  headers,
  body: JSON.stringify({
    site_url: siteUrl,
    uri_allow_list: uriAllowList,
  }),
});

const currentTemplate = updated.mailer_templates_recovery_content ?? current.mailer_templates_recovery_content ?? "";
let templateStatus = "already uses {{ .ConfirmationURL }}";
if (!currentTemplate.includes("{{ .ConfirmationURL }}")) {
  try {
    await request(endpoint, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ mailer_templates_recovery_content: recoveryTemplate }),
    });
    templateStatus = "updated to use {{ .ConfirmationURL }}";
  } catch (error) {
    if (error.code === "entitlement_required") {
      templateStatus = "could not be changed on free tier; using default template";
    } else {
      throw error;
    }
  }
}

console.log(
  JSON.stringify(
    {
      site_url: updated.site_url,
      uri_allow_list: String(updated.uri_allow_list ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      recovery_template: templateStatus,
    },
    null,
    2,
  ),
);
