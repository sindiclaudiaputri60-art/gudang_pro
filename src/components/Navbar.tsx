import React from 'react';
import { Bell, Plus, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { StockAlert } from '../types/inventory';

interface NavbarProps {
  activeTab: 'dashboard' | 'inventory' | 'movements' | 'layout';
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'movements' | 'layout') => void;
  stockAlerts: StockAlert[];
  setIsNotificationOpen: (open: boolean) => void;
  setIsAddMovementOpen: (open: boolean) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  stockAlerts,
  setIsNotificationOpen,
  setIsAddMovementOpen,
  isSoundEnabled,
  toggleSound,
}) => {
  const criticalCount = stockAlerts.filter(a => a.status === 'out_of_stock').length;
  const warningCount = stockAlerts.filter(a => a.status === 'low_stock').length;
  const totalAlerts = stockAlerts.length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand wordmark (single line, single element) */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 text-left text-neutral-900 font-bold text-lg tracking-tight whitespace-nowrap shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
            GP
          </div>
          <span>GudangPro</span>
        </button>

        {/* Zone 2: 4 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-neutral-900 border-neutral-900 font-semibold'
                : 'text-neutral-600 border-transparent hover:text-neutral-900'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'text-neutral-900 border-neutral-900 font-semibold'
                : 'text-neutral-600 border-transparent hover:text-neutral-900'
            }`}
          >
            <span>Daftar Inventaris</span>
            {totalAlerts > 0 && (
              <span className="font-mono text-xs text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-semibold tabular-nums">
                {totalAlerts}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('movements')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 cursor-pointer ${
              activeTab === 'movements'
                ? 'text-neutral-900 border-neutral-900 font-semibold'
                : 'text-neutral-600 border-transparent hover:text-neutral-900'
            }`}
          >
            Mutasi Stok
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 cursor-pointer ${
              activeTab === 'layout'
                ? 'text-neutral-900 border-neutral-900 font-semibold'
                : 'text-neutral-600 border-transparent hover:text-neutral-900'
            }`}
          >
            Tata Letak Rak
          </button>
        </nav>

        {/* Zone 3: Actions & Notification Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            title={isSoundEnabled ? 'Suara notifikasi aktif (Klik untuk mute)' : 'Suara notifikasi mati (Klik untuk aktifkan)'}
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Sound Alert"
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-neutral-700" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
          </button>

          {/* Low Stock Notification Center Button */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className={`relative p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              totalAlerts > 0
                ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-transparent'
            }`}
            title="Buka Pusat Notifikasi Stok Menipis"
          >
            <Bell className={`w-4 h-4 ${totalAlerts > 0 ? 'text-amber-700 animate-pulse' : 'text-neutral-600'}`} />
            {totalAlerts > 0 && (
              <span className="font-mono text-xs font-semibold tabular-nums text-amber-900">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Quick Transaction Action */}
          <button
            onClick={() => setIsAddMovementOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Mutasi</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around px-4 py-2 border-t border-neutral-100 bg-neutral-50/50 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-1 cursor-pointer ${activeTab === 'dashboard' ? 'font-bold text-neutral-900' : 'text-neutral-500'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-1 cursor-pointer flex items-center gap-1 ${activeTab === 'inventory' ? 'font-bold text-neutral-900' : 'text-neutral-500'}`}
        >
          Inventaris
          {totalAlerts > 0 && <span className="text-amber-700 font-mono text-[10px]">({totalAlerts})</span>}
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`py-1 cursor-pointer ${activeTab === 'movements' ? 'font-bold text-neutral-900' : 'text-neutral-500'}`}
        >
          Mutasi
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`py-1 cursor-pointer ${activeTab === 'layout' ? 'font-bold text-neutral-900' : 'text-neutral-500'}`}
        >
          Tata Letak
        </button>
      </div>
    </header>
  );
};
