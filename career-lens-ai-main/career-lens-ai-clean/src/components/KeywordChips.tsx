import { Check, X } from "lucide-react";
import type { KeywordHit } from "@/lib/types";

interface KeywordChipsProps {
  matched: KeywordHit[];
  missing: KeywordHit[];
}

export function KeywordChips({ matched, missing }: KeywordChipsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <Check className="h-4 w-4" />
          Matched keywords ({matched.length})
        </h4>
        {matched.length === 0 ? (
          <p className="text-sm text-slate-500">No matches found.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {matched.map((k) => (
              <li
                key={k.word}
                className="pill bg-emerald-50 text-emerald-700 border border-emerald-100"
              >
                {k.word}
                <span className="ml-0.5 rounded-full bg-emerald-100 px-1.5 text-[10px] font-bold text-emerald-700">
                  {k.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-600">
          <X className="h-4 w-4" />
          Missing keywords ({missing.length})
        </h4>
        {missing.length === 0 ? (
          <p className="text-sm text-slate-500">None — strong alignment!</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {missing.map((k) => (
              <li
                key={k.word}
                className="pill bg-rose-50 text-rose-600 border border-rose-100"
              >
                {k.word}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
