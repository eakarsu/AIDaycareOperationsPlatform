import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaBrain, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const API = '/api/assessments';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { child_name: '', assessment_type: '', date: '', evaluator: '', score: '', age_group: '', areas_evaluated: '', strengths: '', areas_for_improvement: '', recommendations: '', status: 'pending' };

const Assessments = () => {
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
    if (!window.confirm('Delete this assessment?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const handleAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await axios.post('/api/ai/developmental-report', { assessment: selected }, { headers: headers() }); setAiResult(res.data); }
    catch { setAiResult({ analysis: 'AI developmental report could not be generated. Please ensure the AI service is configured.' }); }
    setAiLoading(false);
  };

  const statusBadge = (status) => {
    const map = { completed: 'badge-success', pending: 'badge-warning', in_progress: 'badge-info', scheduled: 'badge-primary' };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{(status || 'unknown').replace(/_/g, ' ')}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaBrain style={{ marginRight: 10, color: '#3F51B5' }} />AI Assessments</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> New Assessment</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Child</th><th>Type</th><th>Evaluator</th><th>Date</th><th>Score</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="table-empty"><p>No assessments found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.child_name}</strong></td>
                <td>{item.assessment_type}</td>
                <td>{item.evaluator}</td>
                <td>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                <td>{item.score || 'N/A'}</td>
                <td>{statusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Assessment Details"
        footer={<div className="btn-group"><button className="btn btn-ai" onClick={handleAI}>AI Developmental Report</button><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Child Name</div><div className="detail-value">{selected.child_name}</div></div>
              <div className="detail-item"><div className="detail-label">Assessment Type</div><div className="detail-value">{selected.assessment_type}</div></div>
              <div className="detail-item"><div className="detail-label">Evaluator</div><div className="detail-value">{selected.evaluator || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Date</div><div className="detail-value">{selected.date ? new Date(selected.date).toLocaleDateString() : 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Score</div><div className="detail-value">{selected.score || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Areas Evaluated</div><div className="detail-value">{selected.areas_evaluated || 'N/A'}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Strengths</div><div className="detail-value">{selected.strengths || 'N/A'}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Areas for Improvement</div><div className="detail-value">{selected.areas_for_improvement || 'N/A'}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Recommendations</div><div className="detail-value">{selected.recommendations || 'N/A'}</div></div>
            </div>
            <AIOutput loading={aiLoading} data={aiResult} />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Assessment' : 'New Assessment'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Child Name</label><input className="form-control" name="child_name" value={form.child_name} onChange={onChange} required /></div>
            <div className="form-group"><label>Assessment Type</label>
              <select className="form-control" name="assessment_type" value={form.assessment_type} onChange={onChange} required>
                <option value="">Select...</option><option value="developmental">Developmental</option><option value="behavioral">Behavioral</option><option value="cognitive">Cognitive</option><option value="social_emotional">Social-Emotional</option><option value="physical">Physical</option><option value="language">Language</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Date</label><input className="form-control" type="date" name="date" value={form.date} onChange={onChange} /></div>
            <div className="form-group"><label>Evaluator</label><input className="form-control" name="evaluator" value={form.evaluator} onChange={onChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Score</label><input className="form-control" name="score" value={form.score} onChange={onChange} placeholder="e.g., 85/100" /></div>
            <div className="form-group"><label>Status</label>
              <select className="form-control" name="status" value={form.status} onChange={onChange}>
                <option value="scheduled">Scheduled</option><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Areas Evaluated</label><input className="form-control" name="areas_evaluated" value={form.areas_evaluated} onChange={onChange} placeholder="e.g., motor skills, language, cognition" /></div>
          <div className="form-group"><label>Strengths</label><textarea className="form-control" name="strengths" value={form.strengths} onChange={onChange} /></div>
          <div className="form-group"><label>Areas for Improvement</label><textarea className="form-control" name="areas_for_improvement" value={form.areas_for_improvement} onChange={onChange} /></div>
          <div className="form-group"><label>Recommendations</label><textarea className="form-control" name="recommendations" value={form.recommendations} onChange={onChange} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default Assessments;
