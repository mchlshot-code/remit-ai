import { Info, Building2, RefreshCw, AlertTriangle } from 'lucide-react';
import { ParallelRateEstimate } from '../modules/rates/types';

interface RateDualDisplayProps {
  officialRate: number;
  parallelEstimate: ParallelRateEstimate;
  sourceCurrency: string;
  targetCurrency: string;
}

export function RateDualDisplay({
  officialRate,
  parallelEstimate,
  sourceCurrency,
  targetCurrency
}: RateDualDisplayProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formattedOfficial = formatCurrency(officialRate, targetCurrency);
  const formattedParallel = formatCurrency(parallelEstimate.estimatedParallelRate, targetCurrency);

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden mb-8">
      <div className="px-5 py-4 border-b bg-gray-50/50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          {sourceCurrency} <span>→</span> {targetCurrency} Exchange Rates
        </h3>
      </div>
      
      <div className="p-5 space-y-4">
        {/* Official Rate */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-blue-100 bg-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex flex-shrink-0 items-center justify-center">
              <Building2 size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Official Rate (CBN/Market)</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-blue-900">{formattedOfficial}</p>
          </div>
        </div>

        {/* Parallel Rate */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-amber-50/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex flex-shrink-0 items-center justify-center">
              <RefreshCw size={16} />
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-gray-900">Parallel Market (Est.)</p>
              <div className="group relative">
                <Info size={14} className="text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                  {parallelEstimate.source}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right flex items-center gap-2">
            <p className="font-bold text-lg text-amber-900">{formattedParallel}</p>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
              +{parallelEstimate.premiumPercent}%
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 mt-4 text-gray-500 bg-gray-50 p-3 rounded text-xs italic">
          <AlertTriangle size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p>{parallelEstimate.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
