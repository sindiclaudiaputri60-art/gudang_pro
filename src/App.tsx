import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LowStockBanner } from './components/LowStockBanner';
import { NotificationDrawer } from './components/NotificationDrawer';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { StockMovementView } from './components/StockMovementView';
import { WarehouseLayoutView } from './components/WarehouseLayoutView';
import { StockMovementModal } from './components/StockMovementModal';
import { ItemModal } from './components/ItemModal';
import { BarcodeModal } from './components/BarcodeModal';
import { ReorderModal } from './components/ReorderModal';
import { InventoryItem, StockMovement, MovementType } from './types/inventory';
import {
  getStoredItems,
  saveStoredItems,
  getStoredMovements,
  saveStoredMovements,
  getSoundAlertSetting,
  saveSoundAlertSetting,
  calculateStockAlerts,
} from './utils/storage';
import { playLowStockAlertSound, playCriticalStockSound } from './utils/audioAlert';
import { INITIAL_INVENTORY, INITIAL_MOVEMENTS } from './utils/mockData';

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>(() => getStoredItems());
  const [movements, setMovements] = useState<StockMovement[]>(() => getStoredMovements());
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => getSoundAlertSetting());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'movements' | 'layout'>('dashboard');
  const [inventoryInitialFilter, setInventoryInitialFilter] = useState<'all' | 'low_stock'>('all');

  // Modals state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  // Selected item contexts
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [itemForBarcode, setItemForBarcode] = useState<InventoryItem | null>(null);
  const [movementPreselect, setMovementPreselect] = useState<{
    itemId?: string;
    qty?: number;
    type?: MovementType;
  }>({});

  // Compute stock alerts whenever items change
  const stockAlerts = useMemo(() => {
    return calculateStockAlerts(items);
  }, [items]);

  // Persist items
  useEffect(() => {
    saveStoredItems(items);
  }, [items]);

  // Persist movements
  useEffect(() => {
    saveStoredMovements(movements);
  }, [movements]);

  // Sound toggle handler
  const handleToggleSound = () => {
    const nextVal = !isSoundEnabled;
    setIsSoundEnabled(nextVal);
    saveSoundAlertSetting(nextVal);
    if (nextVal) {
      playLowStockAlertSound();
    }
  };

  // Record Stock Movement
  const handleSaveMovement = useCallback((movementData: Omit<StockMovement, 'id' | 'timestamp'>) => {
    const newMovement: StockMovement = {
      ...movementData,
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    // Update target item's stock
    setItems(prevItems => {
      const updated = prevItems.map(item => {
        if (item.id === movementData.itemId) {
          return {
            ...item,
            currentStock: movementData.newStock,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      });

      // Sound notification trigger if stock became 0 or dropped below minimum
      const target = updated.find(i => i.id === movementData.itemId);
      if (target && isSoundEnabled) {
        if (target.currentStock === 0) {
          playCriticalStockSound();
        } else if (target.currentStock <= target.minStock && movementData.previousStock > target.minStock) {
          playLowStockAlertSound();
        }
      }

      return updated;
    });

    setMovements(prev => [newMovement, ...prev]);
  }, [isSoundEnabled]);

  // Add or Edit Inventory Item
  const handleSaveItem = useCallback((
    itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>,
    itemId?: string
  ) => {
    if (itemId) {
      // Edit existing
      setItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, ...itemData, lastUpdated: new Date().toISOString() }
            : item
        )
      );
    } else {
      // Add new
      const newItem: InventoryItem = {
        ...itemData,
        id: `item-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
      };
      setItems(prev => [newItem, ...prev]);

      // Record initial inventory entry movement
      const initMovement: StockMovement = {
        id: `mov-${Date.now()}`,
        itemId: newItem.id,
        itemSku: newItem.sku,
        itemName: newItem.name,
        type: 'IN',
        quantity: newItem.currentStock,
        previousStock: 0,
        newStock: newItem.currentStock,
        referenceNo: `INIT-${newItem.sku}`,
        notes: 'Pendaftaran item SKU baru ke sistem inventaris',
        pic: 'Administrator Gudang',
        timestamp: new Date().toISOString(),
      };
      setMovements(prev => [initMovement, ...prev]);
    }
  }, []);

  // Delete item
  const handleDeleteItem = useCallback((itemId: string) => {
    const target = items.find(i => i.id === itemId);
    if (!target) return;
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus barang "${target.name}" (${target.sku}) dari sistem inventaris?`
    );
    if (confirmDelete) {
      setItems(prev => prev.filter(i => i.id !== itemId));
    }
  }, [items]);

  // Quick Restock from Notification / Priority row
  const handleQuickRestock = useCallback((item: InventoryItem, suggestedQty: number) => {
    setMovementPreselect({
      itemId: item.id,
      qty: suggestedQty,
      type: 'IN',
    });
    setIsNotificationOpen(false);
    setIsMovementModalOpen(true);
  }, []);

  const handleQuickInbound = useCallback((item: InventoryItem) => {
    setMovementPreselect({
      itemId: item.id,
      qty: Math.max(10, item.minStock),
      type: 'IN',
    });
    setIsMovementModalOpen(true);
  }, []);

  const handleQuickOutbound = useCallback((item: InventoryItem) => {
    setMovementPreselect({
      itemId: item.id,
      qty: 1,
      type: 'OUT',
    });
    setIsMovementModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((item: InventoryItem) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  }, []);

  const handleOpenAddItem = useCallback(() => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  }, []);

  const handleOpenBarcode = useCallback((item: InventoryItem) => {
    setItemForBarcode(item);
    setIsBarcodeModalOpen(true);
  }, []);

  const handleNavigateToInventory = useCallback((filter: 'all' | 'low_stock' = 'all') => {
    setInventoryInitialFilter(filter);
    setActiveTab('inventory');
  }, []);

  const handleResetData = () => {
    const confirmReset = window.confirm(
      'Reset data ke kondisi awal demo (sample data lengkap dengan notifikasi stok menipis)?'
    );
    if (confirmReset) {
      setItems(INITIAL_INVENTORY);
      setMovements(INITIAL_MOVEMENTS);
      saveStoredItems(INITIAL_INVENTORY);
      saveStoredMovements(INITIAL_MOVEMENTS);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stockAlerts={stockAlerts}
        setIsNotificationOpen={setIsNotificationOpen}
        setIsAddMovementOpen={() => {
          setMovementPreselect({ type: 'IN' });
          setIsMovementModalOpen(true);
        }}
        isSoundEnabled={isSoundEnabled}
        toggleSound={handleToggleSound}
      />

      {/* Sticky / Top Low Stock Alert Banner */}
      <LowStockBanner
        alerts={stockAlerts}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenReorderModal={() => setIsReorderModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            items={items}
            movements={movements}
            stockAlerts={stockAlerts}
            onOpenNotifications={() => setIsNotificationOpen(true)}
            onOpenReorderModal={() => setIsReorderModalOpen(true)}
            onOpenAddMovement={() => {
              setMovementPreselect({ type: 'IN' });
              setIsMovementModalOpen(true);
            }}
            onOpenAddItem={handleOpenAddItem}
            onQuickRestock={handleQuickRestock}
            onNavigateToInventory={handleNavigateToInventory}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            items={items}
            initialFilter={inventoryInitialFilter}
            onAddItem={handleOpenAddItem}
            onEditItem={handleOpenEdit}
            onDeleteItem={handleDeleteItem}
            onOpenBarcode={handleOpenBarcode}
            onQuickInbound={handleQuickInbound}
            onQuickOutbound={handleQuickOutbound}
          />
        )}

        {activeTab === 'movements' && (
          <StockMovementView
            movements={movements}
            onOpenAddMovement={() => {
              setMovementPreselect({ type: 'IN' });
              setIsMovementModalOpen(true);
            }}
          />
        )}

        {activeTab === 'layout' && (
          <WarehouseLayoutView
            items={items}
            onSelectItem={handleOpenEdit}
            onOpenQuickInbound={handleQuickInbound}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 px-4 sm:px-6 lg:px-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">GudangPro</span>
            <span aria-hidden="true">·</span>
            <span>Sistem Manajemen Inventaris & Notifikasi Stok Menipis</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              className="text-neutral-500 hover:text-neutral-900 underline underline-offset-2 cursor-pointer"
            >
              Reset ke Data Awal Demo
            </button>
            <span className="text-neutral-300">·</span>
            <span className="font-mono text-[11px] text-neutral-400">
              {items.length} SKU Aktif
            </span>
          </div>
        </div>
      </footer>

      {/* Notification Drawer (Core Feature) */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        alerts={stockAlerts}
        onQuickRestock={handleQuickRestock}
        onOpenReorderModal={() => {
          setIsNotificationOpen(false);
          setIsReorderModalOpen(true);
        }}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Stock Movement Modal (Barang Masuk / Keluar / Opname) */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        items={items}
        preselectedItemId={movementPreselect.itemId}
        preselectedQty={movementPreselect.qty}
        preselectedType={movementPreselect.type}
        onSaveMovement={handleSaveMovement}
      />

      {/* Add / Edit Item Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        itemToEdit={itemToEdit}
        onSave={handleSaveItem}
      />

      {/* Barcode & Shelf Bin Label Modal */}
      <BarcodeModal
        item={itemForBarcode}
        onClose={() => setIsBarcodeModalOpen(false)}
      />

      {/* Purchase Order (PO) Reorder Sheet Modal */}
      <ReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        alerts={stockAlerts}
      />

    </div>
  );
}
