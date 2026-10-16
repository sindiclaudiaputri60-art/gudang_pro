import React, { useState, useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  Plus,
  Calendar,
  User,
  FileText,
  Download,
} from 'lucide-react';
import { StockMovement, MovementType } from '../types/inventory';
import { formatDate } from '../utils/storage';

interface StockMovementViewProps {
  movements: StockMovement[];
  onOpenAddMovement: () => void;
}

export const StockMovementView: React.FC<StockMovementViewProps> = ({
  movements,
  onOpenAddMovement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | MovementType>('ALL');

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        m.itemName.toLowerCase().includes(q) ||
        m.itemSku.toLowerCase().includes(q) ||
        m.referenceNo.toLowerCase().includes(q) ||
        m.pic.toLowerCase().includes(q) ||
        m.notes.toLowerCase().includes(q);

      const matchType = typeFilter === 'ALL' || m.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [movements, searchTerm, typeFilter]);

  const totalInbound = movements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.quantity, 0);
  const totalOutbound = movements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.quantity, 0);
  const totalAdjustments = movements.filter(m => m.type === 'ADJUSTMENT').length;

  const handleExportCSV = () => {
    const headers = ['Waktu', 'No Referensi', 'SKU', 'Nama Barang', 'Tipe Mutasi', 'Jumlah', 'Stok Sebelum', 'Stok Sesudah', 'PIC', 'Catatan'];
    const rows = filteredMovements.map(m => [
      `"${m.timestamp}"`,
      `"${m.referenceNo}"`,
      `"${m.itemSku}"`,
      `"${m.itemName.replace(/"/g, '""')}"`,
      `"${m.type}"`,
      m.quantity,
      m.previousStock,
      m.newStock,
      `"${m.pic.replace(/"/g, '""')}"`,
      `"${m.notes.replace(/"/g, '""')}"`,
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Log_Mutasi_Gudang_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Log Mutasi & Riwayat Transaksi Stok
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Audit jejak pergerakan barang masuk, barang keluar, dan rekonsiliasi stock opname
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Mutasi CSV</span>
          </button>

          <button
            onClick={onOpenAddMovement}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Mutasi Baru</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white rounded-lg border border-neutral-200 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-md">
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block">Total Kuantitas Masuk</span>
            <span className="font-mono text-base font-bold text-emerald-800 tabular-nums">
              +{totalInbound.toLocaleString('id-ID')} unit
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-lg border border-neutral-200 flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-md">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block">Total Kuantitas Keluar</span>
            <span className="font-mono text-base font-bold text-amber-800 tabular-nums">
              -{totalOutbound.toLocaleString('id-ID')} unit
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-lg border border-neutral-200 flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-md">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 block">Frekuensi Stock Opname</span>
            <span className="font-mono text-base font-bold text-blue-800 tabular-nums">
              {totalAdjustments} penyesuaian
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari referensi PO/DO, barang, atau PIC..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50/50"
            />
          </div>

          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg text-xs w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
                typeFilter === 'ALL' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Semua Mutasi ({movements.length})
            </button>
            <button
              onClick={() => setTypeFilter('IN')}
              className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
                typeFilter === 'IN' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setTypeFilter('OUT')}
              className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
                typeFilter === 'OUT' ? 'bg-white text-amber-800 shadow-xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Keluar
            </button>
            <button
              onClick={() => setTypeFilter('ADJUSTMENT')}
              className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
                typeFilter === 'ADJUSTMENT' ? 'bg-white text-blue-800 shadow-xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Opname
            </button>
          </div>

        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Waktu Transaksi</th>
                <th className="py-3 px-4">No. Referensi</th>
                <th className="py-3 px-4">Barang / SKU</th>
                <th className="py-3 px-4">Jenis</th>
                <th className="py-3 px-4 text-right">Kuantitas</th>
                <th className="py-3 px-4 text-right">Perubahan Stok</th>
                <th className="py-3 px-4">Keterangan / Catatan</th>
                <th className="py-3 px-4">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-500">
                    Tidak ada transaksi mutasi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredMovements.map(m => {
                  const isIN = m.type === 'IN';
                  const isOUT = m.type === 'OUT';

                  return (
                    <tr key={m.id} className="hover:bg-neutral-50/60">
                      <td className="py-3 px-4 text-neutral-500 font-mono whitespace-nowrap tabular-nums">
                        {formatDate(m.timestamp)}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-neutral-900 whitespace-nowrap">
                        {m.referenceNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{m.itemName}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{m.itemSku}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-xs font-semibold ${
                          isIN ? 'text-emerald-700' : isOUT ? 'text-amber-800' : 'text-blue-700'
                        }`}>
                          {isIN ? 'Barang Masuk' : isOUT ? 'Barang Keluar' : 'Stock Opname'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-xs tabular-nums whitespace-nowrap">
                        <span className={isIN ? 'text-emerald-700' : isOUT ? 'text-neutral-900' : 'text-blue-700'}>
                          {isIN ? `+${m.quantity}` : isOUT ? `-${m.quantity}` : `${m.quantity} (set)`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-600 tabular-nums whitespace-nowrap">
                        {m.previousStock} → <strong className="text-neutral-900">{m.newStock}</strong>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 max-w-xs truncate" title={m.notes}>
                        {m.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-neutral-700 whitespace-nowrap font-medium">
                        {m.pic}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
