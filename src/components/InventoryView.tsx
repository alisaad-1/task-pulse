import React, { useState, useEffect } from 'react';
import { InventoryItem, Priority } from '../types/task';
import { Plus, Trash2, ShoppingCart, Tag, X, Check } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState<InventoryCategory>('food');
  const [priority, setPriority] = useState<Priority>('medium');

  const handleAdd = () => {
    if (!name.trim()) return;
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: name.trim(),
      quantity,
      category,
      priority,
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...items];
    setItems(updated);
    saveInventory(updated);
    soundFx.playCompleteSound();
    setName('');
    setQuantity(1);
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

  const handleQuantityChange = (id: string, delta: number) => {
    const updated = items.map(i =>
      i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
    );
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

  const categoryFilterOptions = ['All', ...INVENTORY_CATEGORIES];

  const filteredItems = filterCategory === 'All'
    ? items
    : items.filter(i => (i.category || '').toLowerCase() === filterCategory.toLowerCase());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '80px' }}>

      {/* Top Category Filter Pills (All, food, personal, futuretasks) */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        {categoryFilterOptions.map(cat => (
          <button
            key={cat}
            onClick={() => { setFilterCategory(cat); soundFx.playPopSound(); }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: filterCategory === cat ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
              background: filterCategory === cat ? 'var(--accent-glow)' : 'transparent',
              color: filterCategory === cat ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textTransform: cat === 'All' ? 'none' : 'lowercase'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Items List */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '40px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ShoppingCart size={40} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
            No items in {filterCategory === 'All' ? 'inventory' : filterCategory} yet
          </p>
          <button className="btn btn-secondary" onClick={() => setShowModal(true)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            + Add Item
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredItems.map(item => (
            <div key={item.id} className="glass-panel" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>

              {/* Shopping Icon */}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShoppingCart size={18} color="var(--accent-color)" />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
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

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => handleQuantityChange(item.id, -1)}
                  style={{
                    width: '28px', height: '28px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >−</button>

                <span style={{
                  minWidth: '30px',
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: item.quantity === 0 ? '#ef4444' : 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {item.quantity}
                </span>

                <button
                  onClick={() => handleQuantityChange(item.id, 1)}
                  style={{
                    width: '28px', height: '28px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >+</button>
              </div>

              {/* Delete */}
              <button className="btn-icon" onClick={() => handleDelete(item.id)}>
                <Trash2 size={16} color="#ef4444" />
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
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
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
                      padding: '8px 4px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-sm)',
                      textTransform: 'uppercase',
                      border: priority === p ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      background: priority === p ? 'var(--accent-glow)' : 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Quantity
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setQuantity(q => Math.max(0, q - 1))}
                  style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)',
                    fontSize: '1.2rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >−</button>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-color)', minWidth: '40px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-primary)',
                    fontSize: '1.2rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >+</button>
              </div>
            </div>

            {/* Save Button */}
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', borderRadius: 'var(--radius-full)' }}
            >
              <Check size={16} /> Add to Purchases Inventory
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
