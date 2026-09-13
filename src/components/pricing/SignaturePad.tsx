import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Loader2, X } from "lucide-react";

/**
 * شاشة توقيع يدوي بالإصبع تفتح بملء الشاشة.
 *
 * ملء الشاشة مقصود: المشرف يعطي الجوال بيد العميل ليوقّع، فيحتاج مساحة
 * واسعة وخالية من أزرار الحفظ والتفريغ التي قد يضغطها بالخطأ. وهي كذلك
 * تتفادى شريط الأزرار الثابت الذي كان يغطي منتصف اللوحة داخل النموذج.
 *
 * يرسم بـPointer Events فتعمل باللمس والقلم والفأرة معاً.
 */
export function SignaturePad({
  onSave, onCancel, saving, disabled,
}: {
  onSave: (blob: Blob) => void;
  onCancel: () => void;
  saving?: boolean;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  // منع تمرير الصفحة خلف الشاشة أثناء التوقيع
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  // القياس بالبكسل الفعلي وإلا طلع الخط باهتاً على شاشات الجوال عالية الكثافة
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const pointAt = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointAt(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawing.current = true;
    setHasInk(true);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointAt(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => { drawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // خلفية بيضاء: الـcanvas شفاف، والتوقيع الأسود يختفي على خلفية داكنة
    const out = document.createElement("canvas");
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);
    out.toBlob((blob) => { if (blob) onSave(blob); }, "image/png");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between gap-3 p-4 border-b shrink-0">
        <div className="min-w-0">
          <h2 className="font-bold">توقيع العميل</h2>
          <p className="text-[11px] text-muted-foreground">وقّع بإصبعك في المساحة البيضاء</p>
        </div>
        <button type="button" onClick={onCancel} aria-label="إلغاء التوقيع"
                className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 p-4">
        <div className="relative w-full h-full rounded-xl border-2 border-dashed bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-full touch-none rounded-xl"
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            onPointerCancel={end}
          />
          {!hasInk && (
            <span className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground pointer-events-none">
              وقّع هنا بإصبعك
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 border-t shrink-0">
        <Button type="button" variant="outline" className="h-12" onClick={clear} disabled={!hasInk || saving}>
          <Eraser className="h-4 w-4 ml-2" />
          مسح
        </Button>
        <Button type="button" className="h-12" onClick={save} disabled={!hasInk || saving || disabled}>
          {saving ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : null}
          اعتماد التوقيع
        </Button>
      </div>
    </div>
  );
}
