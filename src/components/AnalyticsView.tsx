import React, { useState } from 'react';
import { Task, Priority } from '../types/task';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Flame, 
  AlertTriangle, 
  TrendingUp, 
  CheckSquare,
  Archive,
  RotateCcw,
  Trash2,
  Calendar,
  Heart,
  Smile,
  Tv,
  Tag
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface AnalyticsViewProps {
  tasks: Task[];
  onRestoreTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onClearArchive?: () => void;
}

interface CategoryProgress {
  id: string;
  title: string;
  color: string;
  icon: React.ReactNode;
  total: number;
  completed: number;
  percentage: number;
}

const formatDateLabel = (dateStr: string): string => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  tasks,
  onRestoreTask,
  onDeleteTask,
  onClearArchive
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'archive'>('stats');
  const [selectedArchiveDate, setSelectedArchiveDate] = useState<string>('all');

  const archivedTasks = tasks.filter(t => t.archived);
  const activeTasks = tasks.filter(t => !t.archived);

  const totalTasks = activeTasks.length;
  const completedTasks = activeTasks.filter(t => t.status === 'done').length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = activeTasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Time metrics
  const totalEstimatedMins = activeTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
  const totalSpentMins = activeTasks.reduce((sum, t) => sum + (t.timeSpentMinutes || 0), 0);

  // Priority Breakdown
  const priorityCounts: Record<Priority, number> = {
    urgent: activeTasks.filter(t => t.priority === 'urgent').length,
    high: activeTasks.filter(t => t.priority === 'high').length,
    medium: activeTasks.filter(t => t.priority === 'medium').length,
    low: activeTasks.filter(t => t.priority === 'low').length,
  };

  // 4 Main Categories Completion Calculation
  const categoriesConfig = [
    {
      id: 'daily',
      title: 'Daily Tasks',
      color: '#38bdf8',
      icon: <Calendar size={16} />,
      matches: (cat: string) => ['daily', 'work', 'personal', 'general', 'todo'].includes(cat) || 
        (!['health', 'fitness', 'mental', 'mind', 'focus', 'entertainment', 'leisure', 'fun'].includes(cat))
    },
    {
      id: 'health',
      title: 'Health & Fitness',
      color: '#10b981',
      icon: <Heart size={16} />,
      matches: (cat: string) => ['health', 'fitness', 'wellness', 'sports'].some(c => cat.includes(c))
    },
    {
      id: 'mental',
      title: 'Mental & Mind',
      color: '#a855f7',
      icon: <Smile size={16} />,
      matches: (cat: string) => ['mental', 'mind', 'focus', 'meditation', 'learning'].some(c => cat.includes(c))
    },
    {
      id: 'entertainment',
      title: 'Entertainment',
      color: '#ec4899',
      icon: <Tv size={16} />,
      matches: (cat: string) => ['entertainment', 'leisure', 'fun', 'movies', 'gaming'].some(c => cat.includes(c))
    }
  ];

  const categoryProgressList: CategoryProgress[] = categoriesConfig.map(catCfg => {
    const catTasks = activeTasks.filter(t => {
      const taskCat = (t.category || '').toLowerCase();
      return catCfg.matches(taskCat);
    });

    const total = catTasks.length;
    const completed = catTasks.filter(t => t.status === 'done').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      id: catCfg.id,
      title: catCfg.title,
      color: catCfg.color,
      icon: catCfg.icon,
      total,
      completed,
      percentage
    };
  });

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'badge-urgent';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return 'badge-medium';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '40px' }}>
      
      {/* Top Segmented Tab Switcher: Stats vs Archive */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '6px', 
          display: 'flex', 
          gap: '6px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)'
        }}
      >
        <button
          onClick={() => { setActiveTab('stats'); soundFx.playPopSound(); }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'stats' ? 'var(--accent-glow)' : 'transparent',
            color: activeTab === 'stats' ? 'var(--accent-color)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <BarChart3 size={18} />
          <span>Stats & Insights</span>
        </button>

        <button
          onClick={() => { setActiveTab('archive'); soundFx.playPopSound(); }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'archive' ? 'var(--accent-glow)' : 'transparent',
            color: activeTab === 'archive' ? 'var(--accent-color)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Archive size={18} />
          <span>Archive ({archivedTasks.length})</span>
        </button>
      </div>

      {/* TAB 1: ARCHIVE VIEW */}
      {activeTab === 'archive' && (() => {
        // Build sorted unique date list from archivedAt
        const archiveDates = Array.from(
          new Set(
            archivedTasks
              .map(t => t.archivedAt ? t.archivedAt.split('T')[0] : null)
              .filter(Boolean) as string[]
          )
        ).sort((a, b) => b.localeCompare(a)); // newest first

        const visibleTasks = selectedArchiveDate === 'all'
          ? archivedTasks
          : archivedTasks.filter(t =>
              t.archivedAt && t.archivedAt.split('T')[0] === selectedArchiveDate
            );

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Archive Header Info & Clear Action */}
            <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Archived Tasks ({archivedTasks.length})
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedArchiveDate === 'all'
                    ? 'Showing all archived tasks'
                    : `Showing ${visibleTasks.length} task${visibleTasks.length !== 1 ? 's' : ''} archived on ${formatDateLabel(selectedArchiveDate)}`}
                </div>
              </div>

              {archivedTasks.length > 0 && onClearArchive && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to permanently clear all archived tasks?')) {
                      onClearArchive();
                      soundFx.playPopSound();
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '6px 10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <Trash2 size={13} /> Clear All
                </button>
              )}
            </div>

            {/* Date Filter Bar */}
            {archiveDates.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {/* "All" pill */}
                <button
                  onClick={() => { setSelectedArchiveDate('all'); soundFx.playPopSound(); }}
                  style={{
                    flexShrink: 0,
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: selectedArchiveDate === 'all' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                    background: selectedArchiveDate === 'all' ? 'var(--accent-glow)' : 'var(--bg-card)',
                    color: selectedArchiveDate === 'all' ? 'var(--accent-color)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  All ({archivedTasks.length})
                </button>

                {/* One pill per unique archive date */}
                {archiveDates.map(dateStr => {
                  const countForDate = archivedTasks.filter(t =>
                    t.archivedAt && t.archivedAt.split('T')[0] === dateStr
                  ).length;
                  const isSelected = selectedArchiveDate === dateStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => { setSelectedArchiveDate(dateStr); soundFx.playPopSound(); }}
                      style={{
                        flexShrink: 0,
                        padding: '6px 16px',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--accent-glow)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Calendar size={12} />
                      {formatDateLabel(dateStr)}
                      <span style={{
                        background: isSelected ? 'var(--accent-color)' : 'rgba(255,255,255,0.12)',
                        color: isSelected ? '#fff' : 'var(--text-muted)',
                        borderRadius: '999px',
                        padding: '1px 7px',
                        fontSize: '0.72rem',
                        fontWeight: 800
                      }}>
                        {countForDate}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Archived Tasks List */}
            {archivedTasks.length === 0 ? (
              <div className="glass-panel" style={{
                padding: '60px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Archive size={24} color="var(--text-muted)" />
                </div>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Archive is empty
                </p>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                  When you complete tasks on the Tasks page and tap "Archive", they will be safely preserved here.
                </p>
              </div>
            ) : visibleTasks.length === 0 ? (
              <div className="glass-panel" style={{
                padding: '40px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Calendar size={28} color="var(--text-muted)" />
                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  No tasks archived on {formatDateLabel(selectedArchiveDate)}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {visibleTasks.map((task) => (
                  <div 
                    key={task.id}
                    className="glass-panel"
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ 
                        fontSize: '0.98rem', 
                        fontWeight: 700, 
                        margin: 0, 
                        color: 'var(--text-primary)',
                        whiteSpace: 'normal',
                        wordBreak: 'normal',
                        overflowWrap: 'break-word',
                        lineHeight: 1.45
                      }}>
                        {task.title}
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span className={`badge ${getPriorityClass(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>

                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Tag size={10} /> {task.category}
                        </span>

                        {task.archivedAt && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Archive size={10} /> {formatDateLabel(task.archivedAt.split('T')[0])}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions: Restore & Delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {onRestoreTask && (
                        <button
                          onClick={() => { onRestoreTask(task.id); soundFx.playPopSound(); }}
                          className="btn btn-secondary"
                          title="Restore to active tasks"
                          style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <RotateCcw size={13} /> Restore
                        </button>
                      )}

                      {onDeleteTask && (
                        <button
                          onClick={() => { onDeleteTask(task.id); soundFx.playPopSound(); }}
                          className="btn-icon"
                          title="Delete permanently"
                          style={{ padding: '6px', color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        );
      })()}

      {/* TAB 2: REGULAR STATS & INSIGHTS */}
      {activeTab === 'stats' && (
        <>
          {/* Top Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-done)' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overall Completion</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{completionRate}%</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{completedTasks} of {totalTasks} active done</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
                <Flame size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Productivity Streak</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>5 Days</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Keep up the momentum!</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Time Logged</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{(totalSpentMins / 60).toFixed(1)}h</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Estimated: {(totalEstimatedMins / 60).toFixed(1)}h</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Overdue Tasks</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{overdueTasks}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Requires immediate action</div>
              </div>
            </div>

          </div>

          {/* Analytics Visual Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            
            {/* Category Completion Rates Bar Chart */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <CheckSquare size={20} color="var(--accent-color)" />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Category Completion Rates
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Percentage of tasks completed per section
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {categoryProgressList.map((cat) => (
                  <div key={cat.id}>
                    {/* Header: Title + Ratio + Percentage */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '26px', 
                          height: '26px', 
                          borderRadius: 'var(--radius-xs)', 
                          background: `${cat.color}20`, 
                          color: cat.color, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          {cat.icon}
                        </div>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                          {cat.title}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {cat.completed}/{cat.total}
                        </span>
                        <span style={{ 
                          fontSize: '0.85rem', 
                          fontWeight: 800, 
                          color: cat.total === 0 ? 'var(--text-muted)' : cat.percentage === 100 ? 'var(--status-done)' : cat.color 
                        }}>
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: '9px', borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${cat.percentage}%`, 
                          borderRadius: 'var(--radius-full)',
                          background: cat.color,
                          boxShadow: cat.percentage > 0 ? `0 0 10px ${cat.color}80` : 'none',
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <TrendingUp size={20} color="#ff3b30" />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Priority Distribution
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Active tasks breakdown by urgency level
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(['high', 'medium', 'low'] as Priority[]).map((priority) => {
                  const count = priorityCounts[priority] + (priority === 'high' ? priorityCounts['urgent'] : 0);
                  const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                  const pColor = priority === 'high' ? '#ff3b30' : priority === 'medium' ? '#f59e0b' : '#38bdf8';

                  return (
                    <div key={priority}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                        <span style={{ textTransform: 'uppercase', color: pColor, fontWeight: 800 }}>
                          {priority}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {count} tasks ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: '9px', borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            width: `${pct}%`, 
                            borderRadius: 'var(--radius-full)',
                            background: pColor,
                            boxShadow: pct > 0 ? `0 0 10px ${pColor}80` : 'none',
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
