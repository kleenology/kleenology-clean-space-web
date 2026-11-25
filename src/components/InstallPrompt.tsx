import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

interface BIPEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: string }>;
}

/**
 * زر «ثبّت التطبيق» العائم.
 * - أندرويد/كروم: يلتقط beforeinstallprompt ويطلب التثبيت بضغطة.
 * - آيفون/سفاري: لا يدعم beforeinstallprompt، فنعرض تعليمات «أضف للشاشة الرئيسية».
 * - يختفي إذا كان مثبّتاً أصلاً أو أغلقه المستخدم.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;
    try { if (localStorage.getItem("pwa_dismissed") === "1") return; } catch { /* تجاهل */ }

    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|chrome|android/i.test(ua);

    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); setShow(true); };
    window.addEventListener("beforeinstallprompt", onPrompt);

    let t: ReturnType<typeof setTimeout> | undefined;
    if (isIOS && isSafari) t = setTimeout(() => setShow(true), 4000);

    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); if (t) clearTimeout(t); };
  }, []);

  const dismiss = () => {
    setShow(false); setIosHint(false);
    try { localStorage.setItem("pwa_dismissed", "1"); } catch { /* تجاهل */ }
  };

  const install = async () => {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice.catch(() => undefined);
      setDeferred(null); setShow(false);
    } else {
      setIosHint((v) => !v);
    }
  };

  if (!show) return null;

  return (
    <div dir="rtl" className="fixed bottom-24 right-4 z-[55] max-w-[86vw]">
      {iosHint && (
        <div className="mb-2 bg-card border border-border rounded-2xl shadow-float p-4 text-sm leading-relaxed max-w-xs">
          لتثبيت التطبيق على آيفون: اضغط زر المشاركة <Share className="inline h-4 w-4 mx-1 text-brand-blue" />
          في Safari، ثم اختر <b>«أضف إلى الشاشة الرئيسية»</b>.
        </div>
      )}
      <div className="flex items-center gap-1 bg-brand-blue-deep text-white rounded-full shadow-float pr-4 pl-1 py-1">
        <button onClick={install} className="flex items-center gap-2 font-semibold text-sm py-1.5">
          <Download className="h-4 w-4" />
          ثبّت التطبيق
        </button>
        <button onClick={dismiss} aria-label="إغلاق"
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
