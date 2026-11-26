"use client";

import { createBrowserClient } from "@supabase/ssr";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Memproses link reset password…");

  useEffect(() => {
    async function finishReset() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);
      const error = hash.get("error") ?? query.get("error");

      if (error) {
        const description =
          hash.get("error_description") ?? query.get("error_description") ?? "";
        const expired =
          error === "access_denied" || /invalid|expired|not found/i.test(description);
        setMessage(
          expired
            ? "Link reset sudah terpakai atau kedaluwarsa. Minta email reset terbaru, lalu klik sekali saja dari email yang paling baru."
            : `Link reset tidak valid: ${description || error}`,
        );
        return;
      }

      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (!accessToken || !refreshToken) {
        setMessage("Link reset tidak lengkap. Silakan minta email reset baru dari halaman Forgot password.");
        return;
      }

      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) {
        setMessage("Supabase belum terkonfigurasi. Hubungi administrator.");
        return;
      }

      const supabase = createBrowserClient(url, key);
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        setMessage(`Gagal memproses link reset: ${sessionError.message}`);
        return;
      }

      router.replace("/reset-password");
    }

    void finishReset();
  }, [router]);

  return (
    <div>
      <span className="flex size-10 items-center justify-center rounded-xl bg-violet-soft text-violet">
        <KeyRound className="size-5" />
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Memproses reset password</h1>
      <p className="mt-1 text-sm text-muted">{message}</p>
      <Link
        href="/forgot-password"
        className="mt-6 inline-block text-[12px] font-semibold text-violet hover:underline"
      >
        Minta email reset baru
      </Link>
    </div>
  );
}
