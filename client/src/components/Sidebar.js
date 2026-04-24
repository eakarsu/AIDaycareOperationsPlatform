import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaBaby, FaClipboardCheck, FaEnvelope, FaUsers, FaDollarSign,
  FaCalendarCheck, FaShieldAlt, FaUtensils, FaBrain, FaClock,
  FaTachometerAlt, FaSignOutAlt, FaUserPlus, FaPhoneAlt,
  FaDoorOpen, FaPuzzlePiece, FaSyringe, FaClipboardList, FaBoxes, FaFileAlt
} from 'react-icons/fa';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
  { divider: true, label: 'OPERATIONS' },
  { path: '/milestones', label: 'Child Milestones', icon: FaBaby },
  { path: '/compliance', label: 'Licensing Compliance', icon: FaClipboardCheck },
  { path: '/communications', label: 'Parent Communications', icon: FaEnvelope },
  { path: '/ratios', label: 'Staff Ratios', icon: FaUsers },
  { path: '/billing', label: 'Billing & Invoicing', icon: FaDollarSign },
  { divider: true, label: 'TRACKING' },
  { path: '/attendance', label: 'Attendance', icon: FaCalendarCheck },
  { path: '/incidents', label: 'Health & Safety', icon: FaShieldAlt },
  { path: '/meals', label: 'Meal Planning', icon: FaUtensils },
  { divider: true, label: 'MANAGEMENT' },
  { path: '/enrollment', label: 'Enrollment', icon: FaUserPlus },
  { path: '/emergency', label: 'Emergency Contacts', icon: FaPhoneAlt },
  { path: '/classrooms', label: 'Classrooms', icon: FaDoorOpen },
  { path: '/activities', label: 'Activities', icon: FaPuzzlePiece },
  { path: '/immunizations', label: 'Immunizations', icon: FaSyringe },
  { divider: true, label: 'MORE' },
  { path: '/waiting-list', label: 'Waiting List', icon: FaClipboardList },
  { path: '/inventory', label: 'Supply Inventory', icon: FaBoxes },
  { path: '/daily-reports', label: 'Daily Reports', icon: FaFileAlt },
  { divider: true, label: 'AI & SCHEDULING' },
  { path: '/assessments', label: 'AI Assessments', icon: FaBrain },
  { path: '/staff-scheduling', label: 'Staff Scheduling', icon: FaClock },
];

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <FaBaby />
        </div>
        <div>
          <h2>DayCare AI</h2>
          <small>Operations Platform</small>
        </div>
      </div>

      <ul className="sidebar-nav">
        {navItems.map((item, idx) => {
          if (item.divider) {
            return <li key={idx} className="sidebar-nav-label">{item.label}</li>;
          }
          const Icon = item.icon;
          return (
            <li key={idx} className="sidebar-nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-logout">
        <button onClick={handleLogout}>
          <FaSignOutAlt className="nav-icon" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
