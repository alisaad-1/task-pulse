import React, { useState } from 'react';
import { Task } from '../types/task';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onNewTaskDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onSelectTask,
  onNewTaskDate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    soundFx.playPopSound();
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    soundFx.playPopSound();
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    soundFx.playPopSound();
  };

  // Generate calendar day cells
  const calendarCells = [];
  // Fill empty leading slots for day alignment
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Calendar Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CalendarIcon size={24} color="var(--accent-color)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {monthNames[month]} {year}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleToday} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            Today
          </button>
          <button className="btn-icon" onClick={handlePrevMonth}>
            <ChevronLeft size={20} />
          </button>
          <button className="btn-icon" onClick={handleNextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Grid Days */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {calendarCells.map((dayNum, idx) => {
          if (dayNum === null) {
            return <div key={`empty-${idx}`} style={{ minHeight: '100px', background: 'rgba(255, 255, 255, 0.01)', borderRadius: 'var(--radius-sm)' }} />;
          }

          const formattedDay = String(dayNum).padStart(2, '0');
          const formattedMonth = String(month + 1).padStart(2, '0');
          const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

          const dayTasks = tasks.filter(t => t.dueDate === dateStr);
          const isToday = dateStr === todayStr;

          return (
            <div 
              key={dateStr}
              style={{
                minHeight: '110px',
                padding: '8px',
                background: isToday ? 'var(--accent-glow)' : 'rgba(255, 255, 255, 0.03)',
                border: isToday ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: isToday ? 800 : 600, 
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isToday ? 'var(--accent-color)' : 'transparent',
                  color: isToday ? '#ffffff' : 'var(--text-primary)'
                }}>
                  {dayNum}
                </span>

                <button 
                  className="btn-icon"
                  style={{ padding: '2px' }}
                  onClick={() => onNewTaskDate(dateStr)}
                  title={`Add task on ${dateStr}`}
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Day Tasks Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '75px' }}>
                {dayTasks.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 6px',
                      borderRadius: '4px',
                      background: t.status === 'done' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: t.status === 'done' ? 'var(--status-done)' : 'var(--text-primary)',
                      borderLeft: `3px solid var(--priority-${t.priority})`,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'pointer'
                    }}
                    title={t.title}
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
