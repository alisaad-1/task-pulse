import React from 'react';
import { ViewMode, Priority } from '../types/task';
import { 
  LayoutGrid, 
  ListTodo, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Timer, 
  Filter, 
  Tag, 
  Zap,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
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
  onToggle,
  currentView,
  onViewChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  categories,
  totalTasks,
  completedTasks
}) => {
  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
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

  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <aside className="glass-panel desktop-sidebar" style={{
      width: isOpen ? '240px' : '68px',
      minWidth: isOpen ? '240px' : '68px',
      margin: '16px 0 16px 24px',
      padding: isOpen ? '20px 14px' : '20px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      height: 'calc(100vh - 32px)',
      overflowY: 'auto',
      overflowX: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      
      {/* Sidebar Header & Toggle */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isOpen ? 'space-between' : 'center',
        paddingLeft: isOpen ? '8px' : 0,
        marginBottom: '4px'
      }}>
        {isOpen && (
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            WORKSPACE
          </span>
        )}
        <button 
          className="btn-icon" 
          onClick={onToggle}
          title={isOpen ? "Hide Sidebar" : "Expand Sidebar"}
          style={{ color: 'var(--text-primary)' }}
        >
          {isOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>

      {/* Navigation Views Section */}
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={!isOpen ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isOpen ? 'flex-start' : 'center',
                  gap: '10px',
                  width: '100%',
                  padding: isOpen ? '10px 12px' : '10px 0',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'var(--accent-glow)' : 'transparent',
                  color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                {item.icon}
                {isOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter (Visible when expanded) */}
      {isOpen && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingLeft: '8px' }}>
            CATEGORIES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              onClick={() => { onCategoryChange('all'); soundFx.playPopSound(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: selectedCategory === 'all' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: selectedCategory === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <span>All Categories</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { onCategoryChange(cat); soundFx.playPopSound(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: selectedCategory === cat ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: selectedCategory === cat ? 'var(--accent-color)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={12} /> {cat}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Priority Filter (Visible when expanded) */}
      {isOpen && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingLeft: '8px' }}>
            PRIORITY FILTER
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', paddingLeft: '4px' }}>
            {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => { onPriorityChange(p); soundFx.playPopSound(); }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: selectedPriority === p ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  background: selectedPriority === p ? 'var(--accent-glow)' : 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Progress Widget */}
      {isOpen && (
        <div style={{ marginTop: 'auto', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={12} color="var(--accent-color)" /> Overall Goal
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{progressPct}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--accent-color)', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

    </aside>
  );
};

