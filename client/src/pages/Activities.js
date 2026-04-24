import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPuzzlePiece, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const API = '/api/activities';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { activity_name: '', activity_type: '', date: '', time: '', duration: '', age_group: '', classroom: '', description: '', materials_needed: '', learning_objectives: '', led_by: '', status: 'planned' };

const Activities = () => {
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
    if (!window.confirm('Delete this activity?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const handleAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await axios.post('/api/ai/activity-suggestions', { activity: selected }, { headers: headers() }); setAiResult(res.data); }
    catch { setAiResult({ analysis: 'AI activity suggestions could not be generated. Please ensure the AI service is configured.' }); }
    setAiLoading(false);
  };

  const statusBadge = (status) => {
    const map = { planned: 'badge-info', in_progress: 'badge-warning', completed: 'badge-success', cancelled: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-secondary'}`}>{(status || 'unknown').replace(/_/g, ' ')}</span>;
  };

  const typeBadge = (type) => {
    const map = { art: 'badge-purple', music: 'badge-warning', outdoor: 'badge-success', stem: 'badge-info', literacy: 'badge-primary', sensory: 'badge-warning', free_play: 'badge-secondary' };
    return <span className={`badge ${map[type] || 'badge-info'}`}>{(type || 'unknown').replace(/_/g, ' ')}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaPuzzlePiece style={{ marginRight: 10, color: '#FF7043' }} />Activity Planning</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Plan Activity</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Activity</th><th>Type</th><th>Date</th><th>Time</th><th>Age Group</th><th>Led By</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="7" className="table-empty"><p>No activities planned.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.activity_name}</strong></td>
                <td>{typeBadge(item.activity_type)}</td>
                <td>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                <td>{item.time || 'N/A'}</td>
                <td>{item.age_group}</td>
                <td>{item.led_by}</td>
                <td>{statusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Activity Details"
        footer={<div className="btn-group"><button className="btn btn-ai" onClick={handleAI}>AI Suggestions</button><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Activity Name</div><div className="detail-value">{selected.activity_name}</div></div>
              <div className="detail-item"><div className="detail-label">Type</div><div className="detail-value">{typeBadge(selected.activity_type)}</div></div>
              <div className="detail-item"><div className="detail-label">Date</div><div className="detail-value">{selected.date ? new Date(selected.date).toLocaleDateString() : 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Time</div><div className="detail-value">{selected.time || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Duration</div><div className="detail-value">{selected.duration ? `${selected.duration} min` : 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Age Group</div><div className="detail-value">{selected.age_group || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Classroom</div><div className="detail-value">{selected.classroom || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Led By</div><div className="detail-value">{selected.led_by || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Description</div><div className="detail-value">{selected.description || 'N/A'}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Materials Needed</div><div className="detail-value">{selected.materials_needed || 'N/A'}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Learning Objectives</div><div className="detail-value">{selected.learning_objectives || 'N/A'}</div></div>
            </div>
            <AIOutput loading={aiLoading} data={aiResult} />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Activity' : 'Plan New Activity'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Activity Name</label><input className="form-control" name="activity_name" value={form.activity_name} onChange={onChange} required /></div>
            <div className="form-group"><label>Activity Type</label>
              <select className="form-control" name="activity_type" value={form.activity_type} onChange={onChange} required>
                <option value="">Select...</option><option value="art">Art</option><option value="music">Music</option><option value="outdoor">Outdoor Play</option><option value="stem">STEM</option><option value="literacy">Literacy</option><option value="sensory">Sensory</option><option value="free_play">Free Play</option><option value="circle_time">Circle Time</option><option value="dramatic_play">Dramatic Play</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Date</label><input className="form-control" type="date" name="date" value={form.date} onChange={onChange} /></div>
            <div className="form-group"><label>Time</label><input className="form-control" type="time" name="time" value={form.time} onChange={onChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Duration (min)</label><input className="form-control" type="number" name="duration" value={form.duration} onChange={onChange} /></div>
            <div className="form-group"><label>Age Group</label>
              <select className="form-control" name="age_group" value={form.age_group} onChange={onChange}>
                <option value="">Select...</option><option value="infant">Infant</option><option value="toddler">Toddler</option><option value="preschool">Preschool</option><option value="school_age">School Age</option><option value="all">All Ages</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Classroom</label><input className="form-control" name="classroom" value={form.classroom} onChange={onChange} /></div>
            <div className="form-group"><label>Led By</label><input className="form-control" name="led_by" value={form.led_by} onChange={onChange} /></div>
          </div>
          <div className="form-group"><label>Status</label>
            <select className="form-control" name="status" value={form.status} onChange={onChange}>
              <option value="planned">Planned</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group"><label>Description</label><textarea className="form-control" name="description" value={form.description} onChange={onChange} /></div>
          <div className="form-group"><label>Materials Needed</label><textarea className="form-control" name="materials_needed" value={form.materials_needed} onChange={onChange} /></div>
          <div className="form-group"><label>Learning Objectives</label><textarea className="form-control" name="learning_objectives" value={form.learning_objectives} onChange={onChange} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default Activities;
