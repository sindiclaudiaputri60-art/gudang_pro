export type StockStatus = 'out_of_stock' | 'low_stock' | 'in_stock';

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  rackLocation: string; // e.g., 'Zona A / Rak 01 / Bin 03'
  unit: string; // 'Pcs', 'Box', 'Kg', 'Pack', 'Roll', 'Unit'
  currentStock: number;
  minStock: number; // Threshold for notification
  maxStock: number; // Ideal maximum capacity
  costPrice: number; // Harga Beli Satuan (Rp)
  sellingPrice: number; // Harga Jual / Estimasi Nilai (Rp)
  supplier: string;
  supplierContact?: string;
  notes?: string;
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceNo: string; // e.g. PO-2026-001, DO-2026-092, OPNAME-04
  notes: string;
  pic: string; // Petugas / PIC
  timestamp: string;
}

export interface StockAlert {
  item: InventoryItem;
  status: 'out_of_stock' | 'low_stock';
  deficit: number; // minStock - currentStock
  suggestedReorder: number; // maxStock - currentStock
  estimatedCost: number; // suggestedReorder * costPrice
}

export interface WarehouseRack {
  id: string;
  zone: string;
  rackNumber: string;
  capacity: number;
  description: string;
}
