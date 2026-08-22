import React from 'react';
import { Task, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';
import { Plus, Inbox, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onNewTaskWithStatus: (status: TaskStatus) => void;
  onStartPomodoro?: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; title: string; icon: React.ReactNode; color: string }[] = [
  { id: 'backlog', title: 'Backlog', icon: <Inbox size={16} />, color: 'var(--status-backlog)' },
  { id: 'todo', title: 'To Do', icon: <ListTodo size={16} />, color: 'var(--status-todo)' },
  { id: 'in-progress', title: 'In Progress', icon: <Clock size={16} />, color: 'var(--status-inprogress)' },
  { id: 'done', title: 'Completed', icon: <CheckCircle2 size={16} />, color: 'var(--status-done)' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateStatus,
  onEditTask,
  onDeleteTask,
  onToggleSubtask,
  onNewTaskWithStatus,
  onStartPomodoro
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdateStatus(taskId, status);
      if (status === 'done') {
        soundFx.playCompleteSound();
      } else {
        soundFx.playPopSound();
      }
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '16px',
      alignItems: 'start',
      paddingBottom: '32px',
      overflowX: 'auto'
    }}>
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter(t => t.status === col.id);

        return (
          <div 
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="glass-panel"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.4)',
              minHeight: '500px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Column Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: col.color, display: 'flex', alignItems: 'center' }}>
                  {col.icon}
                </span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {col.title}
                </h3>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-secondary)'
                }}>
                  {columnTasks.length}
                </span>
              </div>

              <button 
                className="btn-icon" 
                onClick={() => onNewTaskWithStatus(col.id)}
                title={`Add task to ${col.title}`}
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Column Cards */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {columnTasks.length === 0 ? (
                <div style={{
                  height: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}>
                  <span>No tasks here</span>
                  <button 
                    onClick={() => onNewTaskWithStatus(col.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-color)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      marginTop: '6px',
                      fontWeight: 600
                    }}
                  >
                    + Add Task
                  </button>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', task.id);
                    }}
                  >
                    <TaskCard
                      task={task}
                      onUpdateStatus={onUpdateStatus}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onToggleSubtask={onToggleSubtask}
                      onStartPomodoro={onStartPomodoro}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
