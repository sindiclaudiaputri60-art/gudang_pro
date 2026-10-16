import React, { useState } from 'react';
import { MapPin, AlertTriangle, AlertOctagon, Package, ArrowRight, Layers } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { WAREHOUSE_ZONES } from '../utils/mockData';

interface WarehouseLayoutViewProps {
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  onOpenQuickInbound: (item: InventoryItem) => void;
}

export const WarehouseLayoutView: React.FC<WarehouseLayoutViewProps> = ({
  items,
  onSelectItem,
  onOpenQuickInbound,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('ALL');

  // Group items by zone and rack
  const itemsByZone = React.useMemo(() => {
    const grouped: Record<string, InventoryItem[]> = {};
    WAREHOUSE_ZONES.forEach(z => {
      grouped[z.id] = [];
    });

    items.forEach(item => {
      for (const zone of WAREHOUSE_ZONES) {
        if (item.rackLocation.startsWith(zone.id)) {
          grouped[zone.id].push(item);
          break;
        }
      }
    });

    return grouped;
  }, [items]);

  const displayedZones = selectedZone === 'ALL'
    ? WAREHOUSE_ZONES
    : WAREHOUSE_ZONES.filter(z => z.id === selectedZone);

  return (
    <div className="space-y-4">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Tata Letak Rak & Zonasi Gudang
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Peta visual alokasi lorong penyimpanan dan deteksi titik rak dengan stok menipis
          </p>
        </div>

        {/* Zone switcher filter */}
        <div className="flex items-center gap-1 p-1 bg-white border border-neutral-200 rounded-lg text-xs">
          <button
            onClick={() => setSelectedZone('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
              selectedZone === 'ALL' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Semua Zona
          </button>
          {WAREHOUSE_ZONES.map(z => (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z.id)}
              className={`px-3 py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
                selectedZone === z.id ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {z.id}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Warehouse Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedZones.map(zone => {
          const zoneItems = itemsByZone[zone.id] || [];
          const outOfStockInZone = zoneItems.filter(i => i.currentStock === 0);
          const lowStockInZone = zoneItems.filter(i => i.currentStock <= i.minStock && i.currentStock > 0);
          const hasIssue = outOfStockInZone.length > 0 || lowStockInZone.length > 0;

          return (
            <div
              key={zone.id}
              className={`bg-white rounded-xl border transition-all ${
                hasIssue ? 'border-amber-200' : 'border-neutral-200'
              }`}
            >
              {/* Zone Header */}
              <div className="p-4 border-b border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 bg-neutral-900 text-white rounded">
                      {zone.id}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900">
                      {zone.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    {zone.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-semibold text-neutral-800 tabular-nums">
                    {zoneItems.length} SKU
                  </span>
                  {hasIssue && (
                    <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                      {outOfStockInZone.length + lowStockInZone.length} Rak Perlu Restock
                    </div>
                  )}
                </div>
              </div>

              {/* Items / Bins on this zone */}
              <div className="p-4 space-y-2.5 max-h-80 overflow-y-auto">
                {zoneItems.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-4 text-center">
                    Belum ada barang yang ditempatkan di zona ini.
                  </p>
                ) : (
                  zoneItems.map(item => {
                    const isZero = item.currentStock === 0;
                    const isLow = item.currentStock <= item.minStock && !isZero;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 transition-colors ${
                          isZero
                            ? 'bg-red-50/30 border-red-200'
                            : isLow
                            ? 'bg-amber-50/30 border-amber-200'
                            : 'bg-neutral-50/50 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-neutral-800 text-[11px]">
                              {item.rackLocation.replace(`${zone.id} / `, '')}
                            </span>
                            <span className="text-neutral-300">·</span>
                            <span className="font-mono text-[11px] text-neutral-500">
                              {item.sku}
                            </span>
                          </div>
                          <div className="font-medium text-neutral-900 truncate mt-0.5">
                            {item.name}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className={`font-mono font-bold tabular-nums block ${isZero ? 'text-red-700' : isLow ? 'text-amber-800' : 'text-neutral-900'}`}>
                              {item.currentStock} {item.unit}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              Min: {item.minStock}
                            </span>
                          </div>

                          {(isZero || isLow) && (
                            <button
                              onClick={() => onOpenQuickInbound(item)}
                              title="Restock barang di rak ini"
                              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-semibold rounded cursor-pointer whitespace-nowrap"
                            >
                              Restock
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Zone footer */}
              <div className="p-3 border-t border-neutral-100 bg-neutral-50/30 text-[11px] text-neutral-500 flex items-center justify-between">
                <span>Lorong bebas halangan untuk forklift</span>
                <span className="font-mono text-neutral-600">Standard ISO Safety</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
