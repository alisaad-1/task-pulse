import React, { useState } from 'react';
import { Task, TaskStatus } from '../types/task';
import { 
  CheckCircle2, 
  Circle, 
  MoreVertical, 
  Trash2, 
  Edit3
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdateStatus,
  onEdit,
  onDelete,
  onStartPomodoro
}) => {
  const [showMenu, setShowMenu] = useState(false);
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={handleStatusClick}
          className="btn-icon"
          style={{ 
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
              wordBreak: 'break-word',
              margin: 0
            }}
          >
            {task.title}
          </h4>
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

      {/* Footer: Priority Badge Only */}
      <div style={{
        marginTop: '10px',
        paddingTop: '8px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
        <span className={`badge ${getPriorityClass(task.priority)}`}>
          {task.priority.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
