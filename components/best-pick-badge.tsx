import { Sparkles } from "lucide-react";

export function BestPickBadge() {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white text-xs font-bold tracking-wide uppercase rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Best Pick
        </span>
    );
}
