import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const API = '/api/communications';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { parent_name: '', child_name: '', subject: '', message: '', type: 'general', status: 'sent', priority: 'normal' };

const Communications = () => {
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
    if (!window.confirm('Delete this communication?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const handleAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await axios.post('/api/ai/parent-response', { communication: selected }, { headers: headers() }); setAiResult(res.data); }
    catch { setAiResult({ analysis: 'AI response generation could not be completed. Please ensure the AI service is configured.' }); }
    setAiLoading(false);
  };

  const priorityBadge = (p) => {
    const map = { high: 'badge-danger', normal: 'badge-info', low: 'badge-secondary', urgent: 'badge-danger' };
    return <span className={`badge ${map[p] || 'badge-info'}`}>{p || 'normal'}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaEnvelope style={{ marginRight: 10, color: '#F5A623' }} />Parent Communications</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> New Message</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Parent</th><th>Child</th><th>Subject</th><th>Type</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="table-empty"><p>No communications found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.parent_name}</strong></td>
                <td>{item.child_name}</td>
                <td>{item.subject}</td>
                <td>{item.type}</td>
                <td>{priorityBadge(item.priority)}</td>
                <td><span className={`badge ${item.status === 'sent' ? 'badge-success' : 'badge-warning'}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Communication Details"
        footer={<div className="btn-group"><button className="btn btn-ai" onClick={handleAI}>AI Generate Response</button><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Parent Name</div><div className="detail-value">{selected.parent_name}</div></div>
              <div className="detail-item"><div className="detail-label">Child Name</div><div className="detail-value">{selected.child_name}</div></div>
              <div className="detail-item"><div className="detail-label">Type</div><div className="detail-value">{selected.type}</div></div>
              <div className="detail-item"><div className="detail-label">Priority</div><div className="detail-value">{priorityBadge(selected.priority)}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Subject</div><div className="detail-value">{selected.subject}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Message</div><div className="detail-value">{selected.message || 'N/A'}</div></div>
            </div>
            <AIOutput loading={aiLoading} data={aiResult} />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Communication' : 'New Communication'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Send'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Parent Name</label><input className="form-control" name="parent_name" value={form.parent_name} onChange={onChange} required /></div>
            <div className="form-group"><label>Child Name</label><input className="form-control" name="child_name" value={form.child_name} onChange={onChange} required /></div>
          </div>
          <div className="form-group"><label>Subject</label><input className="form-control" name="subject" value={form.subject} onChange={onChange} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Type</label>
              <select className="form-control" name="type" value={form.type} onChange={onChange}>
                <option value="general">General</option><option value="incident">Incident</option><option value="billing">Billing</option><option value="schedule">Schedule</option><option value="health">Health</option>
              </select>
            </div>
            <div className="form-group"><label>Priority</label>
              <select className="form-control" name="priority" value={form.priority} onChange={onChange}>
                <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Message</label><textarea className="form-control" name="message" value={form.message} onChange={onChange} rows="4" /></div>
        </form>
      </Modal>
    </div>
  );
};

export default Communications;
