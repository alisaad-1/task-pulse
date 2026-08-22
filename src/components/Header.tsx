import React from 'react';
import { Search, Plus, Sparkles, Moon, Sun, Monitor, Download, Upload } from 'lucide-react';
import { ThemeMode } from '../types/task';
import { soundFx } from '../utils/audio';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewTaskModal: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  accentHue: number;
  onAccentChange: (hue: number) => void;
  totalTasks: number;
  completedTasks: number;
  onExport: () => void;
  onImport: (file: File) => void;
}

const ACCENT_HUES = [
  { name: 'Violet', hue: 250 },
  { name: 'Cyan', hue: 190 },
  { name: 'Emerald', hue: 150 },
  { name: 'Amber', hue: 35 },
  { name: 'Rose', hue: 340 }
];

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenNewTaskModal,
  theme,
  onThemeChange,
  accentHue,
  onAccentChange,
  totalTasks,
  completedTasks,
  onExport,
  onImport
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
    }
  };

  return (
    <header className="glass-panel app-header" style={{
      padding: '12px 18px',
      margin: '12px 16px 0 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap'
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, var(--accent-color), #38bdf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--glow-shadow)'
        }}>
          <Sparkles size={20} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #ffffff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TaskPulse
          </h1>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {completedTasks} / {totalTasks} Completed
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ flex: 1, maxWidth: '380px', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text"
          className="input-field"
          placeholder="Search tasks, tags or subtasks... (Cmd+K)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ paddingLeft: '38px', borderRadius: 'var(--radius-full)' }}
        />
      </div>

      {/* Control Actions: Accent Picker, Theme, New Task */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Accent Color Palette */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-full)' }}>
          {ACCENT_HUES.map((item) => (
            <button
              key={item.hue}
              onClick={() => { onAccentChange(item.hue); soundFx.playPopSound(); }}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: `hsl(${item.hue}, 84%, 60%)`,
                border: accentHue === item.hue ? '2px solid #ffffff' : 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                transform: accentHue === item.hue ? 'scale(1.2)' : 'scale(1)'
              }}
              title={`Theme Color: ${item.name}`}
            />
          ))}
        </div>

        {/* Theme Switcher */}
        <button 
          className="btn-icon" 
          onClick={() => {
            const nextTheme: ThemeMode = theme === 'dark' ? 'light' : theme === 'light' ? 'cyberpunk' : 'dark';
            onThemeChange(nextTheme);
            soundFx.playPopSound();
          }}
          title={`Current Theme: ${theme.toUpperCase()}`}
        >
          {theme === 'dark' ? <Moon size={18} /> : theme === 'light' ? <Sun size={18} /> : <Monitor size={18} />}
        </button>

        {/* Export / Import Data */}
        <button className="btn-icon" onClick={onExport} title="Export Tasks (JSON)">
          <Download size={18} />
        </button>
        <button className="btn-icon" onClick={() => fileInputRef.current?.click()} title="Import Tasks (JSON)">
          <Upload size={18} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".json" 
          style={{ display: 'none' }} 
        />

        {/* Primary New Task Button */}
        <button 
          className="btn btn-primary"
          onClick={() => { onOpenNewTaskModal(); soundFx.playPopSound(); }}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Plus size={18} /> New Task
        </button>

      </div>
    </header>
  );
};
