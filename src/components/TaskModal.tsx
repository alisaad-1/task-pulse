import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskStatus } from '../types/task';
import { X, Check } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  initialTask?: Task | null;
  categories?: string[];
}

const MAIN_CATEGORIES = [
  { id: 'daily', name: 'Daily Tasks' },
  { id: 'health', name: 'Health & Fitness' },
  { id: 'mental', name: 'Mental & Mind' },
  { id: 'entertainment', name: 'Entertainment' }
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('daily');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setPriority(initialTask.priority === 'urgent' ? 'high' : initialTask.priority);
      
      const taskCat = (initialTask.category || '').toLowerCase();
      if (['health', 'fitness'].some(c => taskCat.includes(c))) {
        setCategory('health');
      } else if (['mental', 'mind', 'focus', 'meditation'].some(c => taskCat.includes(c))) {
        setCategory('mental');
      } else if (['entertainment', 'leisure', 'fun', 'movies', 'gaming'].some(c => taskCat.includes(c))) {
        setCategory('entertainment');
      } else {
        setCategory('daily');
      }
    } else {
      // Reset form
      setTitle('');
      setPriority('medium');
      setCategory('daily');
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: '',
      status: initialTask ? initialTask.status : 'todo',
      priority,
      category,
      dueDate: '',
      estimatedMinutes: 30,
      subtasks: [],
      tags: []
    });

    soundFx.playPopSound();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '20px', maxWidth: '440px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Task Title *
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter task title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Category *
            </label>
            <select 
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ fontWeight: 600 }}
            >
              {MAIN_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Level */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Priority Level *
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    padding: '10px 4px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase',
                    border: priority === p ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                    background: priority === p ? 'var(--accent-glow)' : 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} /> Save Task
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
