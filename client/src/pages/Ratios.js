import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaUsers, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const API = '/api/ratios';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { classroom: '', age_group: '', staff_count: '', child_count: '', required_ratio: '', status: 'compliant', date: '' };

const Ratios = () => {
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
    if (!window.confirm('Delete this ratio record?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const handleAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await axios.post('/api/ai/ratio-optimization', { ratio: selected }, { headers: headers() }); setAiResult(res.data); }
    catch { setAiResult({ analysis: 'AI ratio optimization could not be completed. Please ensure the AI service is configured.' }); }
    setAiLoading(false);
  };

  const statusBadge = (status) => {
    const map = { compliant: 'badge-success', non_compliant: 'badge-danger', warning: 'badge-warning' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{(status || 'unknown').replace(/_/g, ' ')}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaUsers style={{ marginRight: 10, color: '#8E24AA' }} />Staff Ratios</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Add Ratio Record</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Classroom</th><th>Age Group</th><th>Staff</th><th>Children</th><th>Required Ratio</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="table-empty"><p>No ratio records found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.classroom}</strong></td>
                <td>{item.age_group}</td>
                <td>{item.staff_count}</td>
                <td>{item.child_count}</td>
                <td>{item.required_ratio}</td>
                <td>{statusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Ratio Details"
        footer={<div className="btn-group"><button className="btn btn-ai" onClick={handleAI}>AI Optimization</button><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Classroom</div><div className="detail-value">{selected.classroom}</div></div>
              <div className="detail-item"><div className="detail-label">Age Group</div><div className="detail-value">{selected.age_group}</div></div>
              <div className="detail-item"><div className="detail-label">Staff Count</div><div className="detail-value">{selected.staff_count}</div></div>
              <div className="detail-item"><div className="detail-label">Child Count</div><div className="detail-value">{selected.child_count}</div></div>
              <div className="detail-item"><div className="detail-label">Required Ratio</div><div className="detail-value">{selected.required_ratio}</div></div>
              <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
            </div>
            <AIOutput loading={aiLoading} data={aiResult} />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Ratio' : 'Add Ratio Record'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Classroom</label><input className="form-control" name="classroom" value={form.classroom} onChange={onChange} required /></div>
            <div className="form-group"><label>Age Group</label>
              <select className="form-control" name="age_group" value={form.age_group} onChange={onChange}>
                <option value="">Select...</option><option value="infant">Infant (0-12m)</option><option value="toddler">Toddler (1-3y)</option><option value="preschool">Preschool (3-5y)</option><option value="school_age">School Age (5+)</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Staff Count</label><input className="form-control" type="number" name="staff_count" value={form.staff_count} onChange={onChange} required /></div>
            <div className="form-group"><label>Child Count</label><input className="form-control" type="number" name="child_count" value={form.child_count} onChange={onChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Required Ratio</label><input className="form-control" name="required_ratio" value={form.required_ratio} onChange={onChange} placeholder="e.g., 1:4" /></div>
            <div className="form-group"><label>Status</label>
              <select className="form-control" name="status" value={form.status} onChange={onChange}>
                <option value="compliant">Compliant</option><option value="non_compliant">Non-Compliant</option><option value="warning">Warning</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Ratios;
