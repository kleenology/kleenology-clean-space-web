import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AuthImage } from "./AuthImage";

/**
 * عارض صورة بملء الشاشة. المصغّرة وحدها لا تكفي للتأكد من نظافة زاوية،
 * وهذا هو غرض الصور في فحص الجودة أصلاً.
 */
export function PhotoLightbox({
  token, keys, index, onClose, onIndexChange,
}: {
  token: string;
  keys: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const count = keys.length;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      // في واجهة عربية السهم الأيسر يتقدّم والأيمن يرجع
      if (event.key === "ArrowLeft") onIndexChange((index + 1) % count);
      if (event.key === "ArrowRight") onIndexChange((index - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    // منع تمرير الصفحة خلف العارض
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [index, count, onClose, onIndexChange]);

  if (count === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between p-3 text-white shrink-0">
        <span className="text-sm tabular-nums">{index + 1} / {count}</span>
        <button type="button" onClick={onClose} aria-label="إغلاق العارض"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <X className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex-1 min-h-0 flex items-center justify-center p-2 cursor-zoom-out"
        aria-label="إغلاق العارض"
      >
        <AuthImage
          token={token}
          photoKey={keys[index]}
          alt={`صورة ${index + 1} من ${count}`}
          className="max-w-full max-h-full object-contain"
        />
      </button>

      {count > 1 && (
        <div className="flex items-center justify-between p-4 shrink-0">
          <button type="button" onClick={() => onIndexChange((index + 1) % count)}
                  className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center"
                  aria-label="الصورة التالية">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button type="button" onClick={() => onIndexChange((index - 1 + count) % count)}
                  className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center"
                  aria-label="الصورة السابقة">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
