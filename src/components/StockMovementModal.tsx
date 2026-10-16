import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { InventoryItem, MovementType, StockMovement } from '../types/inventory';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  preselectedItemId?: string;
  preselectedQty?: number;
  preselectedType?: MovementType;
  onSaveMovement: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => void;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  items,
  preselectedItemId,
  preselectedQty,
  preselectedType = 'IN',
  onSaveMovement,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [movementType, setMovementType] = useState<MovementType>(preselectedType);
  const [quantity, setQuantity] = useState<number>(1);
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [pic, setPic] = useState<string>('Staff Gudang');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (preselectedItemId) {
        setSelectedItemId(preselectedItemId);
      } else if (items.length > 0 && !selectedItemId) {
        setSelectedItemId(items[0].id);
      }

      if (preselectedQty) {
        setQuantity(preselectedQty);
      } else {
        setQuantity(10);
      }

      setMovementType(preselectedType);

      // Auto generate reference number based on type
      const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      if (preselectedType === 'IN') {
        setReferenceNo(`IN-${dateCode}-${randomSuffix}`);
      } else if (preselectedType === 'OUT') {
        setReferenceNo(`OUT-${dateCode}-${randomSuffix}`);
      } else {
        setReferenceNo(`ADJ-${dateCode}-${randomSuffix}`);
      }
      setError(null);
    }
  }, [isOpen, preselectedItemId, preselectedQty, preselectedType, items]);

  if (!isOpen) return null;

  const currentItem = items.find(i => i.id === selectedItemId);

  // Compute live stock transition
  let projectedStock = currentItem ? currentItem.currentStock : 0;
  if (currentItem) {
    if (movementType === 'IN') {
      projectedStock = currentItem.currentStock + Number(quantity);
    } else if (movementType === 'OUT') {
      projectedStock = currentItem.currentStock - Number(quantity);
    } else {
      // For adjustment, quantity represents the new verified stock count
      projectedStock = Number(quantity);
    }
  }

  const isBelowMin = currentItem && projectedStock <= currentItem.minStock && projectedStock > 0;
  const isOutOfStock = currentItem && projectedStock <= 0;
  const isNegative = projectedStock < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) {
      setError('Silakan pilih barang terlebih dahulu.');
      return;
    }
    if (quantity <= 0 && movementType !== 'ADJUSTMENT') {
      setError('Kuantitas mutasi harus lebih besar dari 0.');
      return;
    }
    if (movementType === 'OUT' && currentItem.currentStock < quantity) {
      setError(`Stok tidak mencukupi! Stok saat ini hanya ${currentItem.currentStock} ${currentItem.unit}.`);
      return;
    }
    if (movementType === 'ADJUSTMENT' && quantity < 0) {
      setError('Stok hasil penyesuaian tidak boleh bernilai minus.');
      return;
    }

    onSaveMovement({
      itemId: currentItem.id,
      itemSku: currentItem.sku,
      itemName: currentItem.name,
      type: movementType,
      quantity: Number(quantity),
      previousStock: currentItem.currentStock,
      newStock: projectedStock,
      referenceNo: referenceNo.trim() || `REF-${Date.now()}`,
      notes: notes.trim() || (movementType === 'IN' ? 'Barang Masuk / Restock' : movementType === 'OUT' ? 'Barang Keluar' : 'Stock Opname Fisik'),
      pic: pic.trim() || 'Staff Gudang',
    });

    onClose();
  };

  const handleTypeChange = (type: MovementType) => {
    setMovementType(type);
    const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    if (type === 'IN') {
      setReferenceNo(`IN-${dateCode}-${randomSuffix}`);
    } else if (type === 'OUT') {
      setReferenceNo(`OUT-${dateCode}-${randomSuffix}`);
    } else {
      setReferenceNo(`ADJ-${dateCode}-${randomSuffix}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full z-10 border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Catat Mutasi Stok Gudang</h3>
            <p className="text-xs text-neutral-500">Pembaruan kuantitas real-time & audit transaksi logistik</p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Movement Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Jenis Mutasi Transaksi
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('IN')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  movementType === 'IN'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                <span>Barang Masuk</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('OUT')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  movementType === 'OUT'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs ring-1 ring-amber-500'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-amber-600" />
                <span>Barang Keluar</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('ADJUSTMENT')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  movementType === 'ADJUSTMENT'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs ring-1 ring-blue-500'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Penyesuaian</span>
              </button>
            </div>
          </div>

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Pilih Barang / SKU
            </label>
            <select
              value={selectedItemId}
              onChange={e => setSelectedItemId(e.target.value)}
              className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              required
            >
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.sku} - {item.name} (Stok: {item.currentStock} {item.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {movementType === 'ADJUSTMENT' ? 'Stok Fisik Baru (Hasil Opname)' : 'Jumlah Kuantitas'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={movementType === 'ADJUSTMENT' ? 0 : 1}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full text-sm font-mono tabular-nums font-semibold rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-neutral-400">
                  {currentItem?.unit || 'Pcs'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                No. Referensi / Surat Jalan
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                placeholder="misal: PO-2026-001"
                className="w-full text-sm font-mono rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              />
            </div>
          </div>

          {/* Live Preview Box */}
          {currentItem && (
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-1.5">
                <span>Prediksi Perubahan Stok:</span>
                <span className="font-mono text-neutral-700">Lokasi: {currentItem.rackLocation}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-500 block">Stok Sebelum</span>
                  <span className="font-mono font-semibold text-neutral-800 text-sm tabular-nums">
                    {currentItem.currentStock} {currentItem.unit}
                  </span>
                </div>
                <span className="text-neutral-400 font-mono text-sm">→</span>
                <div>
                  <span className="text-[11px] text-neutral-500 block">Stok Sesudah</span>
                  <span className={`font-mono font-bold text-sm tabular-nums ${isNegative ? 'text-red-600' : isOutOfStock ? 'text-red-600' : isBelowMin ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {projectedStock} {currentItem.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-500 block">Batas Minimum</span>
                  <span className="font-mono text-neutral-600 text-sm tabular-nums">
                    {currentItem.minStock} {currentItem.unit}
                  </span>
                </div>
              </div>

              {/* Status Note */}
              {isNegative && (
                <div className="mt-2 text-red-600 text-[11px] flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Kuantitas keluar melebihi stok yang tersedia di gudang!</span>
                </div>
              )}
              {!isNegative && isOutOfStock && (
                <div className="mt-2 text-red-600 text-[11px] flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Perhatian: Transaksi ini akan membuat stok barang HABIS TOTAL.</span>
                </div>
              )}
              {!isNegative && !isOutOfStock && isBelowMin && (
                <div className="mt-2 text-amber-700 text-[11px] flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Stok sesudah transaksi masih berada di bawah batas minimum ({currentItem.minStock} {currentItem.unit}).</span>
                </div>
              )}
              {!isNegative && !isOutOfStock && !isBelowMin && currentItem.currentStock <= currentItem.minStock && (
                <div className="mt-2 text-emerald-700 text-[11px] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bagus! Restock ini berhasil memulihkan status stok ke batas aman.</span>
                </div>
              )}
            </div>
          )}

          {/* Notes & PIC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Petugas / PIC
              </label>
              <input
                type="text"
                value={pic}
                onChange={e => setPic(e.target.value)}
                placeholder="Nama staf gudang"
                className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Catatan / Keterangan
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="misal: Kiriman supplier, vendor PO #12"
                className="w-full text-sm rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 font-medium">
              {error}
            </p>
          )}

          {/* Buttons */}
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
              disabled={isNegative}
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-lg shadow-xs cursor-pointer transition-colors"
            >
              Simpan Transaksi Mutasi
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
