import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Check, ListChecks, Plus, Search, X } from "lucide-react";
import {
  freeItemKey, searchPool,
  type ChecklistItem,
} from "@/lib/pricing/qcChecklist";

/**
 * بناء قائمة الفحص المخصص: العميل طلب بنوداً بعينها (الأرضيات والشبابيك مثلاً)
 * فيختار المشرف من بنود القوائم الجاهزة أو يكتب بنداً ليس فيها.
 */
export function CustomItemsPicker({
  items, onChange, onBack, onStart,
}: {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const [query, setQuery] = useState("");

  const chosen = useMemo(() => new Set(items.map((i) => i.key)), [items]);
  const matches = useMemo(() => searchPool(query, chosen), [query, chosen]);

  // نأخذ المفتاح والنص فقط: اسم القائمة الأصلية دليل اختيار، لا جزء من الفحص
  const add = (item: ChecklistItem) => {
    if (chosen.has(item.key)) return;
    onChange([...items, { key: item.key, label: item.label }]);
  };

  const remove = (key: string) => onChange(items.filter((i) => i.key !== key));

  // البند المكتوب يدوياً: مفتاحه من نصّه، فلا يتكرر لو كُتب مرتين
  const addFree = () => {
    const label = query.trim().replace(/\s+/g, " ");
    if (!label) return;
    const key = freeItemKey(label);
    if (!chosen.has(key)) onChange([...items, { key, label }]);
    setQuery("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button type="button" onClick={onBack}
              className="text-xs text-primary underline flex items-center gap-1 mb-4">
        <ArrowRight className="h-3.5 w-3.5" />
        رجوع لاختيار النوع
      </button>

      <div className="flex items-center gap-2 mb-1.5">
        <ListChecks className="h-5 w-5 text-primary shrink-0" />
        <h2 className="font-bold">وش البنود اللي طلبها العميل؟</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        اختر من البنود الجاهزة أو اكتب بنداً ما هو موجود — القائمة تنبني على اختيارك وحده.
      </p>

      {/* المختار أولاً: هو مادة الفحص، فيبقى تحت عين المشرف وهو يبحث */}
      <div className="bg-card border rounded-2xl shadow-clean p-4 mb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-bold text-sm">البنود المختارة</span>
          <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-1">ما اخترت شيئاً بعد.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span key={item.key}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 text-sm px-2.5 py-1.5">
                {item.label}
                <button type="button" onClick={() => remove(item.key)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`إزالة ${item.label}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border rounded-2xl shadow-clean p-4">
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFree(); } }}
            placeholder="ابحث عن بند — أرضيات، زجاج، مكيفات…"
            className="pr-9"
            aria-label="البحث في البنود"
          />
        </div>

        {query.trim() && (
          <button type="button" onClick={addFree}
                  className="w-full text-right border border-dashed rounded-lg p-2.5 mb-2 hover:border-primary hover:bg-primary/5 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm">
              أضف «<strong>{query.trim()}</strong>» كبند جديد
            </span>
          </button>
        )}

        <div className="max-h-[45vh] overflow-y-auto -mx-1 px-1 space-y-1.5">
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-3 text-center">
              ما فيه بند جاهز يطابق البحث — أضفه كبند جديد من فوق.
            </p>
          ) : (
            matches.map((item) => (
              <button key={item.key} type="button" onClick={() => add(item)}
                      className="w-full text-right border rounded-lg p-2.5 hover:border-primary hover:bg-primary/5 flex items-center gap-2">
                <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium truncate">{item.label}</span>
                  <span className="block text-[11px] text-muted-foreground truncate">{item.from}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <Button className="w-full mt-4 h-12" onClick={onStart} disabled={items.length === 0}>
        <Check className="h-4 w-4 ml-2" />
        {items.length === 0 ? "اختر بنداً واحداً على الأقل" : `ابدأ الفحص — ${items.length} بند`}
      </Button>
    </div>
  );
}
