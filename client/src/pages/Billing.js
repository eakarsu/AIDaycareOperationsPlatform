import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaDollarSign, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Modal from '../components/Modal';

const API = '/api/billing';
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const emptyForm = { parent_name: '', child_name: '', amount: '', description: '', status: 'pending', due_date: '', invoice_number: '', payment_method: '' };

const Billing = () => {
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
    if (!window.confirm('Delete this billing record?')) return;
    try { await axios.delete(`${API}/${selected.id}`, { headers: headers() }); setShowDetail(false); fetchData(); } catch { alert('Delete failed'); }
  };

  const statusBadge = (status) => {
    const map = { paid: 'badge-success', pending: 'badge-warning', overdue: 'badge-danger', cancelled: 'badge-secondary' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status || 'unknown'}</span>;
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaDollarSign style={{ marginRight: 10, color: '#00897B' }} />Billing & Invoicing</h1>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus /> New Invoice</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Invoice #</th><th>Parent</th><th>Child</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="6" className="table-empty"><p>No billing records found.</p></td></tr>
            ) : items.map(item => (
              <tr key={item.id} onClick={() => openDetail(item)}>
                <td><strong>{item.invoice_number || `INV-${item.id}`}</strong></td>
                <td>{item.parent_name}</td>
                <td>{item.child_name}</td>
                <td>${parseFloat(item.amount || 0).toFixed(2)}</td>
                <td>{item.due_date ? new Date(item.due_date).toLocaleDateString() : 'N/A'}</td>
                <td>{statusBadge(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Invoice Details"
        footer={<div className="btn-group"><button className="btn btn-primary" onClick={openEdit}><FaEdit /> Edit</button><button className="btn btn-danger" onClick={handleDelete}><FaTrash /> Delete</button></div>}>
        {selected && (
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-label">Invoice Number</div><div className="detail-value">{selected.invoice_number || `INV-${selected.id}`}</div></div>
            <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{statusBadge(selected.status)}</div></div>
            <div className="detail-item"><div className="detail-label">Parent Name</div><div className="detail-value">{selected.parent_name}</div></div>
            <div className="detail-item"><div className="detail-label">Child Name</div><div className="detail-value">{selected.child_name}</div></div>
            <div className="detail-item"><div className="detail-label">Amount</div><div className="detail-value" style={{ fontSize: 20, fontWeight: 700 }}>${parseFloat(selected.amount || 0).toFixed(2)}</div></div>
            <div className="detail-item"><div className="detail-label">Due Date</div><div className="detail-value">{selected.due_date ? new Date(selected.due_date).toLocaleDateString() : 'N/A'}</div></div>
            <div className="detail-item"><div className="detail-label">Payment Method</div><div className="detail-value">{selected.payment_method || 'N/A'}</div></div>
            <div className="detail-item detail-full"><div className="detail-label">Description</div><div className="detail-value">{selected.description || 'N/A'}</div></div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Invoice' : 'New Invoice'}
        footer={<div className="btn-group"><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Update' : 'Create'}</button></div>}>
        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group"><label>Parent Name</label><input className="form-control" name="parent_name" value={form.parent_name} onChange={onChange} required /></div>
            <div className="form-group"><label>Child Name</label><input className="form-control" name="child_name" value={form.child_name} onChange={onChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Invoice Number</label><input className="form-control" name="invoice_number" value={form.invoice_number} onChange={onChange} placeholder="Auto-generated if empty" /></div>
            <div className="form-group"><label>Amount ($)</label><input className="form-control" type="number" step="0.01" name="amount" value={form.amount} onChange={onChange} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Due Date</label><input className="form-control" type="date" name="due_date" value={form.due_date} onChange={onChange} /></div>
            <div className="form-group"><label>Status</label>
              <select className="form-control" name="status" value={form.status} onChange={onChange}>
                <option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option><option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Payment Method</label>
            <select className="form-control" name="payment_method" value={form.payment_method} onChange={onChange}>
              <option value="">Select...</option><option value="credit_card">Credit Card</option><option value="bank_transfer">Bank Transfer</option><option value="cash">Cash</option><option value="check">Check</option>
            </select>
          </div>
          <div className="form-group"><label>Description</label><textarea className="form-control" name="description" value={form.description} onChange={onChange} /></div>
        </form>
      </Modal>
    </div>
  );
};

export default Billing;
