import React from 'react';
import { ViewMode } from '../types/task';
import { 
  FolderKanban,
  LayoutGrid, 
  ListTodo, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Timer, 
  Briefcase,
  ShoppingCart
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedPriority: string;
  onPriorityChange: (p: string) => void;
  categories: string[];
  totalTasks: number;
  completedTasks: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  currentView,
  onViewChange
}) => {
  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'categories', label: 'Main Sections (الأقسام)', icon: <FolderKanban size={18} /> },
    { id: 'inventory', label: 'Purchases Inventory', icon: <ShoppingCart size={18} /> },
    { id: 'work', label: 'Work Dashboard', icon: <Briefcase size={18} /> },
    { id: 'kanban', label: 'Kanban Board', icon: <LayoutGrid size={18} /> },
    { id: 'list', label: 'Data Table List', icon: <ListTodo size={18} /> },
    { id: 'calendar', label: 'Calendar View', icon: <CalendarIcon size={18} /> },
    { id: 'analytics', label: 'Analytics Dashboard', icon: <BarChart2 size={18} /> },
    { id: 'pomodoro', label: 'Pomodoro Focus', icon: <Timer size={18} /> }
  ];

  const handleNavClick = (view: ViewMode) => {
    onViewChange(view);
    soundFx.playPopSound();
  };

  if (!isOpen) return null;

  return (
    <aside className="desktop-sidebar glass-panel" style={{
      width: '240px',
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      height: '100dvh'
    }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        Navigation
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: currentView === item.id ? 'var(--accent-glow)' : 'transparent',
              color: currentView === item.id ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: currentView === item.id ? 700 : 500,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};
