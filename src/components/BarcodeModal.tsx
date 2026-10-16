import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface BarcodeModalProps {
  item: InventoryItem | null;
  onClose: () => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  // Generate deterministic bar pattern from SKU string
  const bars = React.useMemo(() => {
    const chars = item.sku.split('');
    const pattern: number[] = [2, 1, 1, 2]; // Start pattern
    chars.forEach((c) => {
      const code = c.charCodeAt(0);
      pattern.push((code % 3) + 1);
      pattern.push(((code >> 1) % 3) + 1);
      pattern.push(((code >> 2) % 2) + 1);
      pattern.push(((code >> 3) % 3) + 1);
    });
    pattern.push(2, 2, 1, 1, 2); // Stop pattern
    return pattern;
  }, [item.sku]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full z-10 border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Label Barcode & Kartu Bin Rak</h3>
            <p className="text-xs text-neutral-500">Format stiker identifikasi fisik gudang</p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body - Printable area */}
        <div className="p-6">
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-5 bg-white text-center print:border-solid print:m-0">
            <div className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase">
              GudangPro · Tag Identifikasi Rak
            </div>
            
            <h4 className="text-base font-bold text-neutral-900 mt-2 line-clamp-2">
              {item.name}
            </h4>

            {/* SVG Barcode Representation */}
            <div className="my-4 flex flex-col items-center justify-center">
              <svg className="h-16 w-64" viewBox="0 0 260 70">
                <rect width="260" height="70" fill="white" />
                {bars.map((width, idx) => {
                  let x = 10;
                  for (let i = 0; i < idx; i++) {
                    x += bars[i] * 2.8;
                  }
                  if (x > 245) return null;
                  return idx % 2 === 0 ? (
                    <rect key={idx} x={x} y="5" width={width * 2.5} height="60" fill="black" />
                  ) : null;
                })}
              </svg>
              <span className="font-mono font-bold text-base tracking-widest text-neutral-900 mt-1">
                {item.sku}
              </span>
            </div>

            {/* Shelf Location & Threshold details */}
            <div className="pt-3 border-t border-neutral-200 grid grid-cols-2 gap-2 text-xs text-left">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Lokasi Rak</span>
                <span className="font-semibold text-neutral-800">{item.rackLocation}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Kategori</span>
                <span className="text-neutral-700">{item.category}</span>
              </div>
              <div className="mt-1">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Batas Min Stok</span>
                <span className="font-mono text-amber-800 font-semibold">{item.minStock} {item.unit}</span>
              </div>
              <div className="mt-1">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Kapasitas Rak</span>
                <span className="font-mono text-neutral-700">{item.maxStock} {item.unit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Label Stiker</span>
          </button>
        </div>

      </div>
    </div>
  );
};
