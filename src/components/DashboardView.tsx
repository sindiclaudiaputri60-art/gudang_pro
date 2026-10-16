import React from 'react';
import {
  Package,
  TrendingDown,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Plus,
  RefreshCw,
  Layers,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { InventoryItem, StockMovement, StockAlert } from '../types/inventory';
import { formatRupiah, formatDate } from '../utils/storage';

interface DashboardViewProps {
  items: InventoryItem[];
  movements: StockMovement[];
  stockAlerts: StockAlert[];
  onOpenNotifications: () => void;
  onOpenReorderModal: () => void;
  onOpenAddMovement: () => void;
  onOpenAddItem: () => void;
  onQuickRestock: (item: InventoryItem, qty: number) => void;
  onNavigateToInventory: (filter?: 'all' | 'low_stock') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  movements,
  stockAlerts,
  onOpenNotifications,
  onOpenReorderModal,
  onOpenAddMovement,
  onOpenAddItem,
  onQuickRestock,
  onNavigateToInventory,
}) => {
  const totalItems = items.length;
  const totalStockQuantity = items.reduce((sum, item) => sum + item.currentStock, 0);
  const totalValuation = items.reduce((sum, item) => sum + item.currentStock * item.costPrice, 0);

  const outOfStockCount = stockAlerts.filter(a => a.status === 'out_of_stock').length;
  const lowStockCount = stockAlerts.filter(a => a.status === 'low_stock').length;
  const healthyCount = totalItems - (outOfStockCount + lowStockCount);

  const healthPercent = totalItems > 0 ? Math.round((healthyCount / totalItems) * 100) : 100;

  // Movements today
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const movementsToday = movements.filter(m => m.timestamp.slice(0, 10) === todayDateStr);
  const totalInboundToday = movementsToday
    .filter(m => m.type === 'IN')
    .reduce((sum, m) => sum + m.quantity, 0);
  const totalOutboundToday = movementsToday
    .filter(m => m.type === 'OUT')
    .reduce((sum, m) => sum + m.quantity, 0);

  // Top 5 priority restock items
  const priorityItems = stockAlerts.slice(0, 5);

  // Recent 6 transactions
  const recentMovements = movements.slice(0, 6);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Ringkasan Inventaris & Operasional Gudang
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Monitoring ketersediaan stok, transaksi harian, dan deteksi dini barang menipis
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddItem}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah SKU</span>
          </button>

          <button
            onClick={onOpenAddMovement}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Catat Mutasi</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total SKU */}
        <div className="p-4 bg-white rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Total SKU Terdaftar</span>
            <Package className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-neutral-900 tabular-nums">
              {totalItems}
            </span>
            <span className="text-xs text-neutral-500">
              ({totalStockQuantity.toLocaleString('id-ID')} unit fisik)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center justify-between pt-2 border-t border-neutral-100">
            <span>Kapasitas penyimpanan</span>
            <span className="font-mono text-neutral-700 font-medium">4 Zona Aktif</span>
          </div>
        </div>

        {/* KPI 2: Total Asset Valuation */}
        <div className="p-4 bg-white rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Total Nilai Aset Gudang</span>
            <DollarSign className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline">
            <span className="font-mono text-xl font-bold text-neutral-900 tabular-nums truncate">
              {formatRupiah(totalValuation)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center justify-between pt-2 border-t border-neutral-100">
            <span>Berdasarkan HPP Beli</span>
            <span className="font-mono text-emerald-700 font-medium">Aset Terverifikasi</span>
          </div>
        </div>

        {/* KPI 3: Stock Alerts (Focus feature) */}
        <div className={`p-4 rounded-xl border transition-colors cursor-pointer ${
          stockAlerts.length > 0
            ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400'
            : 'bg-white border-neutral-200'
        }`}
        onClick={onOpenNotifications}
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium text-amber-900">Perlu Restock Segera</span>
            <AlertTriangle className={`w-4 h-4 ${stockAlerts.length > 0 ? 'text-amber-700' : 'text-neutral-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-amber-900 tabular-nums">
              {stockAlerts.length}
            </span>
            <span className="text-xs text-neutral-600">
              ({outOfStockCount} habis · {lowStockCount} menipis)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-800 flex items-center justify-between pt-2 border-t border-amber-200/60 font-medium">
            <span>Buka pusat notifikasi</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* KPI 4: Today Movements */}
        <div className="p-4 bg-white rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">Aktivitas Hari Ini</span>
            <TrendingDown className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-neutral-900 tabular-nums">
              {movementsToday.length}
            </span>
            <span className="text-xs text-neutral-500">transaksi</span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500 flex items-center justify-between pt-2 border-t border-neutral-100">
            <span className="text-emerald-700 font-mono font-medium">+{totalInboundToday} masuk</span>
            <span className="text-neutral-300">·</span>
            <span className="text-amber-700 font-mono font-medium">-{totalOutboundToday} keluar</span>
          </div>
        </div>

      </div>

      {/* Main Content Split: Priority Restock Items & Stock Health / Quick Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Urgent Restock Priority List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Barang Prioritas Restock (Stok Kritis)
              </h2>
              <p className="text-xs text-neutral-500">
                Daftar SKU yang membutuhkan pemesanan ulang segera agar operasional tidak terhenti
              </p>
            </div>

            <button
              onClick={() => onNavigateToInventory('low_stock')}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-0">
            {priorityItems.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-neutral-900">Kondisi Stok Optimal</p>
                <p className="mt-0.5">Semua item berada di atas ambang batas minimum.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {priorityItems.map(alert => {
                  const isZero = alert.status === 'out_of_stock';
                  return (
                    <div
                      key={alert.item.id}
                      className="px-5 py-3.5 hover:bg-neutral-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span className="font-mono font-medium text-neutral-700">{alert.item.sku}</span>
                          <span aria-hidden="true">·</span>
                          <span>{alert.item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {alert.item.rackLocation}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-neutral-900">
                          {alert.item.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-[11px] text-neutral-400 block">Sisa Stok</span>
                          <span className={`font-mono font-bold text-sm tabular-nums ${isZero ? 'text-red-600' : 'text-amber-800'}`}>
                            {alert.item.currentStock} {alert.item.unit}
                          </span>
                          <span className="text-[10px] text-neutral-400 block font-mono">
                            Min: {alert.item.minStock}
                          </span>
                        </div>

                        <button
                          onClick={() => onQuickRestock(alert.item, alert.suggestedReorder)}
                          className="px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Restock ({alert.suggestedReorder})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card footer CTA */}
          {priorityItems.length > 0 && (
            <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-xs">
              <span className="text-neutral-500">
                Total estimasi restock: <strong className="font-mono text-neutral-800 tabular-nums">{formatRupiah(stockAlerts.reduce((a, b) => a + b.estimatedCost, 0))}</strong>
              </span>
              <button
                onClick={onOpenReorderModal}
                className="font-semibold text-neutral-900 hover:underline cursor-pointer"
              >
                Buat Lembar PO Lengkap →
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Stock Health & Quick Summary */}
        <div className="space-y-4">
          
          {/* Stock Health Card */}
          <div className="p-5 bg-white rounded-xl border border-neutral-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Kesehatan Stok Inventaris
            </h3>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-neutral-900">Rasio Stok Aman</span>
              <span className="font-mono font-bold text-sm text-neutral-900 tabular-nums">
                {healthPercent}%
              </span>
            </div>

            {/* Segmented bar */}
            <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(healthyCount / (totalItems || 1)) * 100}%` }}
                className="bg-emerald-600 transition-all duration-300"
                title={`Aman: ${healthyCount} item`}
              />
              <div
                style={{ width: `${(lowStockCount / (totalItems || 1)) * 100}%` }}
                className="bg-amber-500 transition-all duration-300"
                title={`Menipis: ${lowStockCount} item`}
              />
              <div
                style={{ width: `${(outOfStockCount / (totalItems || 1)) * 100}%` }}
                className="bg-red-600 transition-all duration-300"
                title={`Habis: ${outOfStockCount} item`}
              />
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
                  <span>Stok Aman (&gt; Batas Min)</span>
                </div>
                <span className="font-mono font-semibold text-neutral-900 tabular-nums">{healthyCount} item</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                  <span>Mendekati Batas Minimum</span>
                </div>
                <span className="font-mono font-semibold text-amber-800 tabular-nums">{lowStockCount} item</span>
              </div>

              <div className="flex items-center justify-between text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-red-600" />
                  <span>Stok Habis Total (0)</span>
                </div>
                <span className="font-mono font-semibold text-red-600 tabular-nums">{outOfStockCount} item</span>
              </div>
            </div>
          </div>

          {/* Quick Operations Guide */}
          <div className="p-5 bg-neutral-900 text-white rounded-xl">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              SOP Manajemen Gudang
            </h4>
            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              Setiap kali barang tiba dari supplier, catat melalui menu <strong className="text-white">Barang Masuk</strong> untuk memperbarui stok otomatis dan meredakan alarm peringatan stok menipis.
            </p>
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Audit berkala</span>
              <button
                onClick={onOpenAddMovement}
                className="text-xs font-semibold text-amber-300 hover:text-amber-200 cursor-pointer"
              >
                Catat Transaksi Sekarang →
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Recent Movements Ledger */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Riwayat Mutasi & Pergerakan Barang Terkini
            </h2>
            <p className="text-xs text-neutral-500">
              Log aktivitas transaksi masuk, keluar, dan stock opname secara kronologis
            </p>
          </div>

          <button
            onClick={() => onNavigateToInventory('all')}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
          >
            Buka Tab Mutasi Lengkap
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Waktu</th>
                <th className="py-2.5 px-4">No. Referensi</th>
                <th className="py-2.5 px-4">Barang / SKU</th>
                <th className="py-2.5 px-4">Jenis Transaksi</th>
                <th className="py-2.5 px-4 text-right">Jumlah</th>
                <th className="py-2.5 px-4 text-right">Perubahan Stok</th>
                <th className="py-2.5 px-4">Petugas / PIC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentMovements.map(m => {
                const isIN = m.type === 'IN';
                const isOUT = m.type === 'OUT';

                return (
                  <tr key={m.id} className="hover:bg-neutral-50/60">
                    <td className="py-2.5 px-4 text-neutral-500 whitespace-nowrap font-mono tabular-nums">
                      {formatDate(m.timestamp)}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-medium text-neutral-800 whitespace-nowrap">
                      {m.referenceNo}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-neutral-900 truncate max-w-xs">{m.itemName}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{m.itemSku}</div>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold ${
                        isIN ? 'text-emerald-700' : isOUT ? 'text-amber-800' : 'text-blue-700'
                      }`}>
                        {isIN ? 'Barang Masuk' : isOUT ? 'Barang Keluar' : 'Penyesuaian'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                      <span className={isIN ? 'text-emerald-700' : isOUT ? 'text-neutral-900' : 'text-blue-700'}>
                        {isIN ? `+${m.quantity}` : isOUT ? `-${m.quantity}` : m.quantity}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-neutral-600 tabular-nums whitespace-nowrap">
                      {m.previousStock} → <strong className="text-neutral-900">{m.newStock}</strong>
                    </td>
                    <td className="py-2.5 px-4 text-neutral-600 whitespace-nowrap">
                      {m.pic}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
