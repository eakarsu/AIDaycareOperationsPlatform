import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaCalendarCheck, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';

const API = '/api/attendance';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { child_name: '', date: '', check_in: '', check_out: '', status: 'present', notes: '' };

const Attendance = () => {
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
  const openEdit = () => { setForm({ ...emptyForm, ...selected, date: selected.date ? selected.date.split('T')[0] : '' }); setEditing(true); setShowDetail(false); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing && selected) { await axios.put(`${API}/${selected.id}`, form, { headers: headers() }); }
      else { await axios.post(API, form, { headers: headers() }); }
      setShowForm(false); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this attendance record?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const statusBadge = (status) => {
    const map = { present: 'badge-success', absent: 'badge-danger', late: 'badge-warning', excused: 'badge-info' };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{status || 'unknown'}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaCalendarCheck style={{ marginRight: 10, color: '#E91E63' }} />Attendance Tracking</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Add Record</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Child Name</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="5" className="table-empty"><p>No attendance records found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.child_name}</strong></td>
                <td>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                <td>{item.check_in || 'N/A'}</td>
                <td>{item.check_out || 'N/A'}</td>
                <td>{statusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Attendance Details"
        footer={<div className="btn-group"><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-label">Child Name</div><div className="detail-value">{selected.child_name}</div></div>
            <div className="detail-item"><div className="detail-label">Date</div><div className="detail-value">{selected.date ? new Date(selected.date).toLocaleDateString() : 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Check In</div><div className="detail-value">{selected.check_in || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Check Out</div><div className="detail-value">{selected.check_out || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Notes</div><div className="detail-value">{selected.notes || 'N/A'}</div></div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Attendance' : 'Add Attendance Record'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-group"><label>Child Name</label><input className="form-control" name="child_name" value={form.child_name} onChange={onChange} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Date</label><input className="form-control" type="date" name="date" value={form.date} onChange={onChange} required /></div>
            <div className="form-group"><label>Status</label>
              <select className="form-control" name="status" value={form.status} onChange={onChange}>
                <option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option><option value="excused">Excused</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Check In</label><input className="form-control" type="time" name="check_in" value={form.check_in} onChange={onChange} /></div>
            <div className="form-group"><label>Check Out</label><input className="form-control" type="time" name="check_out" value={form.check_out} onChange={onChange} /></div>
          </div>
          <div className="form-group"><label>Notes</label><textarea className="form-control" name="notes" value={form.notes} onChange={onChange} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;
