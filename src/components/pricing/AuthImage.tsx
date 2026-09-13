import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchPhotoUrl } from "@/lib/pricing/qcApi";
import { cn } from "@/lib/utils";

/**
 * صورة محمية بجلسة المشرف.
 * وسم <img> العادي لا يرسل ترويسة Authorization، فنجلب الصورة بـfetch
 * ونعرضها من object URL، ونحرّره عند إزالة العنصر حتى لا تتراكم الذاكرة.
 */
export function AuthImage({
  token, photoKey, alt, className,
}: {
  token: string;
  photoKey: string;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    fetchPhotoUrl(token, photoKey)
      .then((next) => {
        if (cancelled) {
          URL.revokeObjectURL(next);
          return;
        }
        objectUrl = next;
        setUrl(next);
      })
      .catch(() => { if (!cancelled) setFailed(true); });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [token, photoKey]);

  if (failed) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-[10px] text-muted-foreground", className)}>
        تعذّر التحميل
      </div>
    );
  }

  if (!url) {
    return (
      <div className={cn("flex items-center justify-center bg-muted", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
