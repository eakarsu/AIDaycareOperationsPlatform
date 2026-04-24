import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaSyringe, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';

const API = '/api/immunizations';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { child_name: '', vaccine_name: '', dose_number: '', date_administered: '', administered_by: '', next_due_date: '', status: 'up_to_date', notes: '' };

const Immunizations = () => {
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

  const openCreate = () => { setForm(emptyForm); setEditing(false); setShowForm(true); };
  const openDetail = (item) => { setSelected(item); setShowDetail(true); };
  const openEdit = () => { setForm({ ...emptyForm, ...selected, date_administered: selected.date_administered ? selected.date_administered.split('T')[0] : '', next_due_date: selected.next_due_date ? selected.next_due_date.split('T')[0] : '' }); setEditing(true); setShowDetail(false); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing && selected) { await axios.put(`${API}/${selected.id}`, form, { headers: headers() }); }
      else { await axios.post(API, form, { headers: headers() }); }
      setShowForm(false); fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Save failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this immunization record?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const statusBadge = (status) => {
    const map = { up_to_date: 'badge-success', overdue: 'badge-danger', due_soon: 'badge-warning', exempt: 'badge-secondary' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{(status || 'unknown').replace(/_/g, ' ')}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaSyringe style={{ marginRight: 10, color: '#00ACC1' }} />Immunization Records</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> Add Record</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Child</th><th>Vaccine</th><th>Dose #</th><th>Date Given</th><th>Next Due</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="table-empty"><p>No immunization records found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.child_name}</strong></td>
                <td>{item.vaccine_name}</td>
                <td>{item.dose_number}</td>
                <td>{item.date_administered ? new Date(item.date_administered).toLocaleDateString() : 'N/A'}</td>
                <td>{item.next_due_date ? new Date(item.next_due_date).toLocaleDateString() : 'N/A'}</td>
                <td>{statusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Immunization Details"
        footer={<div className="btn-group"><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-label">Child Name</div><div className="detail-value">{selected.child_name}</div></div>
            <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
            <div className="detail-item"><div className="detail-label">Vaccine Name</div><div className="detail-value">{selected.vaccine_name}</div></div>
            <div className="detail-item"><div className="detail-label">Dose Number</div><div className="detail-value">{selected.dose_number}</div></div>
            <div className="detail-item"><div className="detail-label">Date Administered</div><div className="detail-value">{selected.date_administered ? new Date(selected.date_administered).toLocaleDateString() : 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Administered By</div><div className="detail-value">{selected.administered_by || 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Next Due Date</div><div className="detail-value">{selected.next_due_date ? new Date(selected.next_due_date).toLocaleDateString() : 'N/A'}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Notes</div><div className="detail-value">{selected.notes || 'N/A'}</div></div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Record' : 'Add Immunization Record'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Child Name</label><input className="form-control" name="child_name" value={form.child_name} onChange={onChange} required /></div>
            <div className="form-group"><label>Vaccine Name</label>
              <select className="form-control" name="vaccine_name" value={form.vaccine_name} onChange={onChange} required>
                <option value="">Select...</option><option value="DTaP">DTaP</option><option value="IPV">IPV (Polio)</option><option value="MMR">MMR</option><option value="Hep B">Hepatitis B</option><option value="Hep A">Hepatitis A</option><option value="Hib">Hib</option><option value="PCV13">PCV13</option><option value="Rotavirus">Rotavirus</option><option value="Varicella">Varicella</option><option value="Influenza">Influenza</option><option value="COVID-19">COVID-19</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Dose Number</label><input className="form-control" type="number" name="dose_number" value={form.dose_number} onChange={onChange} min="1" /></div>
            <div className="form-group"><label>Status</label>
              <select className="form-control" name="status" value={form.status} onChange={onChange}>
                <option value="up_to_date">Up to Date</option><option value="overdue">Overdue</option><option value="due_soon">Due Soon</option><option value="exempt">Exempt</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Date Administered</label><input className="form-control" type="date" name="date_administered" value={form.date_administered} onChange={onChange} /></div>
            <div className="form-group"><label>Next Due Date</label><input className="form-control" type="date" name="next_due_date" value={form.next_due_date} onChange={onChange} /></div>
          </div>
          <div className="form-group"><label>Administered By</label><input className="form-control" name="administered_by" value={form.administered_by} onChange={onChange} /></div>
          <div className="form-group"><label>Notes</label><textarea className="form-control" name="notes" value={form.notes} onChange={onChange} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default Immunizations;
