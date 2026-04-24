import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaBoxes, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';

const API = '/api/inventory';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { item_name: '', category: '', quantity: '', unit: '', reorder_level: '', cost_per_unit: '', supplier: '', location: '', status: 'in_stock', notes: '' };

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    try { const res = await axios.get(API, { headers: headers() }); setItems(Array.isArray(res.data) ? res.data : []); } catch { setItems([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(emptyForm); setEditing(false); setShowForm(true); };
  const openDetail = (item) => { setSelected(item); setShowDetail(true); };
  const openEdit = () => { setForm({ ...emptyForm, ...selected }); setEditing(true); setShowDetail(false); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing && selected) { await axios.put(`${API}/${selected.id}`, form, { headers: headers() }); }
      else { await axios.post(API, form, { headers: headers() }); }
      setShowForm(false); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this inventory item?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const statusBadge = (status) => {
    const map = { in_stock: 'badge-success', low_stock: 'badge-warning', out_of_stock: 'badge-danger', ordered: 'badge-info' };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status?.replace(/_/g, ' ') || 'unknown'}</span>;
  };

  const isLowStock = (item) => item.reorder_level && item.quantity <= item.reorder_level;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaBoxes style={{ marginRight: 10, color: '#7E57C2' }} />Supply Inventory</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Add Item</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Item Name</th><th>Category</th><th>Quantity</th><th>Supplier</th><th>Location</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="table-empty"><p>No inventory items found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)} style={isLowStock(item) ? { backgroundColor: '#fff3e0' } : {}}>
                <td><strong>{item.item_name}</strong></td>
                <td>{item.category}</td>
                <td>{item.quantity} {item.unit}</td>
                <td>{item.supplier || 'N/A'}</td>
                <td>{item.location || 'N/A'}</td>
                <td>{statusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Inventory Details"
        footer={<div className="btn-group"><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-label">Item Name</div><div className="detail-value">{selected.item_name}</div></div>
            <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
            <div className="detail-item"><div className="detail-label">Category</div><div className="detail-value">{selected.category || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Quantity</div><div className="detail-value">{selected.quantity} {selected.unit}</div></div>
            <div className="detail-item"><div className="detail-label">Reorder Level</div><div className="detail-value">{selected.reorder_level || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Cost Per Unit</div><div className="detail-value">{selected.cost_per_unit ? `$${selected.cost_per_unit}` : 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Supplier</div><div className="detail-value">{selected.supplier || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Location</div><div className="detail-value">{selected.location || 'N/A'}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Notes</div><div className="detail-value">{selected.notes || 'N/A'}</div></div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Item' : 'Add Inventory Item'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Item Name</label><input className="form-control" name="item_name" value={form.item_name} onChange={onChange} required /></div>
            <div className="form-group"><label>Category</label>
              <select className="form-control" name="category" value={form.category} onChange={onChange}>
                <option value="">Select...</option><option value="cleaning">Cleaning</option><option value="food">Food</option><option value="art_supplies">Art Supplies</option><option value="office">Office</option><option value="safety">Safety</option><option value="toys">Toys</option><option value="furniture">Furniture</option><option value="medical">Medical</option><option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Quantity</label><input className="form-control" type="number" name="quantity" value={form.quantity} onChange={onChange} required min="0" /></div>
            <div className="form-group"><label>Unit</label>
              <select className="form-control" name="unit" value={form.unit} onChange={onChange}>
                <option value="">Select...</option><option value="pcs">Pieces</option><option value="boxes">Boxes</option><option value="packs">Packs</option><option value="bottles">Bottles</option><option value="rolls">Rolls</option><option value="lbs">Pounds</option><option value="gal">Gallons</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Reorder Level</label><input className="form-control" type="number" name="reorder_level" value={form.reorder_level} onChange={onChange} min="0" /></div>
            <div className="form-group"><label>Cost Per Unit ($)</label><input className="form-control" type="number" step="0.01" name="cost_per_unit" value={form.cost_per_unit} onChange={onChange} min="0" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Supplier</label><input className="form-control" name="supplier" value={form.supplier} onChange={onChange} /></div>
            <div className="form-group"><label>Location</label><input className="form-control" name="location" value={form.location} onChange={onChange} placeholder="e.g. Storage Room A" /></div>
          </div>
          <div className="form-group"><label>Status</label>
            <select className="form-control" name="status" value={form.status} onChange={onChange}>
              <option value="in_stock">In Stock</option><option value="low_stock">Low Stock</option><option value="out_of_stock">Out of Stock</option><option value="ordered">Ordered</option>
            </select>
          </div>
          <div className="form-group"><label>Notes</label><textarea className="form-control" name="notes" value={form.notes} onChange={onChange} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
