import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types/task';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/audio';

interface PomodoroTimerProps {
  tasks: Task[];
  activeTask?: Task | null;
  onTaskSelect?: (task: Task) => void;
  onSessionComplete?: (taskId?: string, minutesSpent?: number) => void;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const MODE_TIMES: Record<TimerMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  tasks,
  activeTask: propActiveTask,
  onTaskSelect,
  onSessionComplete
}) => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_TIMES.work);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(propActiveTask || null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (propActiveTask) {
      setSelectedTask(propActiveTask);
    }
  }, [propActiveTask]);

  useEffect(() => {
    setTimeLeft(MODE_TIMES[mode]);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            
            // Trigger finish sound & confetti
            soundFx.playAlarmSound();
            if (mode === 'work') {
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              if (onSessionComplete) {
                onSessionComplete(selectedTask?.id, 25);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedTask, onSessionComplete]);

  const toggleTimer = () => {
    soundFx.playPopSound();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    soundFx.playPopSound();
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    soundFx.playPopSound();
    setMode(newMode);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = MODE_TIMES[mode];
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  const strokeDashoffset = 565 - (565 * progressPercent) / 100;

  return (
    <div className="glass-panel" style={{ padding: '36px', maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
      
      {/* Mode Switches */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
        <button
          onClick={() => switchMode('work')}
          className="btn"
          style={{
            background: mode === 'work' ? 'var(--accent-color)' : 'rgba(255,255,255,0.06)',
            color: mode === 'work' ? '#ffffff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 20px',
            fontSize: '0.85rem'
          }}
        >
          🎯 Focus (25m)
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className="btn"
          style={{
            background: mode === 'shortBreak' ? 'var(--status-done)' : 'rgba(255,255,255,0.06)',
            color: mode === 'shortBreak' ? '#ffffff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 20px',
            fontSize: '0.85rem'
          }}
        >
          ☕ Short Break (5m)
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className="btn"
          style={{
            background: mode === 'longBreak' ? '#38bdf8' : 'rgba(255,255,255,0.06)',
            color: mode === 'longBreak' ? '#ffffff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 20px',
            fontSize: '0.85rem'
          }}
        >
          🌴 Long Break (15m)
        </button>
      </div>

      {/* Task Link Selector */}
      <div style={{ marginBottom: '28px', textAlign: 'left' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
          Linked Focus Task:
        </label>
        <select 
          className="input-field"
          value={selectedTask?.id || ''}
          onChange={(e) => {
            const found = tasks.find(t => t.id === e.target.value);
            setSelectedTask(found || null);
            if (found && onTaskSelect) onTaskSelect(found);
          }}
        >
          <option value="">-- No specific task linked --</option>
          {tasks.filter(t => t.status !== 'done').map(t => (
            <option key={t.id} value={t.id}>[{t.priority.toUpperCase()}] {t.title}</option>
          ))}
        </select>
      </div>

      {/* Circular Progress Timer */}
      <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 32px auto' }}>
        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="110"
            cy="110"
            r="90"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Progress ring */}
          <circle
            cx="110"
            cy="110"
            r="90"
            stroke={mode === 'work' ? 'var(--accent-color)' : mode === 'shortBreak' ? 'var(--status-done)' : '#38bdf8'}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray="565"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        {/* Center Clock Text */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '3.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '-1px' }}>
            {formattedTime}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
            {mode === 'work' ? 'Deep Work' : 'Break Time'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            soundFx.setSoundEnabled(!soundEnabled);
          }}
          title="Toggle Sound"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button 
          className="btn btn-primary" 
          onClick={toggleTimer}
          style={{ padding: '12px 36px', fontSize: '1rem', borderRadius: 'var(--radius-full)' }}
        >
          {isRunning ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start Session</>}
        </button>

        <button className="btn btn-secondary" onClick={resetTimer} title="Reset Timer">
          <RotateCcw size={18} />
        </button>
      </div>

    </div>
  );
};
