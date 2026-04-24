import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaDoorOpen, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';

const API = '/api/classrooms';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { name: '', age_group: '', capacity: '', current_count: '', lead_teacher: '', assistant_teacher: '', room_number: '', status: 'active', description: '', notes: '' };

const Classrooms = () => {
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
    if (!window.confirm('Delete this classroom?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const statusBadge = (status) => {
    const map = { active: 'badge-success', inactive: 'badge-secondary', maintenance: 'badge-warning' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status || 'unknown'}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaDoorOpen style={{ marginRight: 10, color: '#5C6BC0' }} />Classroom Management</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Add Classroom</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Room Name</th><th>Room #</th><th>Age Group</th><th>Lead Teacher</th><th>Capacity</th><th>Current</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="7" className="table-empty"><p>No classrooms found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.name}</strong></td>
                <td>{item.room_number || 'N/A'}</td>
                <td>{item.age_group}</td>
                <td>{item.lead_teacher}</td>
                <td>{item.capacity}</td>
                <td><span style={{ color: item.current_count >= item.capacity ? '#E74C3C' : '#27AE60', fontWeight: 600 }}>{item.current_count}</span></td>
                <td>{statusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Classroom Details"
        footer={<div className="btn-group"><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-label">Room Name</div><div className="detail-value">{selected.name}</div></div>
            <div className="detail-item"><div className="detail-label">Room Number</div><div className="detail-value">{selected.room_number || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Age Group</div><div className="detail-value">{selected.age_group}</div></div>
            <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
            <div className="detail-item"><div className="detail-label">Capacity</div><div className="detail-value">{selected.capacity}</div></div>
            <div className="detail-item"><div className="detail-label">Current Count</div><div className="detail-value">{selected.current_count}</div></div>
            <div className="detail-item"><div className="detail-label">Lead Teacher</div><div className="detail-value">{selected.lead_teacher || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Assistant Teacher</div><div className="detail-value">{selected.assistant_teacher || 'N/A'}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Description</div><div className="detail-value">{selected.description || 'N/A'}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Notes</div><div className="detail-value">{selected.notes || 'N/A'}</div></div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Classroom' : 'Add Classroom'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Room Name</label><input className="form-control" name="name" value={form.name} onChange={onChange} required /></div>
            <div className="form-group"><label>Room Number</label><input className="form-control" name="room_number" value={form.room_number} onChange={onChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Age Group</label>
              <select className="form-control" name="age_group" value={form.age_group} onChange={onChange}>
                <option value="">Select...</option><option value="infant">Infant</option><option value="toddler">Toddler</option><option value="preschool">Preschool</option><option value="school_age">School Age</option>
              </select>
            </div>
            <div className="form-group"><label>Status</label>
              <select className="form-control" name="status" value={form.status} onChange={onChange}>
                <option value="active">Active</option><option value="inactive">Inactive</option><option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Capacity</label><input className="form-control" type="number" name="capacity" value={form.capacity} onChange={onChange} required /></div>
            <div className="form-group"><label>Current Count</label><input className="form-control" type="number" name="current_count" value={form.current_count} onChange={onChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Lead Teacher</label><input className="form-control" name="lead_teacher" value={form.lead_teacher} onChange={onChange} /></div>
            <div className="form-group"><label>Assistant Teacher</label><input className="form-control" name="assistant_teacher" value={form.assistant_teacher} onChange={onChange} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea className="form-control" name="description" value={form.description} onChange={onChange} /></div>
          <div className="form-group"><label>Notes</label><textarea className="form-control" name="notes" value={form.notes} onChange={onChange} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default Classrooms;
