import React, { useState, useEffect, createContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Milestones from './pages/Milestones';
import Compliance from './pages/Compliance';
import Communications from './pages/Communications';
import Ratios from './pages/Ratios';
import Billing from './pages/Billing';
import Attendance from './pages/Attendance';
import Incidents from './pages/Incidents';
import Meals from './pages/Meals';
import Assessments from './pages/Assessments';
import StaffScheduling from './pages/StaffScheduling';
import Enrollment from './pages/Enrollment';
import Emergency from './pages/Emergency';
import Classrooms from './pages/Classrooms';
import Activities from './pages/Activities';
import Immunizations from './pages/Immunizations';
import WaitingList from './pages/WaitingList';
import Inventory from './pages/Inventory';
import DailyReports from './pages/DailyReports';

export const AuthContext = createContext(null);

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar onLogout={() => window.location.reload()} />
      <main className="main-content">{children}</main>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch {}
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/milestones" element={<ProtectedRoute><Milestones /></ProtectedRoute>} />
        <Route path="/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
        <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
        <Route path="/ratios" element={<ProtectedRoute><Ratios /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
        <Route path="/meals" element={<ProtectedRoute><Meals /></ProtectedRoute>} />
        <Route path="/assessments" element={<ProtectedRoute><Assessments /></ProtectedRoute>} />
        <Route path="/staff-scheduling" element={<ProtectedRoute><StaffScheduling /></ProtectedRoute>} />
        <Route path="/enrollment" element={<ProtectedRoute><Enrollment /></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
        <Route path="/classrooms" element={<ProtectedRoute><Classrooms /></ProtectedRoute>} />
        <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
        <Route path="/immunizations" element={<ProtectedRoute><Immunizations /></ProtectedRoute>} />
        <Route path="/waiting-list" element={<ProtectedRoute><WaitingList /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/daily-reports" element={<ProtectedRoute><DailyReports /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
