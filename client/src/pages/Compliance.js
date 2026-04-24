import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaClipboardCheck, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const API = '/api/compliance';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { requirement: '', category: '', status: 'pending', due_date: '', responsible_person: '', notes: '' };

const Compliance = () => {
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
  const openEdit = () => { setForm({ ...emptyForm, ...selected, due_date: selected.due_date ? selected.due_date.split('T')[0] : '' }); setEditing(true); setShowDetail(false); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing && selected) { await axios.put(`${API}/${selected.id}`, form, { headers: headers() }); }
      else { await axios.post(API, form, { headers: headers() }); }
      setShowForm(false); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this compliance record?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const handleAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await axios.post('/api/ai/compliance-check', { compliance: selected }, { headers: headers() }); setAiResult(res.data); }
    catch { setAiResult({ analysis: 'AI compliance analysis could not be completed. Please ensure the AI service is configured.' }); }
    setAiLoading(false);
  };

  const statusBadge = (status) => {
    const map = { compliant: 'badge-success', pending: 'badge-warning', non_compliant: 'badge-danger', in_review: 'badge-info' };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{(status || 'unknown').replace(/_/g, ' ')}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaClipboardCheck style={{ marginRight: 10, color: '#27AE60' }} />Licensing Compliance</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Add Requirement</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Requirement</th><th>Category</th><th>Status</th><th>Due Date</th><th>Responsible</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="5" className="table-empty"><p>No compliance records found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.requirement}</strong></td>
                <td>{item.category}</td>
                <td>{statusBadge(item.status)}</td>
                <td>{item.due_date ? new Date(item.due_date).toLocaleDateString() : 'N/A'}</td>
                <td>{item.responsible_person}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Compliance Details"
        footer={<div className="btn-group"><button className="btn btn-ai" onClick={handleAI}>AI Compliance Check</button><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <>
            <div className="detail-grid">
              <div className="detail-item detail-full"><div className="detail-label">Requirement</div><div className="detail-value">{selected.requirement}</div></div>
              <div className="detail-item"><div className="detail-label">Category</div><div className="detail-value">{selected.category}</div></div>
              <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
              <div className="detail-item"><div className="detail-label">Due Date</div><div className="detail-value">{selected.due_date ? new Date(selected.due_date).toLocaleDateString() : 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Responsible Person</div><div className="detail-value">{selected.responsible_person || 'N/A'}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Notes</div><div className="detail-value">{selected.notes || 'N/A'}</div></div>
            </div>
            <AIOutput loading={aiLoading} data={aiResult} />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Compliance' : 'Add Compliance Requirement'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-group"><label>Requirement</label><input className="form-control" name="requirement" value={form.requirement} onChange={onChange} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Category</label>
              <select className="form-control" name="category" value={form.category} onChange={onChange}>
                <option value="">Select...</option><option value="health_safety">Health & Safety</option><option value="staffing">Staffing</option><option value="facility">Facility</option><option value="documentation">Documentation</option><option value="training">Training</option>
              </select>
            </div>
            <div className="form-group"><label>Status</label>
              <select className="form-control" name="status" value={form.status} onChange={onChange}>
                <option value="pending">Pending</option><option value="compliant">Compliant</option><option value="non_compliant">Non-Compliant</option><option value="in_review">In Review</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Due Date</label><input className="form-control" type="date" name="due_date" value={form.due_date} onChange={onChange} /></div>
            <div className="form-group"><label>Responsible Person</label><input className="form-control" name="responsible_person" value={form.responsible_person} onChange={onChange} /></div>
          </div>
          <div className="form-group"><label>Notes</label><textarea className="form-control" name="notes" value={form.notes} onChange={onChange} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default Compliance;
