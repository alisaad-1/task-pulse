import React, { useState, useEffect } from 'react';
import { InventoryItem, Priority } from '../types/task';
import { Plus, Trash2, ShoppingCart, Tag, X } from 'lucide-react';
import { soundFx } from '../utils/audio';

const INVENTORY_STORAGE_KEY = 'taskpulse_inventory_v1';

const loadInventory = (): InventoryItem[] => {
  try {
    const data = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveInventory = (items: InventoryItem[]) => {
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
};

const INVENTORY_CATEGORIES = ['food', 'personal', 'futuretasks'] as const;
type InventoryCategory = typeof INVENTORY_CATEGORIES[number];

interface InventoryViewProps {
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  isOpenModal,
  onCloseModal
}) => {
  const [items, setItems] = useState<InventoryItem[]>(loadInventory);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Sync external modal state if triggered from bottom nav FAB
  useEffect(() => {
    if (typeof isOpenModal === 'boolean') {
      setShowModal(isOpenModal);
    }
  }, [isOpenModal]);

  const handleCloseModalInternal = () => {
    setShowModal(false);
    if (onCloseModal) onCloseModal();
  };

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('food');
  const [priority, setPriority] = useState<Priority>('medium');

  const handleAdd = () => {
    if (!name.trim()) return;
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: name.trim(),
      quantity: 1,
      category,
      priority,
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...items];
    setItems(updated);
    saveInventory(updated);
    soundFx.playCompleteSound();
    setName('');
    setCategory('food');
    setPriority('medium');
    handleCloseModalInternal();
  };

  const handleDelete = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    saveInventory(updated);
    soundFx.playPopSound();
  };

  const getPriorityClass = (p?: Priority) => {
    switch (p) {
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return 'badge-medium';
    }
  };

  const filteredItems = filterCategory === 'All'
    ? items
    : items.filter(i => i.category === filterCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '30px' }}>

      {/* Header Bar */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-glow)',
            color: 'var(--accent-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShoppingCart size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Purchases Inventory
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {items.length} items listed
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => { setShowModal(true); soundFx.playPopSound(); }}
          style={{ fontSize: '0.85rem', padding: '8px 14px' }}
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['All', ...INVENTORY_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => { setFilterCategory(cat); soundFx.playPopSound(); }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: filterCategory === cat ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
              background: filterCategory === cat ? 'var(--accent-glow)' : 'var(--bg-card)',
              color: filterCategory === cat ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <ShoppingCart size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>No purchase items yet</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tap "Add Item" to list what you need to buy
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {/* Info - Full wrapping without truncation */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  lineHeight: 1.4
                }}>
                  {item.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span className={`badge ${getPriorityClass(item.priority || 'medium')}`}>
                    {(item.priority || 'medium').toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textTransform: 'lowercase'
                  }}>
                    <Tag size={10} /> {item.category}
                  </span>
                </div>
              </div>

              {/* Delete Action */}
              <button
                className="btn-icon"
                onClick={() => handleDelete(item.id)}
                style={{ padding: '6px', color: '#ef4444', flexShrink: 0 }}
                title="Delete item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModalInternal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '20px', maxWidth: '440px' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Add Purchase Item</h3>
              <button className="btn-icon" onClick={handleCloseModalInternal}><X size={20} /></button>
            </div>

            {/* Item Name */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Item Name *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Coffee beans, HDMI cable..."
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Category Button Group (food, personal, futuretasks) */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Category *
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {INVENTORY_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-sm)',
                      textTransform: 'lowercase',
                      border: category === cat ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      background: category === cat ? 'var(--accent-glow)' : 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Level */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
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

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={handleCloseModalInternal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={!name.trim()}>
                Add Item
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
