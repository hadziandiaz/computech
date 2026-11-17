import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function AnnouncementBar({
  text,
  link,
}: {
  text?: string;
  link?: string;
}) {
  if (!text) return null;
  const content = (
    <span className="inline-flex items-center gap-2">
      <span className="size-1.5 rounded-full bg-neon" />
      {text}
      {link ? <ArrowUpRight className="size-3.5" /> : null}
    </span>
  );

  return (
    <div className="bg-ink text-white">
      <div className="container-page flex h-9 items-center justify-center overflow-hidden text-center text-[11px] font-medium tracking-wide sm:text-xs">
        {link ? (
          <Link href={link} className="transition-opacity hover:opacity-80">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
