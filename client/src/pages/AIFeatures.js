import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaFlask, FaUtensils, FaShieldAlt, FaUsers, FaDollarSign, FaHistory, FaUserClock, FaBalanceScale } from 'react-icons/fa';
import AIOutput from '../components/AIOutput';

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const AIFeatures = () => {
  const [tab, setTab] = useState('allergy');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Allergy
  const [meals, setMeals] = useState([]);
  const [mealId, setMealId] = useState('');

  // Sibling
  const [parentName, setParentName] = useState('');

  // Tuition
  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState('');
  const [baseTuition, setBaseTuition] = useState(1500);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [subsidyProgram, setSubsidyProgram] = useState('');
  const [hasSiblingDiscount, setHasSiblingDiscount] = useState(false);

  // Staff burnout
  const [burnoutStaffName, setBurnoutStaffName] = useState('');
  const [burnoutClassroom, setBurnoutClassroom] = useState('');

  // State compliance
  const [complianceState, setComplianceState] = useState('CA');
  const [complianceRequirement, setComplianceRequirement] = useState('');
  const [complianceCategory, setComplianceCategory] = useState('');
  const [complianceStatus, setComplianceStatus] = useState('');
  const [complianceNotes, setComplianceNotes] = useState('');

  // History
  const [history, setHistory] = useState([]);
  const [historyFeature, setHistoryFeature] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    axios.get('/api/meals', { headers: headers() }).then((r) => setMeals(Array.isArray(r.data) ? r.data : [])).catch(() => setMeals([]));
    axios.get('/api/children', { headers: headers() }).then((r) => setChildren(Array.isArray(r.data) ? r.data : [])).catch(() => setChildren([]));
  }, []);

  const callApi = async (path, body = {}) => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(path, body, { headers: headers() });
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 503) {
        setError(err.response?.data?.error || 'AI service unavailable: API key not configured.');
      } else {
        setError(err.response?.data?.error || err.message || 'Request failed');
      }
    }
    setRunning(false);
  };

  const loadHistory = useCallback(async (p = 1) => {
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (historyFeature) params.append('feature', historyFeature);
      const r = await axios.get(`/api/ai-features/results?${params.toString()}`, { headers: headers() });
      setHistory(r.data.data || []);
      setPage(r.data.pagination?.page || 1);
      setTotalPages(r.data.pagination?.totalPages || 1);
    } catch {
      setHistory([]);
    }
  }, [historyFeature]);

  useEffect(() => { if (tab === 'history') loadHistory(1); }, [tab, loadHistory]);

  return (
    <div className="animate-in">
      <div className="page-toolbar">
        <h1><FaFlask style={{ marginRight: 10, color: '#7C4DFF' }} />AI Features</h1>
      </div>

      <div className="btn-group" style={{ marginBottom: 16, gap: 8 }}>
        <button className={`btn ${tab === 'allergy' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('allergy')}><FaUtensils /> Allergy Check</button>
        <button className={`btn ${tab === 'drill' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('drill')}><FaShieldAlt /> Emergency Drill</button>
        <button className={`btn ${tab === 'sibling' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('sibling')}><FaUsers /> Sibling Coord</button>
        <button className={`btn ${tab === 'tuition' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('tuition')}><FaDollarSign /> Tuition Calc</button>
        <button className={`btn ${tab === 'burnout' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('burnout')}><FaUserClock /> Staff Burnout</button>
        <button className={`btn ${tab === 'state' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('state')}><FaBalanceScale /> State Compliance</button>
        <button className={`btn ${tab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('history')}><FaHistory /> History</button>
      </div>

      {tab === 'allergy' && (
        <div className="ai-section">
          <h3>Allergy & Dietary Conflict Check</h3>
          <p>Cross-checks a meal plan against every enrolled child's known allergies, flagging risks.</p>
          <div className="form-group">
            <label>Meal</label>
            <select className="form-input" value={mealId} onChange={(e) => setMealId(e.target.value)}>
              <option value="">— select a meal —</option>
              {meals.map((m) => <option key={m.id} value={m.id}>{m.meal_name} ({m.meal_type})</option>)}
            </select>
          </div>
          <button className="btn btn-primary" disabled={!mealId || running} onClick={() => callApi('/api/ai-features/allergy-conflict-check', { meal_id: mealId })}>
            {running ? 'Running…' : 'Run Allergy Check'}
          </button>
        </div>
      )}

      {tab === 'drill' && (
        <div className="ai-section">
          <h3>Emergency Drill Recommender</h3>
          <p>Audits past drill cadence and recommends the next required drill.</p>
          <button className="btn btn-primary" disabled={running} onClick={() => callApi('/api/ai-features/emergency-drill-recommend', {})}>
            {running ? 'Running…' : 'Get Recommendation'}
          </button>
        </div>
      )}

      {tab === 'sibling' && (
        <div className="ai-section">
          <h3>Sibling Classroom Coordinator</h3>
          <p>Groups siblings for the same parent and proposes classroom + pickup logistics.</p>
          <div className="form-group">
            <label>Parent name (full or partial match)</label>
            <input className="form-input" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="e.g. Smith" />
          </div>
          <button className="btn btn-primary" disabled={!parentName || running} onClick={() => callApi('/api/ai-features/sibling-classroom-coord', { parent_name: parentName })}>
            {running ? 'Running…' : 'Coordinate'}
          </button>
        </div>
      )}

      {tab === 'tuition' && (
        <div className="ai-section">
          <h3>Tuition & Subsidy Calculator</h3>
          <p>Builds a tuition + subsidy + sibling-discount + part-time prorate breakdown.</p>
          <div className="form-group">
            <label>Child</label>
            <select className="form-input" value={childId} onChange={(e) => setChildId(e.target.value)}>
              <option value="">— select —</option>
              {children.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Base tuition (USD/month)</label>
            <input className="form-input" type="number" value={baseTuition} onChange={(e) => setBaseTuition(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-group"><label>Hours per week</label>
            <input className="form-input" type="number" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(parseInt(e.target.value) || 40)} />
          </div>
          <div className="form-group"><label>Subsidy program</label>
            <select className="form-input" value={subsidyProgram} onChange={(e) => setSubsidyProgram(e.target.value)}>
              <option value="">none</option>
              <option value="CCDF">CCDF</option>
              <option value="Head Start">Head Start</option>
              <option value="Military">Military</option>
              <option value="State">State subsidy</option>
            </select>
          </div>
          <div className="form-group">
            <label><input type="checkbox" checked={hasSiblingDiscount} onChange={(e) => setHasSiblingDiscount(e.target.checked)} /> Sibling discount eligible</label>
          </div>
          <button className="btn btn-primary" disabled={!childId || running} onClick={() => callApi('/api/ai-features/tuition-subsidy-calc', { child_id: childId, base_tuition: baseTuition, hours_per_week: hoursPerWeek, subsidy_program: subsidyProgram, has_sibling_discount: hasSiblingDiscount })}>
            {running ? 'Running…' : 'Calculate'}
          </button>
        </div>
      )}

      {tab === 'burnout' && (
        <div className="ai-section">
          <h3>Staff Burnout Predictor</h3>
          <p>Scores burnout risk from recent schedule + incident exposure and recommends interventions.</p>
          <div className="form-group">
            <label>Staff name (optional, partial match)</label>
            <input className="form-input" value={burnoutStaffName} onChange={(e) => setBurnoutStaffName(e.target.value)} placeholder="e.g. Maria" />
          </div>
          <div className="form-group">
            <label>Classroom (optional)</label>
            <input className="form-input" value={burnoutClassroom} onChange={(e) => setBurnoutClassroom(e.target.value)} placeholder="e.g. Toddler Room A" />
          </div>
          <button className="btn btn-primary" disabled={running} onClick={() => callApi('/api/ai/staff-burnout-predictor', { staff_name: burnoutStaffName || undefined, classroom: burnoutClassroom || undefined })}>
            {running ? 'Running…' : 'Predict Burnout Risk'}
          </button>
        </div>
      )}

      {tab === 'state' && (
        <div className="ai-section">
          <h3>State-Specific Compliance Check</h3>
          <p>Variant of compliance-check parameterized by US state for state-specific licensing rules.</p>
          <div className="form-group">
            <label>US State (2-letter code or full name)</label>
            <input className="form-input" value={complianceState} onChange={(e) => setComplianceState(e.target.value)} placeholder="CA" />
          </div>
          <div className="form-group">
            <label>Requirement</label>
            <input className="form-input" value={complianceRequirement} onChange={(e) => setComplianceRequirement(e.target.value)} placeholder="Annual fire-drill log" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input className="form-input" value={complianceCategory} onChange={(e) => setComplianceCategory(e.target.value)} placeholder="Safety" />
          </div>
          <div className="form-group">
            <label>Status</label>
            <input className="form-input" value={complianceStatus} onChange={(e) => setComplianceStatus(e.target.value)} placeholder="In progress" />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-input" rows={3} value={complianceNotes} onChange={(e) => setComplianceNotes(e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={!complianceState || !complianceRequirement || running} onClick={() => callApi('/api/ai/state-compliance-check', { state: complianceState, compliance: { requirement: complianceRequirement, category: complianceCategory, status: complianceStatus, notes: complianceNotes } })}>
            {running ? 'Running…' : 'Check'}
          </button>
        </div>
      )}

      {tab === 'history' && (
        <div className="ai-section">
          <h3>AI Run History</h3>
          <div className="form-group" style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label>Filter by feature</label>
              <select className="form-input" value={historyFeature} onChange={(e) => setHistoryFeature(e.target.value)}>
                <option value="">all</option>
                <option value="allergy_conflict_check">allergy_conflict_check</option>
                <option value="emergency_drill_recommend">emergency_drill_recommend</option>
                <option value="sibling_classroom_coord">sibling_classroom_coord</option>
                <option value="tuition_subsidy_calc">tuition_subsidy_calc</option>
              </select>
            </div>
            <button className="btn btn-secondary" onClick={() => loadHistory(1)}>Reload</button>
          </div>
          <div className="table-container" style={{ marginTop: 12 }}>
            <table className="data-table">
              <thead><tr><th>ID</th><th>Feature</th><th>Child</th><th>Success</th><th>Created</th></tr></thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} onClick={() => setResult(h.output)}>
                    <td>{h.id}</td>
                    <td>{h.feature}</td>
                    <td>{h.child_id || '-'}</td>
                    <td>{h.success ? '✓' : '✕'}</td>
                    <td>{new Date(h.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {history.length === 0 && <tr><td colSpan="5" className="table-empty">No runs yet</td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => loadHistory(page - 1)}>← Prev</button>
            <span style={{ alignSelf: 'center' }}>Page {page} / {totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => loadHistory(page + 1)}>Next →</button>
          </div>
        </div>
      )}

      {error && (
        <div className="ai-section" style={{ borderLeft: '4px solid #d32f2f', background: '#ffebee', marginTop: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h3>AI Result</h3>
          <AIOutput data={result} />
        </div>
      )}
    </div>
  );
};

export default AIFeatures;
