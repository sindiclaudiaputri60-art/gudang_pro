import React, { useState, useEffect } from 'react';
import { X, Sparkles, Hash } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { CATEGORIES } from '../utils/mockData';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: InventoryItem | null;
  onSave: (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>, itemId?: string) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSave,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [rackLocation, setRackLocation] = useState('Zona A / Rak 01 / Bin 01');
  const [unit, setUnit] = useState('Pcs');
  const [currentStock, setCurrentStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(5);
  const [maxStock, setMaxStock] = useState<number>(100);
  const [costPrice, setCostPrice] = useState<number>(25000);
  const [sellingPrice, setSellingPrice] = useState<number>(35000);
  const [supplier, setSupplier] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setSku(itemToEdit.sku);
        setName(itemToEdit.name);
        setCategory(itemToEdit.category);
        setRackLocation(itemToEdit.rackLocation);
        setUnit(itemToEdit.unit);
        setCurrentStock(itemToEdit.currentStock);
        setMinStock(itemToEdit.minStock);
        setMaxStock(itemToEdit.maxStock);
        setCostPrice(itemToEdit.costPrice);
        setSellingPrice(itemToEdit.sellingPrice);
        setSupplier(itemToEdit.supplier);
        setSupplierContact(itemToEdit.supplierContact || '');
        setNotes(itemToEdit.notes || '');
      } else {
        // Reset defaults for new item
        const randCode = Math.floor(100 + Math.random() * 900);
        setSku(`SKU-GEN-${randCode}`);
        setName('');
        setCategory(CATEGORIES[1]);
        setRackLocation('Zona A / Rak 01 / Bin 01');
        setUnit('Pcs');
        setCurrentStock(20);
        setMinStock(10);
        setMaxStock(150);
        setCostPrice(50000);
        setSellingPrice(75000);
        setSupplier('PT Mitra Logistik Distribusi');
        setSupplierContact('+62 812-3344-5566');
        setNotes('');
      }
      setError(null);
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleGenerateSku = () => {
    let catCode = 'GEN';
    if (category.toLowerCase().includes('elektronik')) catCode = 'ELK';
    else if (category.toLowerCase().includes('kemasan')) catCode = 'PKG';
    else if (category.toLowerCase().includes('suku cadang')) catCode = 'SPD';
    else if (category.toLowerCase().includes('safety') || category.toLowerCase().includes('apd')) catCode = 'SFT';
    else if (category.toLowerCase().includes('tulis')) catCode = 'ATK';

    const rand = Math.floor(100 + Math.random() * 900);
    setSku(`SKU-${catCode}-${rand}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama barang wajib diisi.');
      return;
    }
    if (!sku.trim()) {
      setError('SKU / Kode barang wajib diisi.');
      return;
    }
    if (minStock < 0 || currentStock < 0) {
      setError('Stok dan batas minimum tidak boleh bernilai negatif.');
      return;
    }
    if (maxStock < minStock) {
      setError('Kapasitas maksimum rak harus lebih besar atau sama dengan batas minimum.');
      return;
    }

    onSave(
      {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        rackLocation: rackLocation.trim(),
        unit: unit.trim(),
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        maxStock: Number(maxStock),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        supplier: supplier.trim() || 'Pemasok Umum',
        supplierContact: supplierContact.trim(),
        notes: notes.trim(),
      },
      itemToEdit ? itemToEdit.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full z-10 border border-neutral-200 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              {itemToEdit ? 'Edit Data Barang Inventaris' : 'Tambah Barang Baru ke Gudang'}
            </h3>
            <p className="text-xs text-neutral-500">
              Konfigurasi kode SKU, batas peringatan stok menipis, dan koordinat rak gudang
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* SKU & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700">Kode SKU Barang</label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="text-[11px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Generate SKU</span>
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="SKU-XXX-000"
                className="w-full text-sm font-mono uppercase rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Kategori Barang</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              >
                {CATEGORIES.filter(c => c !== 'Semua Kategori').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Nama Lengkap Barang / Spesifikasi</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Barcode Scanner Wireless 2D Handheld Laser"
              className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              required
            />
          </div>

          {/* Location & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Lokasi Rak Gudang (Zona / Rak / Bin)
              </label>
              <input
                type="text"
                value={rackLocation}
                onChange={e => setRackLocation(e.target.value)}
                placeholder="misal: Zona A / Rak 02 / Bin 01"
                className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Satuan Kuantitas</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              >
                <option value="Pcs">Pcs (Buah)</option>
                <option value="Box">Box / Kotak</option>
                <option value="Unit">Unit</option>
                <option value="Roll">Roll / Gulungan</option>
                <option value="Karton">Karton / Dus</option>
                <option value="Pack">Pack</option>
                <option value="Kg">Kg (Kilogram)</option>
                <option value="Lusin">Lusin (12 pcs)</option>
                <option value="Set">Set</option>
                <option value="Pasang">Pasang</option>
              </select>
            </div>
          </div>

          {/* Stock Metrics Section: Current, Min Threshold, Max Capacity */}
          <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
            <h4 className="text-xs font-bold text-neutral-900 mb-2">
              Konfigurasi Parameter Stok & Ambang Batas Notifikasi
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Stok Saat Ini
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentStock}
                  onChange={e => setCurrentStock(Number(e.target.value))}
                  className="w-full text-sm font-mono font-semibold tabular-nums rounded-md border border-neutral-300 px-2.5 py-1.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                  Batas Min (Trigger Alert)
                </label>
                <input
                  type="number"
                  min="1"
                  value={minStock}
                  onChange={e => setMinStock(Number(e.target.value))}
                  className="w-full text-sm font-mono font-semibold tabular-nums rounded-md border border-amber-300 px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-amber-50/50"
                  required
                />
                <span className="text-[10px] text-amber-700 block mt-0.5">Notifikasi otomatis jika $\le$ batas ini</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Kapasitas Maksimal Rak
                </label>
                <input
                  type="number"
                  min={minStock}
                  value={maxStock}
                  onChange={e => setMaxStock(Number(e.target.value))}
                  className="w-full text-sm font-mono font-semibold tabular-nums rounded-md border border-neutral-300 px-2.5 py-1.5 focus:ring-2 focus:ring-neutral-900 focus:outline-none bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing: Cost & Selling */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Harga Beli Satuan (HPP / Biaya Restock)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-neutral-400 font-mono">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={costPrice}
                  onChange={e => setCostPrice(Number(e.target.value))}
                  className="w-full text-sm font-mono tabular-nums rounded-lg border border-neutral-300 pl-9 pr-3 py-2 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Estimasi Harga Jual / Nilai Valuasi
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-neutral-400 font-mono">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={sellingPrice}
                  onChange={e => setSellingPrice(Number(e.target.value))}
                  className="w-full text-sm font-mono tabular-nums rounded-lg border border-neutral-300 pl-9 pr-3 py-2 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Nama Pemasok / Vendor</label>
              <input
                type="text"
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="PT / CV Supplier"
                className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Kontak / Telepon Pemasok</label>
              <input
                type="text"
                value={supplierContact}
                onChange={e => setSupplierContact(e.target.value)}
                placeholder="+62 812-xxxx-xxxx"
                className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Catatan kondisi khusus, handling barang, nomor batch..."
              className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 font-medium">
              {error}
            </p>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              {itemToEdit ? 'Simpan Perubahan' : 'Tambahkan ke Inventaris'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
