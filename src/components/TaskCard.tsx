import React, { useState } from 'react';
import { Task, TaskStatus } from '../types/task';
import { 
  CheckCircle2, 
  Circle, 
  MoreVertical, 
  Trash2, 
  Archive,
  ListCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onStartPomodoro?: (task: Task) => void;
  onArchive?: (taskId: string) => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdateStatus,
  onEdit,
  onDelete,
  onToggleSubtask,
  onArchive
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const isDone = task.status === 'done';

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(st => st.completed).length;

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
        padding: '14px 16px',
        marginBottom: '8px',
        opacity: isDone ? 0.75 : 1,
        transition: 'all 0.25s ease',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Header: Checkbox, Title, Actions Menu */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
        <button 
          onClick={handleStatusClick}
          className="btn-icon"
          style={{ 
            color: isDone ? 'var(--status-done)' : 'var(--text-muted)',
            padding: '2px',
            flexShrink: 0,
            marginTop: '1px'
          }}
          title={isDone ? "Mark as Incomplete" : "Mark as Done"}
        >
          {isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 
            onClick={() => onEdit(task)}
            style={{ 
              fontSize: '0.98rem', 
              fontWeight: 600, 
              color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: isDone ? 'line-through' : 'none',
              cursor: 'pointer',
              whiteSpace: 'normal',
              wordBreak: 'normal',
              overflowWrap: 'break-word',
              lineHeight: 1.45,
              margin: 0,
              textAlign: 'start'
            }}
          >
            {task.title}
          </h4>
        </div>

        {/* Quick Menu Button */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
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
                width: '130px'
              }}
            >
              {onArchive && (
                <button 
                  onClick={() => { setShowMenu(false); onArchive(task.id); soundFx.playPopSound(); }}
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
                  <Archive size={14} /> Archive
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

      {/* Subtasks List on Card */}
      {subtasks.length > 0 && (
        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
          <div 
            onClick={() => setShowSubtasks(!showSubtasks)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              marginBottom: showSubtasks ? '6px' : '0'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ListCheck size={12} color="var(--accent-color)" /> Subtasks ({completedSubtasks}/{subtasks.length})
            </span>
            {showSubtasks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>

          {showSubtasks && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              {subtasks.map((st) => (
                <label
                  key={st.id}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    margin: 0,
                    width: '100%',
                    padding: '2px 0'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => {
                      if (onToggleSubtask) {
                        onToggleSubtask(task.id, st.id);
                        soundFx.playPopSound();
                      }
                    }}
                    style={{ 
                      cursor: 'pointer', 
                      accentColor: 'var(--accent-color)',
                      width: '16px',
                      height: '16px',
                      flexShrink: 0,
                      margin: 0
                    }}
                  />
                  <span style={{
                    flex: 1,
                    minWidth: 0,
                    color: st.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: st.completed ? 'line-through' : 'none',
                    whiteSpace: 'normal',
                    wordBreak: 'normal',
                    overflowWrap: 'break-word',
                    lineHeight: 1.4,
                    textAlign: 'start'
                  }}>
                    {st.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer: Priority Badge Only */}
      <div style={{
        marginTop: '8px',
        paddingTop: '6px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '8px'
      }}>
        <span className={`badge ${getPriorityClass(task.priority)}`}>
          {task.priority.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
