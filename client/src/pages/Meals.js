import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaUtensils, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';
import AIOutput from '../components/AIOutput';

const API = '/api/meals';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { meal_name: '', meal_type: 'lunch', date: '', description: '', calories: '', allergens: '', age_group: '', servings: '', notes: '' };

const Meals = () => {
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
    if (!window.confirm('Delete this meal plan?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const handleAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await axios.post('/api/ai/nutrition-analysis', { meal: selected }, { headers: headers() }); setAiResult(res.data); }
    catch { setAiResult({ analysis: 'AI nutrition analysis could not be completed. Please ensure the AI service is configured.' }); }
    setAiLoading(false);
  };

  const typeBadge = (type) => {
    const map = { breakfast: 'badge-warning', lunch: 'badge-success', snack: 'badge-info', dinner: 'badge-purple' };
    return <span className={`badge ${map[type] || 'badge-secondary'}`}>{type || 'unknown'}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaUtensils style={{ marginRight: 10, color: '#FF8F00' }} />Meal Planning</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Add Meal Plan</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Meal Name</th><th>Type</th><th>Date</th><th>Age Group</th><th>Calories</th><th>Allergens</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="table-empty"><p>No meal plans found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.meal_name}</strong></td>
                <td>{typeBadge(item.meal_type)}</td>
                <td>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                <td>{item.age_group}</td>
                <td>{item.calories || 'N/A'}</td>
                <td>{item.allergens || 'None'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Meal Plan Details"
        footer={<div className="btn-group"><button className="btn btn-ai" onClick={handleAI}>AI Nutrition Analysis</button><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Meal Name</div><div className="detail-value">{selected.meal_name}</div></div>
              <div className="detail-item"><div className="detail-label">Type</div><div className="detail-value">{typeBadge(selected.meal_type)}</div></div>
              <div className="detail-item"><div className="detail-label">Date</div><div className="detail-value">{selected.date ? new Date(selected.date).toLocaleDateString() : 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Age Group</div><div className="detail-value">{selected.age_group || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Calories</div><div className="detail-value">{selected.calories || 'N/A'}</div></div>
              <div className="detail-item"><div className="detail-label">Servings</div><div className="detail-value">{selected.servings || 'N/A'}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Description</div><div className="detail-value">{selected.description || 'N/A'}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Allergens</div><div className="detail-value">{selected.allergens || 'None'}</div></div>
              <div className="detail-item detail-full"><div className="detail-label">Notes</div><div className="detail-value">{selected.notes || 'N/A'}</div></div>
            </div>
            <AIOutput loading={aiLoading} data={aiResult} />
          </>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Meal Plan' : 'Add Meal Plan'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Meal Name</label><input className="form-control" name="meal_name" value={form.meal_name} onChange={onChange} required /></div>
            <div className="form-group"><label>Meal Type</label>
              <select className="form-control" name="meal_type" value={form.meal_type} onChange={onChange}>
                <option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="snack">Snack</option><option value="dinner">Dinner</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Date</label><input className="form-control" type="date" name="date" value={form.date} onChange={onChange} /></div>
            <div className="form-group"><label>Age Group</label>
              <select className="form-control" name="age_group" value={form.age_group} onChange={onChange}>
                <option value="">Select...</option><option value="infant">Infant</option><option value="toddler">Toddler</option><option value="preschool">Preschool</option><option value="school_age">School Age</option><option value="all">All Ages</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Calories</label><input className="form-control" type="number" name="calories" value={form.calories} onChange={onChange} /></div>
            <div className="form-group"><label>Servings</label><input className="form-control" type="number" name="servings" value={form.servings} onChange={onChange} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea className="form-control" name="description" value={form.description} onChange={onChange} /></div>
          <div className="form-group"><label>Allergens</label><input className="form-control" name="allergens" value={form.allergens} onChange={onChange} placeholder="e.g., nuts, dairy, gluten" /></div>
          <div className="form-group"><label>Notes</label><textarea className="form-control" name="notes" value={form.notes} onChange={onChange} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default Meals;
