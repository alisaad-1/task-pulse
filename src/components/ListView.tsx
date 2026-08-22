import React, { useState } from 'react';
import { Task, TaskStatus, Priority } from '../types/task';
import { CheckCircle2, Circle, ArrowUpDown, Calendar, Edit3, Trash2, Play, Tag } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ListViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
}

type SortField = 'title' | 'status' | 'priority' | 'dueDate';

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  onUpdateStatus,
  onEditTask,
  onDeleteTask,
  onStartPomodoro
}) => {
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortField === 'status') {
      comparison = a.status.localeCompare(b.status);
    } else if (sortField === 'priority') {
      const priorityOrder: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortField === 'dueDate') {
      comparison = (a.dueDate || '').localeCompare(b.dueDate || '');
    }
    return sortAsc ? comparison : -comparison;
  });

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgent': return <span className="badge badge-urgent">Urgent</span>;
      case 'high': return <span className="badge badge-high">High</span>;
      case 'medium': return <span className="badge badge-medium">Medium</span>;
      case 'low': return <span className="badge badge-low">Low</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <th style={{ padding: '12px 16px', width: '40px' }}>Done</th>
            <th 
              onClick={() => handleSort('title')} 
              style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Task Title <ArrowUpDown size={14} />
              </div>
            </th>
            <th 
              onClick={() => handleSort('status')} 
              style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Status <ArrowUpDown size={14} />
              </div>
            </th>
            <th 
              onClick={() => handleSort('priority')} 
              style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Priority <ArrowUpDown size={14} />
              </div>
            </th>
            <th style={{ padding: '12px 16px' }}>Category</th>
            <th 
              onClick={() => handleSort('dueDate')} 
              style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Due Date <ArrowUpDown size={14} />
              </div>
            </th>
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No tasks match your filter criteria.
              </td>
            </tr>
          ) : (
            sortedTasks.map((task) => {
              const isDone = task.status === 'done';
              return (
                <tr 
                  key={task.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background 0.2s ease',
                    opacity: isDone ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <button 
                      className="btn-icon" 
                      onClick={() => {
                        const newStatus = isDone ? 'todo' : 'done';
                        onUpdateStatus(task.id, newStatus);
                        if (newStatus === 'done') soundFx.playCompleteSound();
                        else soundFx.playPopSound();
                      }}
                      style={{ color: isDone ? 'var(--status-done)' : 'var(--text-muted)' }}
                    >
                      {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                        {task.description}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ 
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: `var(--status-${task.status.replace('-', '')})`,
                      color: '#ffffff',
                      textTransform: 'capitalize'
                    }}>
                      {task.status}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {getPriorityBadge(task.priority)}
                  </td>

                  <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={12} /> {task.category}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      {task.dueDate || 'No Date'}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {onStartPomodoro && (
                        <button className="btn-icon" onClick={() => onStartPomodoro(task)} title="Start Focus Session">
                          <Play size={16} color="var(--accent-color)" />
                        </button>
                      )}
                      <button className="btn-icon" onClick={() => onEditTask(task)} title="Edit Task">
                        <Edit3 size={16} />
                      </button>
                      <button className="btn-icon" onClick={() => onDeleteTask(task.id)} title="Delete Task">
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
