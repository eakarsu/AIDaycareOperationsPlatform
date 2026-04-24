import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPhoneAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';

const API = '/api/emergency';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { child_name: '', contact_name: '', relationship: '', phone: '', alt_phone: '', email: '', address: '', authorized_pickup: true, priority_order: 1, notes: '' };

const Emergency = () => {
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
    if (!window.confirm('Delete this emergency contact?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const onChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaPhoneAlt style={{ marginRight: 10, color: '#D32F2F' }} />Emergency Contacts</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Add Contact</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Child</th><th>Contact Name</th><th>Relationship</th><th>Phone</th><th>Pickup Auth</th><th>Priority</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="table-empty"><p>No emergency contacts found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.child_name}</strong></td>
                <td>{item.contact_name}</td>
                <td>{item.relationship}</td>
                <td>{item.phone}</td>
                <td><span className={`badge ${item.authorized_pickup ? 'badge-success' : 'badge-danger'}`}>{item.authorized_pickup ? 'Yes' : 'No'}</span></td>
                <td>{item.priority_order}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Emergency Contact Details"
        footer={<div className="btn-group"><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-label">Child Name</div><div className="detail-value">{selected.child_name}</div></div>
            <div className="detail-item"><div className="detail-label">Contact Name</div><div className="detail-value">{selected.contact_name}</div></div>
            <div className="detail-item"><div className="detail-label">Relationship</div><div className="detail-value">{selected.relationship}</div></div>
            <div className="detail-item"><div className="detail-label">Phone</div><div className="detail-value">{selected.phone}</div></div>
            <div className="detail-item"><div className="detail-label">Alt Phone</div><div className="detail-value">{selected.alt_phone || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Email</div><div className="detail-value">{selected.email || 'N/A'}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Address</div><div className="detail-value">{selected.address || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Authorized Pickup</div><div className="detail-value"><span className={`badge ${selected.authorized_pickup ? 'badge-success' : 'badge-danger'}`}>{selected.authorized_pickup ? 'Yes' : 'No'}</span></div></div>
            <div className="detail-item"><div className="detail-label">Priority Order</div><div className="detail-value">{selected.priority_order}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Notes</div><div className="detail-value">{selected.notes || 'N/A'}</div></div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Contact' : 'Add Emergency Contact'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Child Name</label><input className="form-control" name="child_name" value={form.child_name} onChange={onChange} required /></div>
            <div className="form-group"><label>Contact Name</label><input className="form-control" name="contact_name" value={form.contact_name} onChange={onChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Relationship</label>
              <select className="form-control" name="relationship" value={form.relationship} onChange={onChange} required>
                <option value="">Select...</option><option value="mother">Mother</option><option value="father">Father</option><option value="grandparent">Grandparent</option><option value="aunt_uncle">Aunt/Uncle</option><option value="sibling">Sibling</option><option value="neighbor">Neighbor</option><option value="other">Other</option>
              </select>
            </div>
            <div className="form-group"><label>Priority Order</label><input className="form-control" type="number" name="priority_order" value={form.priority_order} onChange={onChange} min="1" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Phone</label><input className="form-control" name="phone" value={form.phone} onChange={onChange} required /></div>
            <div className="form-group"><label>Alt Phone</label><input className="form-control" name="alt_phone" value={form.alt_phone} onChange={onChange} /></div>
          </div>
          <div className="form-group"><label>Email</label><input className="form-control" type="email" name="email" value={form.email} onChange={onChange} /></div>
          <div className="form-group"><label>Address</label><input className="form-control" name="address" value={form.address} onChange={onChange} /></div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" name="authorized_pickup" checked={form.authorized_pickup} onChange={onChange} style={{ width: 18, height: 18 }} />
            <label style={{ margin: 0 }}>Authorized for Pickup</label>
          </div>
          <div className="form-group"><label>Notes</label><textarea className="form-control" name="notes" value={form.notes} onChange={onChange} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default Emergency;
