import React from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';
import { StockAlert } from '../types/inventory';
import { formatRupiah } from '../utils/storage';

interface LowStockBannerProps {
  alerts: StockAlert[];
  onOpenNotifications: () => void;
  onOpenReorderModal: () => void;
}

export const LowStockBanner: React.FC<LowStockBannerProps> = ({
  alerts,
  onOpenNotifications,
  onOpenReorderModal,
}) => {
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (alerts.length === 0 || isDismissed) {
    return null;
  }

  const outOfStockCount = alerts.filter(a => a.status === 'out_of_stock').length;
  const lowStockCount = alerts.filter(a => a.status === 'low_stock').length;
  const totalEstimatedCost = alerts.reduce((acc, curr) => acc + curr.estimatedCost, 0);

  return (
    <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-amber-100 rounded-md text-amber-800 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-sm text-neutral-800">
            <span className="font-semibold text-amber-950">
              Peringatan Stok Gudang
            </span>
            <span className="mx-2 text-neutral-400" aria-hidden="true">·</span>
            <span>
              {outOfStockCount > 0 && (
                <strong className="text-red-700 font-medium font-mono tabular-nums">
                  {outOfStockCount} barang habis total
                </strong>
              )}
              {outOfStockCount > 0 && lowStockCount > 0 && ' & '}
              {lowStockCount > 0 && (
                <span className="text-amber-800 font-medium font-mono tabular-nums">
                  {lowStockCount} barang mendekati batas minimum
                </span>
              )}
            </span>
            <span className="hidden lg:inline">
              <span className="mx-2 text-neutral-400" aria-hidden="true">·</span>
              <span className="text-neutral-600 text-xs">
                Estimasi biaya restock: <span className="font-mono tabular-nums font-semibold text-neutral-900">{formatRupiah(totalEstimatedCost)}</span>
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenReorderModal}
            className="text-xs font-semibold px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            Draft Pesanan Restock (PO)
          </button>
          
          <button
            onClick={onOpenNotifications}
            className="text-xs font-semibold px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <span>Buka Notifikasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Tutup notifikasi banner sementara"
            className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
