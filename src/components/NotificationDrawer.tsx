import React from 'react';
import {
  X,
  AlertOctagon,
  AlertTriangle,
  ArrowDownToLine,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  MapPin,
  Building,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { StockAlert, InventoryItem } from '../types/inventory';
import { formatRupiah, exportReorderListToCSV } from '../utils/storage';
import { playLowStockAlertSound, playCriticalStockSound } from '../utils/audioAlert';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: StockAlert[];
  onQuickRestock: (item: InventoryItem, suggestedQty: number) => void;
  onOpenReorderModal: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onQuickRestock,
  onOpenReorderModal,
  isSoundEnabled,
  onToggleSound,
}) => {
  const [filterSeverity, setFilterSeverity] = React.useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const criticalItems = alerts.filter(a => a.status === 'out_of_stock');
  const warningItems = alerts.filter(a => a.status === 'low_stock');

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'CRITICAL') return a.status === 'out_of_stock';
    if (filterSeverity === 'WARNING') return a.status === 'low_stock';
    return true;
  });

  const totalCost = alerts.reduce((sum, a) => sum + a.estimatedCost, 0);

  const handleRequestBrowserNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('GudangPro: Notifikasi Aktif', {
          body: `Memantau ${alerts.length} barang stok menipis secara realtime.`,
        });
      }
    }
  };

  const handleTestSound = (isCritical: boolean) => {
    if (isCritical) {
      playCriticalStockSound();
    } else {
      playLowStockAlertSound();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-neutral-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900">
                Pusat Notifikasi Stok Menipis
              </h2>
              {alerts.length > 0 && (
                <span className="font-mono text-xs px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold rounded tabular-nums">
                  {alerts.length} Item Perlu Restock
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Peringatan otomatis ketika kuantitas barang mencapai atau di bawah batas minimum
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Toolbar: Sound, Filter, Permission */}
        <div className="px-6 py-3 border-b border-neutral-200 bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterSeverity === 'ALL'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Semua ({alerts.length})
            </button>
            <button
              onClick={() => setFilterSeverity('CRITICAL')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterSeverity === 'CRITICAL'
                  ? 'bg-white text-red-700 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Habis ({criticalItems.length})
            </button>
            <button
              onClick={() => setFilterSeverity('WARNING')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterSeverity === 'WARNING'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Menipis ({warningItems.length})
            </button>
          </div>

          {/* Sound alert tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTestSound(false)}
              className="text-neutral-500 hover:text-neutral-800 text-[11px] underline underline-offset-2 cursor-pointer"
              title="Dengarkan contoh bunyi notifikasi stok menipis"
            >
              Tes Suara
            </button>
            <span className="text-neutral-300">|</span>
            <button
              onClick={onToggleSound}
              className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] cursor-pointer transition-colors ${
                isSoundEnabled
                  ? 'bg-neutral-50 border-neutral-300 text-neutral-700'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-400'
              }`}
            >
              {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-neutral-700" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isSoundEnabled ? 'Suara Aktif' : 'Mute'}</span>
            </button>
          </div>
        </div>

        {/* Browser Permission Prompt if not yet granted */}
        {notificationPermission === 'default' && (
          <div className="mx-6 mt-4 p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between text-xs text-neutral-700">
            <div>
              <p className="font-semibold text-neutral-900">Aktifkan Notifikasi Desktop?</p>
              <p className="text-[11px] text-neutral-500">Dapatkan peringatan seketika saat ada stok barang yang habis di gudang.</p>
            </div>
            <button
              onClick={handleRequestBrowserNotification}
              className="px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              Izinkan
            </button>
          </div>
        )}

        {/* List of Alerts */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-3" />
              <h3 className="text-sm font-semibold text-neutral-900">Semua Stok Berada di Batas Aman</h3>
              <p className="text-xs text-neutral-500 max-w-xs mt-1">
                Tidak ada barang dengan status habis atau berada di bawah batas minimum yang ditentukan.
              </p>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isZero = alert.status === 'out_of_stock';
              const { item } = alert;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isZero
                      ? 'bg-red-50/40 border-red-200 hover:border-red-300'
                      : 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                  }`}
                >
                  {/* Top line: Status, SKU, Category */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span className="font-mono font-medium text-neutral-700">{item.sku}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.category}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-neutral-900 mt-0.5">
                        {item.name}
                      </h4>
                    </div>

                    <div className="shrink-0 text-right">
                      {isZero ? (
                        <div className="flex items-center gap-1 text-red-700 text-xs font-semibold">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>HABIS TOTAL</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-700 text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>STOK MENIPIS</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stock metrics strip */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-neutral-200/70 text-xs">
                    <div>
                      <span className="text-[11px] text-neutral-500 block">Stok Sekarang</span>
                      <span className={`font-mono font-bold text-sm tabular-nums ${isZero ? 'text-red-600' : 'text-amber-700'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-500 block">Batas Minimum</span>
                      <span className="font-mono font-semibold text-neutral-800 text-sm tabular-nums">
                        {item.minStock} {item.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-500 block">Saran Order</span>
                      <span className="font-mono font-bold text-neutral-900 text-sm tabular-nums">
                        +{alert.suggestedReorder} {item.unit}
                      </span>
                    </div>
                  </div>

                  {/* Metadata unboxed */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      <span>{item.rackLocation}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-neutral-400" />
                      <span>{item.supplier}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Est. Biaya: <strong className="font-mono text-neutral-800 tabular-nums">{formatRupiah(alert.estimatedCost)}</strong>
                    </span>
                  </div>

                  {/* Action row */}
                  <div className="mt-3 pt-2.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-neutral-500">
                      Defisit: <strong className="font-mono text-neutral-800 tabular-nums">-{alert.deficit} {item.unit}</strong>
                    </span>

                    <button
                      onClick={() => onQuickRestock(item, alert.suggestedReorder)}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>Restock Cepat (+{alert.suggestedReorder})</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-neutral-500 block text-[11px]">Estimasi Total Restock:</span>
            <span className="font-mono font-bold text-neutral-900 text-sm tabular-nums">
              {formatRupiah(totalCost)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportReorderListToCSV(alerts)}
              disabled={alerts.length === 0}
              className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Unduh format spreadsheet untuk purchasing"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ekspor PO CSV</span>
            </button>

            <button
              onClick={onOpenReorderModal}
              disabled={alerts.length === 0}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              Form Pemesanan (PO)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
