import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaClipboardList, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';

const API = '/api/waitlist';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { child_name: '', parent_name: '', parent_email: '', parent_phone: '', date_of_birth: '', age_group: '', desired_start_date: '', position: '', status: 'waiting', notes: '' };

const WaitingList = () => {
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
  const openEdit = () => { setForm({ ...emptyForm, ...selected, date_of_birth: selected.date_of_birth ? selected.date_of_birth.split('T')[0] : '', desired_start_date: selected.desired_start_date ? selected.desired_start_date.split('T')[0] : '' }); setEditing(true); setShowDetail(false); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing && selected) { await axios.put(`${API}/${selected.id}`, form, { headers: headers() }); }
      else { await axios.post(API, form, { headers: headers() }); }
      setShowForm(false); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove this child from the waiting list?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const statusBadge = (status) => {
    const map = { waiting: 'badge-warning', offered: 'badge-info', accepted: 'badge-success', declined: 'badge-danger', enrolled: 'badge-success' };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status || 'unknown'}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaClipboardList style={{ marginRight: 10, color: '#FF7043' }} />Waiting List</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Add to Waitlist</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>#</th><th>Child Name</th><th>Parent</th><th>Age Group</th><th>Desired Start</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="table-empty"><p>No children on the waiting list.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.position || '-'}</strong></td>
                <td><strong>{item.child_name}</strong></td>
                <td>{item.parent_name}</td>
                <td>{item.age_group}</td>
                <td>{item.desired_start_date ? new Date(item.desired_start_date).toLocaleDateString() : 'N/A'}</td>
                <td>{statusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Waitlist Details"
        footer={<div className="btn-group"><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-label">Position</div><div className="detail-value">{selected.position || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
            <div className="detail-item"><div className="detail-label">Child Name</div><div className="detail-value">{selected.child_name}</div></div>
            <div className="detail-item"><div className="detail-label">Parent Name</div><div className="detail-value">{selected.parent_name}</div></div>
            <div className="detail-item"><div className="detail-label">Parent Email</div><div className="detail-value">{selected.parent_email || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Parent Phone</div><div className="detail-value">{selected.parent_phone || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Date of Birth</div><div className="detail-value">{selected.date_of_birth ? new Date(selected.date_of_birth).toLocaleDateString() : 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Age Group</div><div className="detail-value">{selected.age_group || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Desired Start Date</div><div className="detail-value">{selected.desired_start_date ? new Date(selected.desired_start_date).toLocaleDateString() : 'N/A'}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Notes</div><div className="detail-value">{selected.notes || 'N/A'}</div></div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Waitlist Entry' : 'Add to Waitlist'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Child Name</label><input className="form-control" name="child_name" value={form.child_name} onChange={onChange} required /></div>
            <div className="form-group"><label>Parent Name</label><input className="form-control" name="parent_name" value={form.parent_name} onChange={onChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Parent Email</label><input className="form-control" type="email" name="parent_email" value={form.parent_email} onChange={onChange} /></div>
            <div className="form-group"><label>Parent Phone</label><input className="form-control" name="parent_phone" value={form.parent_phone} onChange={onChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Date of Birth</label><input className="form-control" type="date" name="date_of_birth" value={form.date_of_birth} onChange={onChange} /></div>
            <div className="form-group"><label>Age Group</label>
              <select className="form-control" name="age_group" value={form.age_group} onChange={onChange}>
                <option value="">Select...</option><option value="infant">Infant</option><option value="toddler">Toddler</option><option value="preschool">Preschool</option><option value="school_age">School Age</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Desired Start Date</label><input className="form-control" type="date" name="desired_start_date" value={form.desired_start_date} onChange={onChange} /></div>
            <div className="form-group"><label>Position</label><input className="form-control" type="number" name="position" value={form.position} onChange={onChange} min="1" /></div>
          </div>
          <div className="form-group"><label>Status</label>
            <select className="form-control" name="status" value={form.status} onChange={onChange}>
              <option value="waiting">Waiting</option><option value="offered">Offered</option><option value="accepted">Accepted</option><option value="declined">Declined</option><option value="enrolled">Enrolled</option>
            </select>
          </div>
          <div className="form-group"><label>Notes</label><textarea className="form-control" name="notes" value={form.notes} onChange={onChange} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default WaitingList;
