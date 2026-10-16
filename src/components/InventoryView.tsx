import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  FileSpreadsheet,
  QrCode,
  Edit2,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Filter,
  MapPin,
  Building,
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { formatRupiah, exportInventoryToCSV } from '../utils/storage';
import { CATEGORIES } from '../utils/mockData';

interface InventoryViewProps {
  items: InventoryItem[];
  initialFilter?: 'all' | 'low_stock';
  onAddItem: () => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenBarcode: (item: InventoryItem) => void;
  onQuickInbound: (item: InventoryItem) => void;
  onQuickOutbound: (item: InventoryItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  initialFilter = 'all',
  onAddItem,
  onEditItem,
  onDeleteItem,
  onOpenBarcode,
  onQuickInbound,
  onQuickOutbound,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'HEALTHY'>(
    initialFilter === 'low_stock' ? 'LOW_STOCK' : 'ALL'
  );
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'deficit' | 'value'>('stock');

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search match
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.rackLocation.toLowerCase().includes(query) ||
        item.supplier.toLowerCase().includes(query);

      // Category match
      const matchesCategory =
        selectedCategory === 'Semua Kategori' || item.category === selectedCategory;

      // Status match
      let matchesStatus = true;
      if (statusFilter === 'LOW_STOCK') {
        matchesStatus = item.currentStock <= item.minStock;
      } else if (statusFilter === 'OUT_OF_STOCK') {
        matchesStatus = item.currentStock === 0;
      } else if (statusFilter === 'HEALTHY') {
        matchesStatus = item.currentStock > item.minStock;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock') return a.currentStock - b.currentStock;
      if (sortBy === 'deficit') {
        const defA = a.minStock - a.currentStock;
        const defB = b.minStock - b.currentStock;
        return defB - defA;
      }
      if (sortBy === 'value') {
        return (b.currentStock * b.costPrice) - (a.currentStock * a.costPrice);
      }
      return 0;
    });
  }, [items, searchTerm, selectedCategory, statusFilter, sortBy]);

  const totalLowStock = items.filter(i => i.currentStock <= i.minStock).length;
  const totalOutOfStock = items.filter(i => i.currentStock === 0).length;

  return (
    <div className="space-y-4">
      
      {/* Header title & primary buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Master Data Inventaris Barang
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Daftar lengkap katalog stok, lokasi rak penyimpanan, dan kontrol ambang batas minimum
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportInventoryToCSV(items)}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            title="Download database inventaris ke file Excel/CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onAddItem}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Barang Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3">
        
        {/* Row 1: Search & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari nama barang, kode SKU, lokasi rak, atau vendor..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'name' | 'stock' | 'deficit' | 'value')}
              className="w-full text-xs py-2.5 px-3 rounded-lg border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="stock">Urutkan: Stok Terendah Dulu</option>
              <option value="deficit">Urutkan: Defisit Restock Terbesar</option>
              <option value="name">Urutkan: Nama Barang (A-Z)</option>
              <option value="value">Urutkan: Nilai Valuasi Tertinggi</option>
            </select>
          </div>

        </div>

        {/* Row 2: Status Filter Segmented Buttons */}
        <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Semua ({items.length})
            </button>

            <button
              onClick={() => setStatusFilter('LOW_STOCK')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === 'LOW_STOCK'
                  ? 'bg-white text-amber-900 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>Perlu Restock</span>
              <span className="font-mono text-[11px] text-amber-800 font-bold tabular-nums">
                ({totalLowStock})
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('OUT_OF_STOCK')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                statusFilter === 'OUT_OF_STOCK'
                  ? 'bg-white text-red-800 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>Habis Total</span>
              <span className="font-mono text-[11px] text-red-700 font-bold tabular-nums">
                ({totalOutOfStock})
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('HEALTHY')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === 'HEALTHY'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Stok Aman ({items.length - totalLowStock})
            </button>
          </div>

          <div className="text-xs text-neutral-500">
            Menampilkan <span className="font-mono font-semibold text-neutral-800">{filteredItems.length}</span> dari {items.length} SKU
          </div>

        </div>

      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">
            <Filter className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-900">Tidak ada barang yang cocok</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              Coba sesuaikan kata kunci pencarian atau ubah filter status stok di atas.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Semua Kategori');
                setStatusFilter('ALL');
              }}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-md cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">SKU & Label</th>
                  <th className="py-3 px-4">Nama Barang & Detail</th>
                  <th className="py-3 px-4">Lokasi Rak</th>
                  <th className="py-3 px-4 min-w-44">Kondisi Stok</th>
                  <th className="py-3 px-4 text-right">Batas Min</th>
                  <th className="py-3 px-4 text-right">Nilai Aset</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredItems.map(item => {
                  const isOutOfStock = item.currentStock === 0;
                  const isLowStock = item.currentStock <= item.minStock && !isOutOfStock;
                  const totalValue = item.currentStock * item.costPrice;

                  // Percentage of stock against capacity
                  const fillPercentage = Math.min(100, Math.round((item.currentStock / (item.maxStock || 100)) * 100));

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-neutral-50/70 transition-colors ${
                        isOutOfStock ? 'bg-red-50/20' : isLowStock ? 'bg-amber-50/15' : ''
                      }`}
                    >
                      {/* SKU & Barcode tag button */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenBarcode(item)}
                            title="Lihat Barcode & Stiker Rak"
                            className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono font-semibold text-neutral-800">
                            {item.sku}
                          </span>
                        </div>
                      </td>

                      {/* Name, Category, Supplier (Unboxed clean metadata) */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900 text-xs sm:text-sm">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5 flex flex-wrap items-center gap-1">
                          <span>{item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-48">{item.supplier}</span>
                        </div>
                      </td>

                      {/* Rack location */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-neutral-700">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          <span>{item.rackLocation}</span>
                        </div>
                      </td>

                      {/* Current Stock Visualizer */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between font-mono text-xs tabular-nums">
                            <span className={`font-bold ${isOutOfStock ? 'text-red-700' : isLowStock ? 'text-amber-800' : 'text-neutral-900'}`}>
                              {item.currentStock} {item.unit}
                            </span>
                            <span className="text-neutral-400 text-[10px]">
                              Max: {item.maxStock}
                            </span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${isOutOfStock ? 2 : fillPercentage}%` }}
                              className={`h-full rounded-full transition-all ${
                                isOutOfStock
                                  ? 'bg-red-600'
                                  : isLowStock
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-600'
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Min Stock */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-neutral-600 tabular-nums whitespace-nowrap">
                        {item.minStock} {item.unit}
                      </td>

                      {/* Valuation */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        <div className="font-semibold text-neutral-900">
                          {formatRupiah(totalValue)}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          @{formatRupiah(item.costPrice)}
                        </div>
                      </td>

                      {/* Status Text (No pill envelopes, clean semantic typography) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isOutOfStock ? (
                          <div className="flex items-center gap-1 text-red-700 font-bold text-xs">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            <span>Habis</span>
                          </div>
                        ) : isLowStock ? (
                          <div className="flex items-center gap-1 text-amber-800 font-semibold text-xs">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Menipis</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-700 font-medium text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aman</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Quick Inbound */}
                          <button
                            onClick={() => onQuickInbound(item)}
                            title="Catat Barang Masuk (+ Restock)"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                          >
                            <ArrowDownRight className="w-4 h-4" />
                          </button>

                          {/* Quick Outbound */}
                          <button
                            onClick={() => onQuickOutbound(item)}
                            title="Catat Barang Keluar (- Pengiriman)"
                            disabled={item.currentStock === 0}
                            className="p-1.5 text-neutral-700 hover:bg-neutral-100 rounded transition-colors cursor-pointer disabled:opacity-30"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditItem(item)}
                            title="Edit Data Barang"
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            title="Hapus Barang dari Inventaris"
                            className="p-1.5 text-neutral-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
