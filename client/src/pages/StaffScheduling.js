import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaClock, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const API = '/api/staff';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { staff_name: '', role: '', shift_start: '', shift_end: '', date: '', classroom: '', status: 'scheduled', notes: '' };

const StaffScheduling = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const fetchData = useCallback(async () => {
    try { const res = await axios.get(API, { headers: headers() }); setItems(Array.isArray(res.data) ? res.data : []); } catch { setItems([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(emptyForm); setEditing(false); setShowForm(true); };
  const openDetail = (item) => { setSelected(item); setAiResult(null); setShowDetail(true); };
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
    if (!window.confirm('Delete this schedule entry?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const handleAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await axios.post('/api/ai/schedule-optimization', { schedule: selected, allSchedules: items }, { headers: headers() }); setAiResult(res.data); }
    catch { setAiResult({ analysis: 'AI schedule optimization could not be completed. Please ensure the AI service is configured.' }); }
    setAiLoading(false);
  };

  const statusBadge = (status) => {
    const map = { scheduled: 'badge-primary', confirmed: 'badge-success', absent: 'badge-danger', on_leave: 'badge-warning', completed: 'badge-success' };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{(status || 'unknown').replace(/_/g, ' ')}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaClock style={{ marginRight: 10, color: '#0097A7' }} />Staff Scheduling</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Add Schedule</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Staff Name</th><th>Role</th><th>Date</th><th>Shift</th><th>Classroom</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="table-empty"><p>No schedules found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.staff_name || item.name}</strong></td>
                <td>{item.role}</td>
                <td>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                <td>{item.shift_start && item.shift_end ? `${item.shift_start} - ${item.shift_end}` : 'N/A'}</td>
                <td>{item.classroom || 'N/A'}</td>
                <td>{statusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Schedule Details"
        footer={<div className="btn-group"><button className="btn btn-ai" onClick={handleAI}>AI Optimization</button><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Staff Name</div><div className="detail-value">{selected.staff_name || selected.name}</div></div>
              <div className="detail-item"><div className="detail-label">Role</div><div className="detail-value">{selected.role || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Date</div><div className="detail-value">{selected.date ? new Date(selected.date).toLocaleDateString() : 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Classroom</div><div className="detail-value">{selected.classroom || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Shift Start</div><div className="detail-value">{selected.shift_start || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Shift End</div><div className="detail-value">{selected.shift_end || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Notes</div><div className="detail-value">{selected.notes || 'N/A'}</div></div>
            </div>
            <AIOutput loading={aiLoading} data={aiResult} />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Schedule' : 'Add Schedule'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Staff Name</label><input className="form-control" name="staff_name" value={form.staff_name} onChange={onChange} required /></div>
            <div className="form-group"><label>Role</label>
              <select className="form-control" name="role" value={form.role} onChange={onChange}>
                <option value="">Select...</option><option value="lead_teacher">Lead Teacher</option><option value="assistant_teacher">Assistant Teacher</option><option value="aide">Aide</option><option value="director">Director</option><option value="cook">Cook</option><option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Date</label><input className="form-control" type="date" name="date" value={form.date} onChange={onChange} required /></div>
            <div className="form-group"><label>Classroom</label><input className="form-control" name="classroom" value={form.classroom} onChange={onChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Shift Start</label><input className="form-control" type="time" name="shift_start" value={form.shift_start} onChange={onChange} /></div>
            <div className="form-group"><label>Shift End</label><input className="form-control" type="time" name="shift_end" value={form.shift_end} onChange={onChange} /></div>
          </div>
          <div className="form-group"><label>Status</label>
            <select className="form-control" name="status" value={form.status} onChange={onChange}>
              <option value="scheduled">Scheduled</option><option value="confirmed">Confirmed</option><option value="absent">Absent</option><option value="on_leave">On Leave</option><option value="completed">Completed</option>
            </select>
          </div>
          <div className="form-group"><label>Notes</label><textarea className="form-control" name="notes" value={form.notes} onChange={onChange} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffScheduling;
