import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaBaby, FaClipboardCheck, FaEnvelope, FaUsers, FaDollarSign,
  FaCalendarCheck, FaShieldAlt, FaUtensils, FaBrain, FaClock,
  FaUserPlus, FaPhoneAlt, FaDoorOpen, FaPuzzlePiece, FaSyringe,
  FaClipboardList, FaBoxes, FaFileAlt
} from 'react-icons/fa';

const cards = [
  { key: 'milestones', label: 'Child Milestones', icon: FaBaby, color: 'card-blue', path: '/milestones', api: '/api/milestones' },
  { key: 'compliance', label: 'Licensing Compliance', icon: FaClipboardCheck, color: 'card-green', path: '/compliance', api: '/api/compliance' },
  { key: 'communications', label: 'Parent Communications', icon: FaEnvelope, color: 'card-orange', path: '/communications', api: '/api/communications' },
  { key: 'ratios', label: 'Staff Ratios', icon: FaUsers, color: 'card-purple', path: '/ratios', api: '/api/ratios' },
  { key: 'billing', label: 'Billing & Invoicing', icon: FaDollarSign, color: 'card-teal', path: '/billing', api: '/api/billing' },
  { key: 'attendance', label: 'Attendance Tracking', icon: FaCalendarCheck, color: 'card-pink', path: '/attendance', api: '/api/attendance' },
  { key: 'incidents', label: 'Health & Safety', icon: FaShieldAlt, color: 'card-red', path: '/incidents', api: '/api/incidents' },
  { key: 'meals', label: 'Meal Planning', icon: FaUtensils, color: 'card-amber', path: '/meals', api: '/api/meals' },
  { key: 'assessments', label: 'AI Assessments', icon: FaBrain, color: 'card-indigo', path: '/assessments', api: '/api/assessments' },
  { key: 'staff', label: 'Staff Scheduling', icon: FaClock, color: 'card-cyan', path: '/staff-scheduling', api: '/api/staff' },
  { key: 'enrollment', label: 'Enrollment', icon: FaUserPlus, color: 'card-green', path: '/enrollment', api: '/api/enrollment' },
  { key: 'emergency', label: 'Emergency Contacts', icon: FaPhoneAlt, color: 'card-red', path: '/emergency', api: '/api/emergency' },
  { key: 'classrooms', label: 'Classrooms', icon: FaDoorOpen, color: 'card-indigo', path: '/classrooms', api: '/api/classrooms' },
  { key: 'activities', label: 'Activities', icon: FaPuzzlePiece, color: 'card-orange', path: '/activities', api: '/api/activities' },
  { key: 'immunizations', label: 'Immunizations', icon: FaSyringe, color: 'card-teal', path: '/immunizations', api: '/api/immunizations' },
  { key: 'waitlist', label: 'Waiting List', icon: FaClipboardList, color: 'card-orange', path: '/waiting-list', api: '/api/waitlist' },
  { key: 'inventory', label: 'Supply Inventory', icon: FaBoxes, color: 'card-purple', path: '/inventory', api: '/api/inventory' },
  { key: 'dailyreports', label: 'Daily Reports', icon: FaFileAlt, color: 'card-teal', path: '/daily-reports', api: '/api/dailyreports' },
];

const Dashboard = () => {
  const [counts, setCounts] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    cards.forEach(card => {
      axios.get(card.api, { headers })
        .then(res => {
          const data = res.data;
          const count = Array.isArray(data) ? data.length : (data.count || data.total || 0);
          setCounts(prev => ({ ...prev, [card.key]: count }));
        })
        .catch(() => {
          setCounts(prev => ({ ...prev, [card.key]: 0 }));
        });
    });
  }, [token]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Welcome back, {user.name || 'Admin'}</h1>
        <p>Here is an overview of your daycare operations</p>
      </div>

      <div className="dashboard-grid">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className={`dashboard-card ${card.color}`}
              onClick={() => navigate(card.path)}
            >
              <div className="dashboard-card-icon">
                <Icon />
              </div>
              <h3>{card.label}</h3>
              <div className="card-count">{counts[card.key] ?? '--'}</div>
              <div className="card-label">Total Records</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
