import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskStatus, SubTask } from '../types/task';
import { X, Check, Plus, ListCheck, Trash2 } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  initialTask?: Task | null;
  defaultCategory?: string;
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
  initialTask,
  defaultCategory = 'daily'
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState(defaultCategory);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setPriority(initialTask.priority === 'urgent' ? 'high' : initialTask.priority);
      setSubtasks(initialTask.subtasks || []);
      setNewSubtaskTitle('');
      
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
      // Reset form with selected category
      setTitle('');
      setPriority('medium');
      const defCat = (defaultCategory || 'daily').toLowerCase();
      if (['health', 'fitness'].some(c => defCat.includes(c))) {
        setCategory('health');
      } else if (['mental', 'mind', 'focus', 'meditation'].some(c => defCat.includes(c))) {
        setCategory('mental');
      } else if (['entertainment', 'leisure', 'fun', 'movies', 'gaming'].some(c => defCat.includes(c))) {
        setCategory('entertainment');
      } else {
        setCategory('daily');
      }
      setSubtasks([]);
      setNewSubtaskTitle('');
    }
  }, [initialTask, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSt: SubTask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    setSubtasks(prev => [...prev, newSt]);
    setNewSubtaskTitle('');
    soundFx.playPopSound();
  };

  const handleRemoveSubtask = (stId: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== stId));
    soundFx.playPopSound();
  };

  const handleToggleSubtaskInModal = (stId: string) => {
    setSubtasks(prev => prev.map(st => st.id === stId ? { ...st, completed: !st.completed } : st));
    soundFx.playPopSound();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];

    onSave({
      title: title.trim(),
      description: '',
      status: initialTask ? initialTask.status : 'todo',
      priority,
      category,
      dueDate: initialTask ? (initialTask.dueDate || todayStr) : todayStr,
      estimatedMinutes: 30,
      subtasks,
      tags: []
    });

    soundFx.playPopSound();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          padding: '20px', 
          maxWidth: '440px', 
          maxHeight: '90dvh', 
          overflowY: 'auto' 
        }}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                const isSelected = priority === p;
                const activeBorder = p === 'high' ? '#ff3b30' : p === 'medium' ? '#f59e0b' : '#38bdf8';
                const activeBg = p === 'high' ? 'rgba(255, 59, 48, 0.18)' : p === 'medium' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(56, 189, 248, 0.18)';
                const activeColor = p === 'high' ? '#ff3b30' : p === 'medium' ? '#f59e0b' : '#38bdf8';

                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    style={{
                      flex: 1,
                      padding: '10px 4px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      borderRadius: 'var(--radius-sm)',
                      textTransform: 'uppercase',
                      border: isSelected ? `2px solid ${activeBorder}` : '1px solid var(--border-color)',
                      background: isSelected ? activeBg : 'transparent',
                      color: isSelected ? activeColor : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtasks Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ListCheck size={15} color="var(--accent-color)" /> Subtasks ({subtasks.length})
              </span>
              {subtasks.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {subtasks.filter(s => s.completed).length}/{subtasks.length} done
                </span>
              )}
            </label>

            {/* Add Subtask input row */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Add a subtask step..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }}
              />
              <button
                type="button"
                onClick={() => handleAddSubtask()}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Subtasks List */}
            {subtasks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-color)',
                      gap: '8px'
                    }}
                  >
                    <label 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        flex: 1, 
                        minWidth: 0, 
                        cursor: 'pointer',
                        margin: 0
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtaskInModal(st.id)}
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
                        fontSize: '0.84rem',
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

                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="btn-icon"
                      style={{ padding: '2px', color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
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
