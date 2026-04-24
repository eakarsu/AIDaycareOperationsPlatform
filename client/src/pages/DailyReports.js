import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaFileAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';

const API = '/api/dailyreports';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { child_name: '', date: '', mood: '', meals_eaten: '', nap_start: '', nap_end: '', activities_summary: '', bathroom_notes: '', supplies_needed: '', teacher_notes: '', sent_to_parent: false };

const DailyReports = () => {
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

  const openCreate = () => { setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] }); setEditing(false); setShowForm(true); };
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
    if (!window.confirm('Delete this daily report?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const moodBadge = (mood) => {
    const map = { happy: 'badge-success', good: 'badge-info', okay: 'badge-warning', fussy: 'badge-danger', tired: 'badge-secondary' };
    return <span className={`badge ${map[mood] || 'badge-secondary'}`}>{mood || 'N/A'}</span>;
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaFileAlt style={{ marginRight: 10, color: '#26A69A' }} />Daily Reports</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> New Report</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Date</th><th>Child Name</th><th>Mood</th><th>Nap</th><th>Sent to Parent</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="5" className="table-empty"><p>No daily reports found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                <td><strong>{item.child_name}</strong></td>
                <td>{moodBadge(item.mood)}</td>
                <td>{item.nap_start && item.nap_end ? `${item.nap_start} - ${item.nap_end}` : 'N/A'}</td>
                <td><span className={`badge ${item.sent_to_parent ? 'badge-success' : 'badge-secondary'}`}>{item.sent_to_parent ? 'Yes' : 'No'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Daily Report Details"
        footer={<div className="btn-group"><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-label">Child Name</div><div className="detail-value">{selected.child_name}</div></div>
            <div className="detail-item"><div className="detail-label">Date</div><div className="detail-value">{selected.date ? new Date(selected.date).toLocaleDateString() : 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Mood</div><div className="detail-value">{moodBadge(selected.mood)}</div></div>
            <div className="detail-item"><div className="detail-label">Meals Eaten</div><div className="detail-value">{selected.meals_eaten || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Nap Start</div><div className="detail-value">{selected.nap_start || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Nap End</div><div className="detail-value">{selected.nap_end || 'N/A'}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Activities Summary</div><div className="detail-value">{selected.activities_summary || 'N/A'}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Bathroom Notes</div><div className="detail-value">{selected.bathroom_notes || 'N/A'}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Supplies Needed</div><div className="detail-value">{selected.supplies_needed || 'N/A'}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Teacher Notes</div><div className="detail-value">{selected.teacher_notes || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Sent to Parent</div><div className="detail-value"><span className={`badge ${selected.sent_to_parent ? 'badge-success' : 'badge-secondary'}`}>{selected.sent_to_parent ? 'Yes' : 'No'}</span></div></div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Daily Report' : 'New Daily Report'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Child Name</label><input className="form-control" name="child_name" value={form.child_name} onChange={onChange} required /></div>
            <div className="form-group"><label>Date</label><input className="form-control" type="date" name="date" value={form.date} onChange={onChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Mood</label>
              <select className="form-control" name="mood" value={form.mood} onChange={onChange}>
                <option value="">Select...</option><option value="happy">Happy</option><option value="good">Good</option><option value="okay">Okay</option><option value="fussy">Fussy</option><option value="tired">Tired</option>
              </select>
            </div>
            <div className="form-group"><label>Meals Eaten</label><input className="form-control" name="meals_eaten" value={form.meals_eaten} onChange={onChange} placeholder="e.g. Breakfast, Snack, Lunch" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Nap Start</label><input className="form-control" type="time" name="nap_start" value={form.nap_start} onChange={onChange} /></div>
            <div className="form-group"><label>Nap End</label><input className="form-control" type="time" name="nap_end" value={form.nap_end} onChange={onChange} /></div>
          </div>
          <div className="form-group"><label>Activities Summary</label><textarea className="form-control" name="activities_summary" value={form.activities_summary} onChange={onChange} placeholder="What activities did the child participate in today?" /></div>
          <div className="form-group"><label>Bathroom Notes</label><textarea className="form-control" name="bathroom_notes" value={form.bathroom_notes} onChange={onChange} /></div>
          <div className="form-group"><label>Supplies Needed</label><input className="form-control" name="supplies_needed" value={form.supplies_needed} onChange={onChange} placeholder="e.g. Diapers, extra clothes" /></div>
          <div className="form-group"><label>Teacher Notes</label><textarea className="form-control" name="teacher_notes" value={form.teacher_notes} onChange={onChange} /></div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" name="sent_to_parent" checked={form.sent_to_parent} onChange={onChange} id="sent_to_parent" />
            <label htmlFor="sent_to_parent" style={{ margin: 0 }}>Sent to Parent</label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DailyReports;
