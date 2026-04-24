import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaBaby, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const API = '/api/milestones';
const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const emptyForm = { child_name: '', milestone_type: '', description: '', status: 'in_progress', age_months: '', notes: '' };

const Milestones = () => {
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
    try {
      const res = await axios.get(API, { headers: headers() });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch { setItems([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(emptyForm); setEditing(false); setShowForm(true); };
  const openDetail = (item) => { setSelected(item); setAiResult(null); setShowDetail(true); };
  const openEdit = () => { setForm({ ...emptyForm, ...selected }); setEditing(true); setShowDetail(false); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing && selected) {
        await axios.put(`${API}/${selected.id}`, form, { headers: headers() });
      } else {
        await axios.post(API, form, { headers: headers() });
      }
      setShowForm(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`${API}/${selected.id}`, { headers: headers() });
      setShowDetail(false);
      fetchData();
    } catch (err) { alert('Delete failed'); }
  };

  const handleAI = async () => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await axios.post('/api/ai/milestone-assessment', { milestone: selected }, { headers: headers() });
      setAiResult(res.data);
    } catch { setAiResult({ analysis: 'AI analysis could not be completed at this time. Please ensure the AI service is configured.' }); }
    setAiLoading(false);
  };

  const statusBadge = (status) => {
    const map = { completed: 'badge-success', in_progress: 'badge-warning', not_started: 'badge-secondary', delayed: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{(status || 'unknown').replace(/_/g, ' ')}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <div>
          <h1><FaBaby style={{ marginRight: 10, color: '#4A90D9' }} />Child Milestones</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Add New Milestone</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Child Name</th>
              <th>Milestone Type</th>
              <th>Age (Months)</th>
              <th>Status</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="5" className="table-empty"><p>No milestones found. Click "Add New Milestone" to get started.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.child_name}</strong></td>
                <td>{item.milestone_type}</td>
                <td>{item.age_months}</td>
                <td>{statusBadge(item.status)}</td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Milestone Details"
        footer={
          <div className="btn-group">
            <button className="btn btn-ai" onClick={handleAI}>AI Assessment</button>
            <button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button>
            <button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button>
          </div>
        }>
        {selected && (
          <>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Child Name</div><div className="detail-value">{selected.child_name}</div></div>
              <div className="detail-item"><div className="detail-label">Milestone Type</div><div className="detail-value">{selected.milestone_type}</div></div>
              <div className="detail-item"><div className="detail-label">Age (Months)</div><div className="detail-value">{selected.age_months}</div></div>
              <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Description</div><div className="detail-value">{selected.description || 'N/A'}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Notes</div><div className="detail-value">{selected.notes || 'N/A'}</div></div>
            </div>
            <AIOutput loading={aiLoading} data={aiResult} />
          </>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Milestone' : 'Add New Milestone'}
        footer={
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button>
          </div>
        }>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>Child Name</label>
              <input className="form-control" name="child_name" value={form.child_name} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label>Milestone Type</label>
              <select className="form-control" name="milestone_type" value={form.milestone_type} onChange={onChange} required>
                <option value="">Select type...</option>
                <option value="physical">Physical</option>
                <option value="cognitive">Cognitive</option>
                <option value="social">Social</option>
                <option value="language">Language</option>
                <option value="emotional">Emotional</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Age (Months)</label>
              <input className="form-control" type="number" name="age_months" value={form.age_months} onChange={onChange} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" name="status" value={form.status} onChange={onChange}>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={onChange} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-control" name="notes" value={form.notes} onChange={onChange} />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Milestones;
