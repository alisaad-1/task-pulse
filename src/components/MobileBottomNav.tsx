import React from 'react';
import { ViewMode } from '../types/task';
import { LayoutGrid, ListTodo, Calendar as CalendarIcon, BarChart2, Timer, Plus } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface MobileBottomNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenNewTask: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onViewChange,
  onOpenNewTask
}) => {
  const tabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'kanban', label: 'Board', icon: <LayoutGrid size={20} /> },
    { id: 'list', label: 'List', icon: <ListTodo size={20} /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon size={20} /> },
    { id: 'analytics', label: 'Stats', icon: <BarChart2 size={20} /> },
    { id: 'pomodoro', label: 'Focus', icon: <Timer size={20} /> }
  ];

  const handleTabClick = (view: ViewMode) => {
    onViewChange(view);
    soundFx.playPopSound();
  };

  return (
    <>
      {/* Mobile Floating Action Button (FAB) */}
      <button 
        className="mobile-fab" 
        onClick={() => { onOpenNewTask(); soundFx.playPopSound(); }}
        title="Add Task"
      >
        <Plus size={26} />
      </button>

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
