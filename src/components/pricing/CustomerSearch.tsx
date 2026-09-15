import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader2, Search, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { searchChecks, QcError, type SavedCheckSummary } from "@/lib/pricing/qcApi";
import {
  searchInspections, InspectionsError, type SavedInspectionSummary,
} from "@/lib/pricing/inspectionsApi";

interface Results {
  checks: SavedCheckSummary[];
  inspections: SavedInspectionSummary[];
}

/**
 * البحث عن عميل عبر كل السجلات المحفوظة.
 * الحالة التي بُني لها: تصل شكوى، فيُفتح ملف العميل فوراً — فحوصاته بصورها
 * وتوقيعه ومعايناته — بدل التنقيب في سجل مرتّب بالتاريخ.
 */
export function CustomerSearch({
  token, onOpenInspection, initialQuery = "", onQueryChange,
}: {
  token: string;
  onOpenInspection: (id: string) => void;
  /** بحث محفوظ في الرابط — يُعاد تشغيله عند العودة من سجل فُتح */
  initialQuery?: string;
  onQueryChange: (query: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Results | null>(null);
  const [searching, setSearching] = useState(false);

  const runRef = useRef<((term: string) => Promise<void>) | null>(null);

  const search = async (term: string) => {
    if (!term || searching) return;
    setSearching(true);
    try {
      // البحثان متوازيان: نتيجة واحدة تجمع الفحوصات والمعاينات
      const [checks, inspections] = await Promise.all([
        searchChecks(token, term).then((r) => r.checks).catch((error) => {
          toast.error(error instanceof QcError ? error.message : "تعذّر البحث في الفحوصات");
          return [];
        }),
        searchInspections(token, term).then((r) => r.inspections).catch((error) => {
          toast.error(error instanceof InspectionsError ? error.message : "تعذّر البحث في المعاينات");
          return [];
        }),
      ]);
      setResults({ checks, inspections });
    } finally {
      setSearching(false);
    }
  };
  runRef.current = search;

  const run = (event?: React.FormEvent) => {
    event?.preventDefault();
    const term = query.trim();
    if (!term) return;
    onQueryChange(term);
    void search(term);
  };

  // العودة من سجل فُتح تستأنف البحث نفسه بدل مربع فارغ
  useEffect(() => {
    if (initialQuery.trim()) void runRef.current?.(initialQuery.trim());
    // مرة واحدة عند التركيب بالبحث القادم من الرابط
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clear = () => {
    setQuery("");
    setResults(null);
    onQueryChange("");
  };

  const count = results ? results.checks.length + results.inspections.length : 0;

  return (
    <div className="bg-card border rounded-2xl shadow-clean p-4 sm:p-5">
      <form onSubmit={run} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن عميل — الاسم أو الجوال أو الحي"
            className="pr-9 pl-9 h-11"
            enterKeyHint="search"
          />
          {query && (
            <button type="button" onClick={clear}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="مسح البحث">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" className="h-11 shrink-0" disabled={!query.trim() || searching}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "بحث"}
        </Button>
      </form>

      {results && (
        <div className="mt-4">
          {count === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">
              ما فيه نتائج لـ«{query.trim()}».
            </p>
          ) : (
            <>
              <p className="text-[11px] text-muted-foreground mb-2">{count} نتيجة</p>
              <div className="space-y-2">
                {results.checks.map((item) => (
                  <Link
                    key={item.id}
                    to={`/admin/pricing/qc/${encodeURIComponent(item.id)}?q=${encodeURIComponent(query.trim())}`}
                    className="flex items-center gap-3 border rounded-lg p-3 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">
                        {item.customerName || item.location || "بلا اسم"}
                      </span>
                      <span className="block text-[11px] text-muted-foreground truncate">
                        فحص جودة · {[item.date, `${item.percent}٪`, item.phone,
                          item.photoCount ? `${item.photoCount} صورة` : ""]
                          .filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </Link>
                ))}

                {results.inspections.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenInspection(item.id)}
                    className="w-full text-right flex items-center gap-3 border rounded-lg p-3 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">
                        {item.customerName || item.location || "بلا اسم"}
                      </span>
                      <span className="block text-[11px] text-muted-foreground truncate">
                        معاينة · {[item.date, item.phone, item.serviceType,
                          `${item.roomCount} غرفة`].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
