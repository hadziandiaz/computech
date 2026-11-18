import { ArrowUpRight, Zap } from "lucide-react";
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
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
      <Zap className="size-3.5 fill-acid text-acid" />
      {text}
      {link ? <ArrowUpRight className="size-3.5" /> : null}
      <span className="mx-4 inline-block size-1 rotate-45 bg-coral" aria-hidden />
    </span>
  );

  return (
    <div className="border-b border-white/10 bg-ink text-white">
      <div className="container-page relative flex h-9 items-center overflow-hidden text-[11px] font-semibold uppercase tracking-[0.12em] sm:text-xs">
        <div className="marquee-track items-center">
          {[0, 1].map((group) => (
            <div key={group} className="flex items-center" aria-hidden={group === 1}>
              {[0, 1, 2].map((item) => (
                <span key={item} className="flex items-center">
                  {link ? (
                    <Link href={link} className="transition-opacity hover:opacity-75">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
