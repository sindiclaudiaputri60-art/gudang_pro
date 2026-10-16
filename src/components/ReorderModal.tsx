import React, { useState } from 'react';
import { X, Printer, FileSpreadsheet, Check, Building2, Phone } from 'lucide-react';
import { StockAlert } from '../types/inventory';
import { formatRupiah, exportReorderListToCSV } from '../utils/storage';

interface ReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: StockAlert[];
}

export const ReorderModal: React.FC<ReorderModalProps> = ({
  isOpen,
  onClose,
  alerts,
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    alerts.forEach(a => {
      init[a.item.id] = a.suggestedReorder;
    });
    return init;
  });

  if (!isOpen) return null;

  const handleQtyChange = (itemId: string, val: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, val),
    }));
  };

  const poNumber = `PO-RESTOCK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`;
  const todayStr = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
  }).format(new Date());

  const grandTotal = alerts.reduce((acc, a) => {
    const qty = quantities[a.item.id] || a.suggestedReorder;
    return acc + qty * a.item.costPrice;
  }, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full z-10 border border-neutral-200 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 print:hidden">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Draft Permintaan Pembelian Restock (PO)
            </h3>
            <p className="text-xs text-neutral-500">
              Daftar rekap barang kritis & menipis untuk diajukan ke departemen purchasing/pemasok
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Document Header */}
          <div className="border-b border-neutral-200 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-lg font-bold text-neutral-900 tracking-tight">GUDANG LOGISTIK UTAMA</div>
              <p className="text-xs text-neutral-500 mt-0.5">Sistem Manajemen Inventaris & Operasional</p>
              <p className="text-xs text-neutral-500">Kawasan Pergudangan Terpadu Blok C-12</p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1">
              <div>
                <span className="text-neutral-400">Nomor Dokumen: </span>
                <span className="font-mono font-bold text-neutral-900">{poNumber}</span>
              </div>
              <div>
                <span className="text-neutral-400">Tanggal Pengajuan: </span>
                <span className="font-medium text-neutral-800">{todayStr}</span>
              </div>
              <div>
                <span className="text-neutral-400">Status: </span>
                <span className="text-amber-800 font-semibold">Menunggu Persetujuan Purchasing</span>
              </div>
            </div>
          </div>

          {/* Table of items needing restock */}
          <div className="overflow-x-auto border border-neutral-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">SKU & Nama Barang</th>
                  <th className="py-2.5 px-3">Pemasok / Vendor</th>
                  <th className="py-2.5 px-3 text-right">Stok Fisik</th>
                  <th className="py-2.5 px-3 text-right">Batas Min</th>
                  <th className="py-2.5 px-3 text-right">Qty Pesan</th>
                  <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {alerts.map((alert, index) => {
                  const qty = quantities[alert.item.id] || alert.suggestedReorder;
                  const subtotal = qty * alert.item.costPrice;
                  const isOutOfStock = alert.status === 'out_of_stock';

                  return (
                    <tr key={alert.item.id} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 px-3 text-neutral-400 font-mono tabular-nums">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-neutral-900">{alert.item.name}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {alert.item.sku} · {alert.item.rackLocation}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-neutral-800 font-medium">{alert.item.supplier}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{alert.item.supplierContact || '-'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <span className={isOutOfStock ? 'text-red-700 font-bold' : 'text-amber-800 font-semibold'}>
                          {alert.item.currentStock} {alert.item.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-600">
                        {alert.item.minStock} {alert.item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={e => handleQtyChange(alert.item.id, Number(e.target.value))}
                          className="w-18 px-2 py-1 text-xs font-mono font-semibold text-right border border-neutral-300 rounded focus:ring-1 focus:ring-neutral-900"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-700">
                        {formatRupiah(alert.item.costPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-neutral-900">
                        {formatRupiah(subtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-neutral-50 border-t-2 border-neutral-300">
                <tr>
                  <td colSpan={7} className="py-3 px-3 text-right font-bold text-neutral-900 text-xs">
                    TOTAL ESTIMASI ANGGARAN RESTOCK:
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-sm text-neutral-900 tabular-nums">
                    {formatRupiah(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-3 gap-6 text-center text-xs text-neutral-600">
            <div>
              <p className="text-neutral-400 mb-12">Diajukan Oleh (Kepala Gudang)</p>
              <p className="font-semibold text-neutral-900">( ............................................ )</p>
            </div>
            <div>
              <p className="text-neutral-400 mb-12">Disetujui Oleh (Procurement Manager)</p>
              <p className="font-semibold text-neutral-900">( ............................................ )</p>
            </div>
            <div>
              <p className="text-neutral-400 mb-12">Diterima Vendor (Konfirmasi Pengiriman)</p>
              <p className="font-semibold text-neutral-900">( ............................................ )</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-neutral-500">
            Total <span className="font-mono font-semibold text-neutral-800">{alerts.length}</span> SKU memerlukan pengadaan segera
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportReorderListToCSV(alerts)}
              className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
