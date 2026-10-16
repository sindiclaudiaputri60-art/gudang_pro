import { InventoryItem, StockMovement, StockAlert } from '../types/inventory';
import { INITIAL_INVENTORY, INITIAL_MOVEMENTS } from './mockData';

const STORAGE_KEYS = {
  ITEMS: 'gudangpro_inventory_items_v1',
  MOVEMENTS: 'gudangpro_stock_movements_v1',
  SOUND_ENABLED: 'gudangpro_sound_alert_enabled',
};

export function getStoredItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_INVENTORY));
      return INITIAL_INVENTORY;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load items from localStorage', e);
    return INITIAL_INVENTORY;
  }
}

export function saveStoredItems(items: InventoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save items to localStorage', e);
  }
}

export function getStoredMovements(): StockMovement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
      return INITIAL_MOVEMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load movements from localStorage', e);
    return INITIAL_MOVEMENTS;
  }
}

export function saveStoredMovements(movements: StockMovement[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  } catch (e) {
    console.error('Failed to save movements to localStorage', e);
  }
}

export function getSoundAlertSetting(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function saveSoundAlertSetting(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(enabled));
  } catch {
    // ignore
  }
}

export function calculateStockAlerts(items: InventoryItem[]): StockAlert[] {
  const alerts: StockAlert[] = [];

  for (const item of items) {
    if (item.currentStock <= 0) {
      alerts.push({
        item,
        status: 'out_of_stock',
        deficit: item.minStock,
        suggestedReorder: Math.max(item.maxStock - item.currentStock, item.minStock * 2),
        estimatedCost: Math.max(item.maxStock - item.currentStock, item.minStock * 2) * item.costPrice,
      });
    } else if (item.currentStock <= item.minStock) {
      alerts.push({
        item,
        status: 'low_stock',
        deficit: item.minStock - item.currentStock,
        suggestedReorder: Math.max(item.maxStock - item.currentStock, item.minStock),
        estimatedCost: Math.max(item.maxStock - item.currentStock, item.minStock) * item.costPrice,
      });
    }
  }

  // Sort: out_of_stock first, then by highest percentage deficit
  alerts.sort((a, b) => {
    if (a.status === 'out_of_stock' && b.status !== 'out_of_stock') return -1;
    if (b.status === 'out_of_stock' && a.status !== 'out_of_stock') return 1;
    return b.deficit - a.deficit;
  });

  return alerts;
}

export function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return iso;
  }
}

export function exportInventoryToCSV(items: InventoryItem[]) {
  const headers = [
    'SKU',
    'Nama Barang',
    'Kategori',
    'Lokasi Rak',
    'Satuan',
    'Stok Saat Ini',
    'Batas Min',
    'Kapasitas Max',
    'Harga Beli Satuan',
    'Harga Jual Satuan',
    'Total Nilai Stok',
    'Status Stok',
    'Pemasok',
    'Kontak Pemasok',
    'Catatan',
    'Terakhir Diperbarui',
  ];

  const rows = items.map(item => {
    const status = item.currentStock === 0 ? 'HABIS' : item.currentStock <= item.minStock ? 'MENIPIS' : 'AMAN';
    const totalValue = item.currentStock * item.costPrice;
    return [
      `"${item.sku}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.rackLocation}"`,
      `"${item.unit}"`,
      item.currentStock,
      item.minStock,
      item.maxStock,
      item.costPrice,
      item.sellingPrice,
      totalValue,
      `"${status}"`,
      `"${item.supplier.replace(/"/g, '""')}"`,
      `"${item.supplierContact || ''}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
      `"${item.lastUpdated}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `GudangPro_Inventaris_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportReorderListToCSV(alerts: StockAlert[]) {
  const headers = [
    'Prioritas',
    'SKU',
    'Nama Barang',
    'Kategori',
    'Lokasi Rak',
    'Stok Saat Ini',
    'Batas Min',
    'Jumlah Defisit',
    'Saran Jumlah Pesan (Reorder)',
    'Harga Satuan (Rp)',
    'Estimasi Total Biaya (Rp)',
    'Pemasok',
    'Kontak Pemasok',
  ];

  const rows = alerts.map(alert => [
    alert.status === 'out_of_stock' ? 'URGENT: HABIS TOTAL' : 'PERINGATAN: STOK MENIPIS',
    `"${alert.item.sku}"`,
    `"${alert.item.name.replace(/"/g, '""')}"`,
    `"${alert.item.category}"`,
    `"${alert.item.rackLocation}"`,
    alert.item.currentStock,
    alert.item.minStock,
    alert.deficit,
    alert.suggestedReorder,
    alert.item.costPrice,
    alert.estimatedCost,
    `"${alert.item.supplier.replace(/"/g, '""')}"`,
    `"${alert.item.supplierContact || ''}"`,
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Daftar_PO_Restock_GudangPro_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
