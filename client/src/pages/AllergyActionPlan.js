import React, { useEffect, useState } from 'react';

export default function AllergyActionPlan() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/allergy-action-plan', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    })
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData({ error: 'Unable to load allergy action plan.' }));
  }, []);

  if (!data) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Allergy Action Plan</h1>
      <p>Classroom allergy plans, medication expirations, signatures, and meal-service safeguards.</p>
      <div className="stats-grid">
        <div className="stat-card"><strong>{data.summary?.activePlans}</strong><span>Active Plans</span></div>
        <div className="stat-card"><strong>{data.summary?.missingSignatures}</strong><span>Missing Signatures</span></div>
        <div className="stat-card"><strong>{data.summary?.epipenExpiring}</strong><span>EpiPens Expiring</span></div>
        <div className="stat-card"><strong>{data.summary?.highRiskRooms}</strong><span>High-Risk Rooms</span></div>
      </div>
      <div className="card">
        {data.rooms?.map((room) => (
          <div key={room.room} className="table-row">
            <strong>{room.room}</strong><span>{room.allergens}</span><span>{room.status}</span><span>{room.action}</span>
          </div>
        ))}
      </div>
      <div className="card"><h2>Safeguards</h2><ul>{data.safeguards?.map((item) => <li key={item}>{item}</li>)}</ul></div>
    </div>
  );
}
