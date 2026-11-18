"use client";

import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_BUCKET,
  isAllowedProductImage,
  productImageExtension,
  productImagePathFromUrl,
} from "@/lib/storage/product-images";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function ProductImageUploader({ initialUrls = [] }: { initialUrls?: string[] }) {
  const [urls, setUrls] = useState(initialUrls);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    const picked = Array.from(files);
    if (!picked.length || uploading) return;

    const invalid = picked.find((file) => !isAllowedProductImage(file));
    if (invalid) {
      toast.error(
        `${invalid.name} tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF maksimal 5 MB.`,
      );
      return;
    }
    if (urls.length + picked.length > MAX_PRODUCT_IMAGES) {
      toast.error(`Maksimal ${MAX_PRODUCT_IMAGES} foto per produk.`);
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];

    try {
      const supabase = createSupabaseBrowserClient();
      for (const file of picked) {
        const path = `products/${crypto.randomUUID()}.${productImageExtension(file.type)}`;
        const { error } = await supabase.storage
          .from(PRODUCT_IMAGE_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        const { data } = supabase.storage
          .from(PRODUCT_IMAGE_BUCKET)
          .getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      setUrls((current) => [...current, ...uploaded].slice(0, MAX_PRODUCT_IMAGES));
      toast.success(`${uploaded.length} foto berhasil diunggah.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah foto.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(index: number, direction: -1 | 1) {
    setUrls((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function makePrimary(index: number) {
    if (index === 0) return;
    setUrls((current) => {
      const next = [...current];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
  }

  async function remove(url: string) {
    setUrls((current) => current.filter((item) => item !== url));

    // A photo that was uploaded in this session but not yet saved can be
    // removed from Storage straight away. Existing photos are cleaned up by
    // saveProductAction when the product is saved.
    if (!initialUrls.includes(url)) {
      const path = productImagePathFromUrl(url);
      if (path) {
        try {
          const supabase = createSupabaseBrowserClient();
          await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
        } catch {
          // The hidden input no longer references it, so the catalog stays
          // correct even if this best-effort cleanup fails.
        }
      }
    }
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    void uploadFiles(event.dataTransfer.files);
  }

  return (
    <div>
      <input type="hidden" name="image_urls" value={urls.join("\n")} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {urls.map((url, index) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-mist"
          >
            <Image
              src={url}
              alt={`Foto produk ${index + 1}`}
              fill
              sizes="(max-width: 640px) 45vw, 180px"
              className="object-cover"
            />
            {index === 0 ? (
              <span className="absolute left-2 top-2 rounded-full bg-violet px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                Utama
              </span>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-ink/80 via-ink/40 to-transparent p-2">
              <button
                type="button"
                onClick={() => makePrimary(index)}
                disabled={index === 0 || uploading}
                title="Jadikan foto utama"
                aria-label="Jadikan foto utama"
                className="inline-flex size-6 items-center justify-center rounded-md bg-white/90 text-ink transition-colors hover:bg-white disabled:opacity-40"
              >
                <Star className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0 || uploading}
                title="Geser ke kiri"
                aria-label="Geser foto ke kiri"
                className="inline-flex size-6 items-center justify-center rounded-md bg-white/90 text-ink transition-colors hover:bg-white disabled:opacity-40"
              >
                <ArrowLeft className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === urls.length - 1 || uploading}
                title="Geser ke kanan"
                aria-label="Geser foto ke kanan"
                className="inline-flex size-6 items-center justify-center rounded-md bg-white/90 text-ink transition-colors hover:bg-white disabled:opacity-40"
              >
                <ArrowRight className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => void remove(url)}
                disabled={uploading}
                title="Hapus foto"
                aria-label="Hapus foto"
                className="inline-flex size-6 items-center justify-center rounded-md bg-coral text-white transition-colors hover:bg-coral/90 disabled:opacity-40"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
        ))}

        {urls.length < MAX_PRODUCT_IMAGES ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            disabled={uploading}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-mist/50 px-2 text-center text-muted transition-colors",
              "hover:border-violet hover:bg-violet-soft/40 hover:text-violet-dark",
              uploading && "cursor-wait opacity-70",
            )}
          >
            {uploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <ImagePlus className="size-6" />
            )}
            <span className="text-[11px] font-semibold">
              {uploading ? "Mengunggah…" : "Tambah / drop foto"}
            </span>
            <span className="text-[9px] leading-tight">
              JPG, PNG, WebP, AVIF · maks 5 MB
            </span>
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={PRODUCT_IMAGE_ACCEPT}
        multiple
        className="hidden"
        onChange={(event) => void uploadFiles(event.target.files ?? [])}
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted">
          {urls.length}/{MAX_PRODUCT_IMAGES} foto · Foto pertama tampil sebagai foto utama.
          Foto diunggah ke Supabase Storage dan tersimpan di database saat produk disimpan.
        </p>
        {urls.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={() => setUrls([])}
          >
            <Trash2 /> Hapus semua
          </Button>
        ) : null}
      </div>
    </div>
  );
}
