import React, { useState } from 'react';
import { Task, TaskStatus } from '../types/task';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Play,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdateStatus,
  onEdit,
  onDelete,
  onToggleSubtask,
  onStartPomodoro
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const isDone = task.status === 'done';

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: TaskStatus = isDone ? 'todo' : 'done';
    if (nextStatus === 'done') {
      soundFx.playCompleteSound();
    } else {
      soundFx.playPopSound();
    }
    onUpdateStatus(task.id, nextStatus);
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'badge-urgent';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return 'badge-medium';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0)) && !isDone;

  return (
    <div 
      className={`glass-panel task-card ${isDone ? 'completed-card' : ''}`}
      style={{
        padding: '16px',
        marginBottom: '12px',
        opacity: isDone ? 0.75 : 1,
        transition: 'all 0.25s ease',
        position: 'relative'
      }}
    >
      {/* Top Header: Checkbox, Title, Actions Menu */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <button 
          onClick={handleStatusClick}
          className="btn-icon"
          style={{ 
            marginTop: '2px',
            color: isDone ? 'var(--status-done)' : 'var(--text-muted)',
            padding: '2px'
          }}
          title={isDone ? "Mark as Incomplete" : "Mark as Done"}
        >
          {isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 
            onClick={() => onEdit(task)}
            style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: isDone ? 'line-through' : 'none',
              cursor: 'pointer',
              wordBreak: 'break-word'
            }}
          >
            {task.title}
          </h4>

          {task.description && (
            <p style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-secondary)', 
              marginTop: '4px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {task.description}
            </p>
          )}
        </div>

        {/* Quick Menu Button */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn-icon"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: 'var(--bg-modal)',
                border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px',
                boxShadow: 'var(--glass-shadow)',
                zIndex: 50,
                width: '140px'
              }}
            >
              <button 
                onClick={() => { setShowMenu(false); onEdit(task); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                <Edit3 size={14} /> Edit Task
              </button>

              {onStartPomodoro && (
                <button 
                  onClick={() => { setShowMenu(false); onStartPomodoro(task); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-color)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  <Play size={14} /> Focus Session
                </button>
              )}

              <button 
                onClick={() => { setShowMenu(false); onDelete(task.id); soundFx.playPopSound(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subtasks Progress Bar & Toggle */}
      {totalSubtasks > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div 
            onClick={() => setShowSubtasks(!showSubtasks)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginBottom: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckSquare size={14} />
              <span>Subtasks ({completedSubtasks}/{totalSubtasks})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{progressPercent}%</span>
              {showSubtasks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </div>

          <div style={{
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: progressPercent === 100 ? 'var(--status-done)' : 'var(--accent-color)',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Subtask list */}
          {showSubtasks && (
            <div style={{ marginTop: '8px', paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {task.subtasks.map((st) => (
                <div 
                  key={st.id}
                  onClick={() => { onToggleSubtask(task.id, st.id); soundFx.playPopSound(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.82rem',
                    color: st.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                    textDecoration: st.completed ? 'line-through' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {st.completed ? <CheckCircle2 size={14} color="var(--status-done)" /> : <Circle size={14} />}
                  <span>{st.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meta Footer: Priority Badge, Category Tag, Due Date */}
      <div style={{
        marginTop: '14px',
        paddingTop: '10px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={`badge ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>

          {task.category && (
            <span style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Tag size={10} />
              {task.category}
            </span>
          )}
        </div>

        {task.dueDate && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            fontSize: '0.78rem',
            color: isOverdue ? '#ef4444' : 'var(--text-muted)',
            fontWeight: isOverdue ? 600 : 400
          }}>
            <Calendar size={13} />
            <span>{task.dueDate} {isOverdue && '(Overdue)'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
