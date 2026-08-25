import React from 'react';
import { Sparkles, Moon, Sun, Plus } from 'lucide-react';
import { ThemeMode } from '../types/task';
import { soundFx } from '../utils/audio';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenNewTaskModal: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  accentHue?: number;
  onAccentChange?: (hue: number) => void;
  totalTasks: number;
  completedTasks: number;
  onExport?: () => void;
  onImport?: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTaskModal,
  theme,
  onThemeChange,
  totalTasks,
  completedTasks
}) => {
  const toggleTheme = () => {
    soundFx.playPopSound();
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="glass-panel app-header" style={{
      padding: '12px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {/* Top Row: Centered Logo & Brand Name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--accent-color), #38bdf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--glow-shadow)'
        }}>
          <Sparkles size={20} color="#ffffff" />
        </div>
        <h1 style={{ 
          fontSize: '1.35rem', 
          fontWeight: 800, 
          letterSpacing: '-0.5px', 
          margin: 0,
          color: 'var(--text-primary)'
        }}>
          TaskPulse
        </h1>
      </div>

      {/* Sub Row: Left = Completed Task Counter, Right = Theme Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '8px'
      }}>
        {/* Left: Completed Count */}
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
          {completedTasks} / {totalTasks} Completed
        </div>

        {/* Right Action Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Light / Dark Mode Toggle */}
          <button 
            className="btn-icon" 
            onClick={toggleTheme}
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* New Task Button */}
          <button 
            className="btn btn-primary"
            onClick={() => { onOpenNewTaskModal(); soundFx.playPopSound(); }}
            style={{ 
              borderRadius: 'var(--radius-full)', 
              padding: '8px 16px', 
              fontSize: '0.88rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>
    </header>
  );
};
