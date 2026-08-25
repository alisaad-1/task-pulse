import React from 'react';
import { ViewMode } from '../types/task';
import { BarChart2, Timer, Plus, FolderKanban, Briefcase, ShoppingCart } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface MobileBottomNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenNewTask: () => void;
  onOpenWorkModal?: () => void;
  onOpenInventoryModal?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onViewChange,
  onOpenNewTask,
  onOpenWorkModal,
  onOpenInventoryModal
}) => {
  // Tabs with Tasks on the left, and Purchases on the far right
  const tabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'categories', label: 'Tasks', icon: <FolderKanban size={20} /> },
    { id: 'work', label: 'Work', icon: <Briefcase size={20} /> },
    { id: 'pomodoro', label: 'Focus', icon: <Timer size={20} /> },
    { id: 'analytics', label: 'Stats', icon: <BarChart2 size={20} /> },
    { id: 'inventory', label: 'Purchases', icon: <ShoppingCart size={20} /> }
  ];

  const handleTabClick = (view: ViewMode) => {
    onViewChange(view);
    soundFx.playPopSound();
  };

  const showFab = currentView === 'categories' || currentView === 'inventory' || currentView === 'work';

  const handleFabClick = () => {
    soundFx.playPopSound();
    if (currentView === 'inventory' && onOpenInventoryModal) {
      onOpenInventoryModal();
    } else if (currentView === 'work' && onOpenWorkModal) {
      onOpenWorkModal();
    } else if (currentView === 'categories') {
      onOpenNewTask();
    }
  };

  return (
    <>
      {/* Mobile Floating Action Button (FAB) */}
      {showFab && (
        <button 
          className="mobile-fab" 
          onClick={handleFabClick}
          title={
            currentView === 'inventory'
              ? 'Add Purchase Item'
              : currentView === 'work'
              ? 'Add Work Item'
              : 'Add Task'
          }
        >
          <Plus size={26} />
        </button>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
