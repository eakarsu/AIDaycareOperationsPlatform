import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaShieldAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const API = '/api/incidents';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { child_name: '', incident_type: '', description: '', severity: 'low', date: '', time: '', location: '', action_taken: '', reported_by: '', parent_notified: false };

const Incidents = () => {
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
    if (!window.confirm('Delete this incident report?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const handleAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await axios.post('/api/ai/incident-analysis', { incident: selected }, { headers: headers() }); setAiResult(res.data); }
    catch { setAiResult({ analysis: 'AI incident analysis could not be completed. Please ensure the AI service is configured.' }); }
    setAiLoading(false);
  };

  const severityBadge = (sev) => {
    const map = { critical: 'badge-danger', high: 'badge-danger', medium: 'badge-warning', low: 'badge-info', minor: 'badge-secondary' };
    return <span className={`badge ${map[sev] || 'badge-secondary'}`}>{sev || 'unknown'}</span>;
  };

  const onChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaShieldAlt style={{ marginRight: 10, color: '#E74C3C' }} />Health & Safety Incidents</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Report Incident</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Child</th><th>Type</th><th>Severity</th><th>Date</th><th>Location</th><th>Reported By</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="table-empty"><p>No incidents reported.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.child_name}</strong></td>
                <td>{item.incident_type}</td>
                <td>{severityBadge(item.severity)}</td>
                <td>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                <td>{item.location}</td>
                <td>{item.reported_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Incident Report"
        footer={<div className="btn-group"><button className="btn btn-ai" onClick={handleAI}>AI Analysis</button><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Child Name</div><div className="detail-value">{selected.child_name}</div></div>
              <div className="detail-item"><div className="detail-label">Incident Type</div><div className="detail-value">{selected.incident_type}</div></div>
              <div className="detail-item"><div className="detail-label">Severity</div><div className="detail-value">{severityBadge(selected.severity)}</div></div>
              <div className="detail-item"><div className="detail-label">Date</div><div className="detail-value">{selected.date ? new Date(selected.date).toLocaleDateString() : 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Time</div><div className="detail-value">{selected.time || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Location</div><div className="detail-value">{selected.location || 'N/A'}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Description</div><div className="detail-value">{selected.description || 'N/A'}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Action Taken</div><div className="detail-value">{selected.action_taken || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Reported By</div><div className="detail-value">{selected.reported_by || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Parent Notified</div><div className="detail-value">{selected.parent_notified ? 'Yes' : 'No'}</div></div>
            </div>
            <AIOutput loading={aiLoading} data={aiResult} />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Incident' : 'Report Incident'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Submit'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Child Name</label><input className="form-control" name="child_name" value={form.child_name} onChange={onChange} required /></div>
            <div className="form-group"><label>Incident Type</label>
              <select className="form-control" name="incident_type" value={form.incident_type} onChange={onChange} required>
                <option value="">Select...</option><option value="injury">Injury</option><option value="illness">Illness</option><option value="allergy">Allergic Reaction</option><option value="behavioral">Behavioral</option><option value="safety">Safety Concern</option><option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Severity</label>
              <select className="form-control" name="severity" value={form.severity} onChange={onChange}>
                <option value="minor">Minor</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group"><label>Date</label><input className="form-control" type="date" name="date" value={form.date} onChange={onChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Time</label><input className="form-control" type="time" name="time" value={form.time} onChange={onChange} /></div>
            <div className="form-group"><label>Location</label><input className="form-control" name="location" value={form.location} onChange={onChange} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea className="form-control" name="description" value={form.description} onChange={onChange} required /></div>
          <div className="form-group"><label>Action Taken</label><textarea className="form-control" name="action_taken" value={form.action_taken} onChange={onChange} /></div>
          <div className="form-row">
            <div className="form-group"><label>Reported By</label><input className="form-control" name="reported_by" value={form.reported_by} onChange={onChange} /></div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 24 }}>
              <input type="checkbox" name="parent_notified" checked={form.parent_notified} onChange={onChange} style={{ width: 18, height: 18 }} />
              <label style={{ margin: 0 }}>Parent Notified</label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Incidents;
