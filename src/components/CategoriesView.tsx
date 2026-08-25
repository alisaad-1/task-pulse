import React, { useState, useRef, useCallback } from 'react';
import { Task, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Calendar, 
  Heart, 
  Smile, 
  Tv,
  Archive,
  RotateCcw,
  CheckCircle2,
  ArrowRightLeft
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface CategoriesViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onNewTaskWithCategory: (category: string) => void;
  onStartPomodoro?: (task: Task) => void;
  onArchiveCompleted?: () => void;
  onArchiveTask?: (taskId: string) => void;
  onResetCompleted?: () => void;
  onMoveTask?: (taskId: string, newCategory: string) => void;
}

interface SectionConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  matchingCategories: string[];
}

const MAIN_SECTIONS: SectionConfig[] = [
  {
    id: 'daily',
    title: 'Daily Tasks',
    icon: <Calendar size={20} />,
    color: '#38bdf8',
    matchingCategories: ['daily', 'work', 'personal', 'general', 'todo']
  },
  {
    id: 'health',
    title: 'Health & Fitness',
    icon: <Heart size={20} />,
    color: '#10b981',
    matchingCategories: ['health', 'fitness', 'wellness', 'sports']
  },
  {
    id: 'mental',
    title: 'Mental & Mind',
    icon: <Smile size={20} />,
    color: '#a855f7',
    matchingCategories: ['mental', 'mind', 'focus', 'meditation', 'learning']
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    icon: <Tv size={20} />,
    color: '#ec4899',
    matchingCategories: ['entertainment', 'leisure', 'fun', 'movies', 'gaming']
  }
];

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
};

interface DragState {
  taskId: string | null;
  task: Task | null;
  fromSection: string | null;
  ghost: HTMLElement | null;
  overSection: string | null;
  startX: number;
  startY: number;
  activated: boolean;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  tasks,
  onUpdateStatus,
  onEditTask,
  onDeleteTask,
  onToggleSubtask,
  onNewTaskWithCategory,
  onStartPomodoro,
  onArchiveCompleted,
  onArchiveTask,
  onResetCompleted,
  onMoveTask
}) => {
  // Default: all 4 category sections are collapsed on app launch
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    daily: true,
    health: true,
    mental: true,
    entertainment: true
  });
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  const dragState = useRef<DragState>({
    taskId: null,
    task: null,
    fromSection: null,
    ghost: null,
    overSection: null,
    startX: 0,
    startY: 0,
    activated: false
  });

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const toggleSection = (sectionId: string) => {
    soundFx.playPopSound();
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const activeTasks = tasks.filter(t => !t.archived);
  const totalCompletedCount = activeTasks.filter(t => t.status === 'done').length;

  const isDailyOrEntertainment = (cat: string) => {
    const c = (cat || '').toLowerCase();
    const isHealth = ['health', 'fitness', 'wellness', 'sports'].some(h => c.includes(h));
    const isMental = ['mental', 'mind', 'focus', 'meditation', 'learning'].some(m => c.includes(m));
    return !isHealth && !isMental;
  };

  const dailyAndEntCompletedCount = activeTasks.filter(t => t.status === 'done' && isDailyOrEntertainment(t.category)).length;

  const handleArchiveClick = () => {
    if (dailyAndEntCompletedCount === 0) return;
    soundFx.playCompleteSound();
    if (onArchiveCompleted) onArchiveCompleted();
  };

  const completedSubtasksTotal = activeTasks.reduce((acc, t) => acc + (t.subtasks ? t.subtasks.filter(st => st.completed).length : 0), 0);
  const canReset = totalCompletedCount > 0 || completedSubtasksTotal > 0;

  const handleResetClick = () => {
    if (!canReset) return;
    soundFx.playPopSound();
    if (onResetCompleted) onResetCompleted();
  };

  const getSectionAtPoint = useCallback((x: number, y: number): string | null => {
    for (const [sectionId, el] of Object.entries(sectionRefs.current)) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return sectionId;
      }
    }
    return null;
  }, []);

  const createGhost = (task: Task, tx: number, ty: number): HTMLElement => {
    const ghost = document.createElement('div');
    ghost.textContent = '✦ ' + task.title;
    Object.assign(ghost.style, {
      position: 'fixed',
      top: `${ty - 22}px`,
      left: `${tx - 110}px`,
      width: '220px',
      padding: '10px 14px',
      background: 'linear-gradient(135deg, rgba(168,85,247,0.95), rgba(99,102,241,0.95))',
      color: '#fff',
      fontSize: '0.86rem',
      fontWeight: '700',
      borderRadius: '12px',
      boxShadow: '0 10px 35px rgba(168,85,247,0.6)',
      pointerEvents: 'none',
      zIndex: '9999',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      transform: 'rotate(-2deg) scale(1.05)',
      border: '1.5px solid rgba(255,255,255,0.3)',
      backdropFilter: 'blur(8px)'
    });
    document.body.appendChild(ghost);
    return ghost;
  };

  // Long press drag start (only activates after holding for 350ms)
  const handleTouchStart = useCallback((e: React.TouchEvent, task: Task, fromSectionId: string) => {
    const touch = e.touches[0];
    clearLongPressTimer();

    dragState.current = {
      taskId: task.id,
      task,
      fromSection: fromSectionId,
      ghost: null,
      overSection: null,
      startX: touch.clientX,
      startY: touch.clientY,
      activated: false
    };

    longPressTimerRef.current = setTimeout(() => {
      if (dragState.current.taskId === task.id) {
        dragState.current.activated = true;
        dragState.current.ghost = createGhost(task, dragState.current.startX, dragState.current.startY);
        setDraggingTaskId(task.id);
        if (navigator.vibrate) {
          navigator.vibrate(35);
        }
        soundFx.playPopSound();
      }
    }, 350);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const ds = dragState.current;
    if (!ds.taskId || !ds.task) return;

    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - ds.startX);
    const dy = Math.abs(touch.clientY - ds.startY);

    // If moved more than 8px before long press fires, cancel long press (allow smooth normal scroll)
    if (!ds.activated) {
      if (dx > 8 || dy > 8) {
        clearLongPressTimer();
      }
      return;
    }

    // Drag mode is active -> prevent page scroll
    if (e.cancelable) {
      e.preventDefault();
    }

    if (ds.ghost) {
      ds.ghost.style.top = `${touch.clientY - 22}px`;
      ds.ghost.style.left = `${touch.clientX - 110}px`;
    }

    const over = getSectionAtPoint(touch.clientX, touch.clientY);
    if (over !== ds.overSection) {
      ds.overSection = over;
      setDragOverSection(over);
    }
  }, [getSectionAtPoint]);

  const handleTouchEnd = useCallback(() => {
    clearLongPressTimer();
    const ds = dragState.current;

    if (ds.ghost) {
      document.body.removeChild(ds.ghost);
      ds.ghost = null;
    }

    if (ds.activated && ds.taskId && ds.overSection && ds.overSection !== ds.fromSection && onMoveTask) {
      onMoveTask(ds.taskId, ds.overSection);
      soundFx.playCompleteSound();
    }

    dragState.current = {
      taskId: null, task: null, fromSection: null,
      ghost: null, overSection: null,
      startX: 0, startY: 0, activated: false
    };
    setDraggingTaskId(null);
    setDragOverSection(null);
  }, [onMoveTask]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '20px' }}>

      {/* Top Action Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '10px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: 'var(--radius-sm)',
            background: totalCompletedCount > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            color: totalCompletedCount > 0 ? 'var(--status-done)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Completed: {totalCompletedCount} Tasks
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowRightLeft size={11} />
              Hold task to drag between sections
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleResetClick}
            disabled={!canReset}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 12px', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              background: canReset ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
              color: canReset ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.8rem',
              cursor: canReset ? 'pointer' : 'default',
              transition: 'all 0.2s ease'
            }}
          >
            <RotateCcw size={13} />
            <span>Reset ({totalCompletedCount})</span>
          </button>

          <button
            onClick={handleArchiveClick}
            disabled={dailyAndEntCompletedCount === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 14px', borderRadius: 'var(--radius-full)',
              border: 'none',
              background: dailyAndEntCompletedCount > 0
                ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                : 'rgba(255,255,255,0.06)',
              color: dailyAndEntCompletedCount > 0 ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.8rem',
              cursor: dailyAndEntCompletedCount > 0 ? 'pointer' : 'default',
              boxShadow: dailyAndEntCompletedCount > 0 ? '0 4px 14px rgba(168,85,247,0.3)' : 'none',
              transition: 'all 0.25s ease'
            }}
          >
            <Archive size={14} />
            <span>Archive ({dailyAndEntCompletedCount})</span>
          </button>
        </div>
      </div>

      {/* 4 Category Sections */}
      {MAIN_SECTIONS.map((section) => {
        const sectionTasks = activeTasks
          .filter(t => {
            const taskCat = (t.category || '').toLowerCase();
            if (section.id === 'daily') {
              return section.matchingCategories.includes(taskCat) ||
                (!['health', 'fitness', 'mental', 'mind', 'focus', 'entertainment', 'leisure', 'fun'].includes(taskCat));
            }
            return section.matchingCategories.some(c => taskCat.includes(c));
          })
          .sort((a, b) => {
            const rankA = PRIORITY_ORDER[a.priority] || 2;
            const rankB = PRIORITY_ORDER[b.priority] || 2;
            return rankB - rankA;
          });

        const isCollapsed = Boolean(collapsedSections[section.id]);
        const completedCount = sectionTasks.filter(t => t.status === 'done').length;
        const isDropTarget = dragOverSection === section.id;
        const isDragSource = sectionTasks.some(t => t.id === draggingTaskId);

        return (
          <div
            key={section.id}
            ref={el => { sectionRefs.current[section.id] = el; }}
            className="glass-panel"
            style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: isDropTarget ? `2px solid ${section.color}` : '1px solid var(--border-color)',
              background: isDropTarget ? `${section.color}12` : 'var(--bg-card)',
              transition: 'all 0.18s ease',
              opacity: isDragSource ? 0.72 : 1,
              transform: isDropTarget ? 'scale(1.012)' : 'scale(1)',
              boxShadow: isDropTarget ? `0 0 28px ${section.color}44` : 'none'
            }}
          >
            {/* Accordion Header */}
            <div
              onClick={() => toggleSection(section.id)}
              style={{
                padding: '14px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', userSelect: 'none',
                background: isCollapsed ? 'transparent' : 'rgba(255,255,255,0.03)',
                borderBottom: isCollapsed ? 'none' : '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                </div>
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: `${section.color}20`,
                  color: section.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {section.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {section.title}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: isDropTarget ? section.color : 'var(--text-secondary)', marginTop: '2px', fontWeight: isDropTarget ? 700 : 400 }}>
                    {isDropTarget && !isDragSource
                      ? '← Drop here to move task'
                      : `${completedCount} of ${sectionTasks.length} completed`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '0.8rem', fontWeight: 800,
                  padding: '3px 10px', borderRadius: 'var(--radius-full)',
                  background: section.color, color: '#ffffff',
                  transform: isDropTarget ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.2s ease'
                }}>
                  {sectionTasks.length}
                </span>
                <button
                  className="btn-icon"
                  onClick={(e) => { e.stopPropagation(); soundFx.playPopSound(); onNewTaskWithCategory(section.id); }}
                  title={`Add task to ${section.title}`}
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', borderRadius: '50%', padding: '6px' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Drop Zone Banner */}
            {isDropTarget && !isDragSource && (
              <div style={{
                padding: '8px 16px',
                background: `${section.color}20`,
                borderBottom: `1px dashed ${section.color}80`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                color: section.color, fontSize: '0.82rem', fontWeight: 700
              }}>
                <ArrowRightLeft size={14} />
                Move to {section.title}
              </div>
            )}

            {/* Tasks list */}
            {!isCollapsed && (
              <div style={{ padding: '14px 16px' }}>
                {sectionTasks.length === 0 ? (
                  <div style={{
                    padding: '24px', textAlign: 'center',
                    border: isDropTarget ? `2px dashed ${section.color}` : '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: isDropTarget ? section.color : 'var(--text-secondary)',
                    background: isDropTarget ? `${section.color}08` : 'transparent',
                    transition: 'all 0.2s ease'
                  }}>
                    {isDropTarget ? (
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>
                        Drop here → {section.title}
                      </p>
                    ) : (
                      <>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                          No tasks in {section.title} yet
                        </p>
                        <button
                          className="btn btn-secondary"
                          onClick={() => onNewTaskWithCategory(section.id)}
                          style={{ marginTop: '10px', fontSize: '0.8rem', padding: '6px 12px' }}
                        >
                          <Plus size={14} /> Add Task
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sectionTasks.map((task) => (
                      <div
                        key={task.id}
                        style={{
                          opacity: draggingTaskId === task.id ? 0.35 : 1,
                          transition: 'opacity 0.15s ease',
                          touchAction: 'pan-y'
                        }}
                        onTouchStart={(e) => handleTouchStart(e, task, section.id)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                      >
                        <TaskCard
                          task={task}
                          onUpdateStatus={onUpdateStatus}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          onToggleSubtask={onToggleSubtask}
                          onStartPomodoro={onStartPomodoro}
                          onArchive={onArchiveTask}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
