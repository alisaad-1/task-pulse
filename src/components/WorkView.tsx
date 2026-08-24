import React, { useState } from 'react';
import { WorkItem } from '../types/task';
import { Briefcase, Plus, Trash2, Tag, Layers } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface WorkViewProps {
  workItems: WorkItem[];
  onOpenAddModal: () => void;
  onDeleteWorkItem: (id: string) => void;
}

export const WorkView: React.FC<WorkViewProps> = ({
  workItems,
  onOpenAddModal,
  onDeleteWorkItem
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const categories = Array.from(new Set(workItems.map(item => item.category)));

  const filteredItems = selectedCat === 'all' 
    ? workItems 
    : workItems.filter(item => item.category === selectedCat);

  const totalValue = filteredItems.reduce((acc, item) => acc + item.value, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-color)'
          }}>
            <Briefcase size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Work Dashboard
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
              Track work entries, numbers, and categories
            </p>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={() => { soundFx.playPopSound(); onOpenAddModal(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
        >
          <Plus size={18} />
          Add Work Item
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          padding: '18px 20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Entries
          </span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {filteredItems.length}
          </span>
        </div>

        <div style={{
          padding: '18px 20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Value / Sum
          </span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-color)' }}>
            {totalValue.toLocaleString()}
          </span>
        </div>

        <div style={{
          padding: '18px 20px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Categories
          </span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {categories.length}
          </span>
        </div>
      </div>

      {/* Filter bar & List */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {categories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Filter Category:
            </span>
            <button
              onClick={() => setSelectedCat('all')}
              className={`btn ${selectedCat === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 12px', fontSize: '0.8rem' }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`btn ${selectedCat === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 12px', fontSize: '0.8rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)'
          }}>
            <Layers size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
            <p style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>No work items recorded yet</p>
            <p style={{ fontSize: '0.85rem', margin: '4px 0 16px 0' }}>Click "Add Work Item" or use the bottom bar Add button to get started.</p>
            <button className="btn btn-primary" onClick={onOpenAddModal}>
              <Plus size={16} style={{ marginRight: '6px' }} />
              Add First Item
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Value</th>
                  <th style={{ padding: '12px 16px' }}>Added Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--accent-glow)',
                        color: 'var(--accent-color)'
                      }}>
                        <Tag size={14} />
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {item.value}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        className="btn-icon"
                        onClick={() => { onDeleteWorkItem(item.id); soundFx.playPopSound(); }}
                        title="Delete work item"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
