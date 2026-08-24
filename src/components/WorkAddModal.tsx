import React, { useState } from 'react';
import { X, Plus, Hash, Tag } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface WorkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (value: number, category: string) => void;
  categories?: string[];
}

export const WorkAddModal: React.FC<WorkAddModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  categories = ['Development', 'Design', 'Marketing', 'Sales', 'General']
}) => {
  const [value, setValue] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0] || 'General');
  const [customCategory, setCustomCategory] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value);
    const selectedCategory = category === 'custom' ? customCategory.trim() : category;
    
    if (!isNaN(numValue) && selectedCategory) {
      onAdd(numValue, selectedCategory);
      setValue('');
      setCustomCategory('');
      soundFx.playPopSound();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '450px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={22} style={{ color: 'var(--accent-color)' }} />
            Add Work Item
          </h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Value / Amount *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="any"
                className="input-field"
                placeholder="e.g. 8 (hours, units, points)"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Category *
            </label>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
              <option value="custom">+ Custom Category</option>
            </select>
          </div>

          {category === 'custom' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                Custom Category Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} />
              Add Work
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
