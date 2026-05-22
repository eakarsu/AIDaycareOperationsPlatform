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
import AIFeatures from './pages/AIFeatures';
import AllergyActionPlan from './pages/AllergyActionPlan';

// // === Batch 02 Gaps & Frontend Mounts ===
import CfPredictiveChildDevelopmentFlagging from './pages/CfPredictiveChildDevelopmentFlagging';
import CfParentEngagementPrediction from './pages/CfParentEngagementPrediction';
import CfStaffBurnoutPrediction from './pages/CfStaffBurnoutPrediction';
import CfCurriculumPersonalization from './pages/CfCurriculumPersonalization';
import CfNutritionOptimization from './pages/CfNutritionOptimization';
import GapNoneMajorStrongAiToRouteAlignmentAcrossComplianceMi from './pages/GapNoneMajorStrongAiToRouteAlignmentAcrossComplianceMi';
import GapInventoryLacksAiReorderPrediction from './pages/GapInventoryLacksAiReorderPrediction';
import GapAttendanceLacksAiNoShowPrediction from './pages/GapAttendanceLacksAiNoShowPrediction';
import GapNoPhotoVideoSharingWithParentsPrivacyCompliant from './pages/GapNoPhotoVideoSharingWithParentsPrivacyCompliant';
import GapLimitedMobileAppForParentsOnlyStubHooks from './pages/GapLimitedMobileAppForParentsOnlyStubHooks';
import GapLimitedIntegrationWithHealthImmunizationRegistries from './pages/GapLimitedIntegrationWithHealthImmunizationRegistries';
import GapNoStateSpecificComplianceValidationRulesEngine from './pages/GapNoStateSpecificComplianceValidationRulesEngine';
import GapNoWebhooks from './pages/GapNoWebhooks';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

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
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

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
        <Route path="/allergy-action-plan" element={<ProtectedRoute><AllergyActionPlan /></ProtectedRoute>} />
        <Route path="/ai-features" element={<ProtectedRoute><AIFeatures /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      
        {/* // === Batch 02 Gaps & Frontend Mounts === */}
        <Route path="/cf/predictive-child-development-flagging" element={<CfPredictiveChildDevelopmentFlagging />} />
        <Route path="/cf/parent-engagement-prediction" element={<CfParentEngagementPrediction />} />
        <Route path="/cf/staff-burnout-prediction" element={<CfStaffBurnoutPrediction />} />
        <Route path="/cf/curriculum-personalization" element={<CfCurriculumPersonalization />} />
        <Route path="/cf/nutrition-optimization" element={<CfNutritionOptimization />} />
        <Route path="/gap/none-major-strong-ai-to-route-alignment-across-compliance-mi" element={<GapNoneMajorStrongAiToRouteAlignmentAcrossComplianceMi />} />
        <Route path="/gap/inventory-lacks-ai-reorder-prediction" element={<GapInventoryLacksAiReorderPrediction />} />
        <Route path="/gap/attendance-lacks-ai-no-show-prediction" element={<GapAttendanceLacksAiNoShowPrediction />} />
        <Route path="/gap/no-photo-video-sharing-with-parents-privacy-compliant" element={<GapNoPhotoVideoSharingWithParentsPrivacyCompliant />} />
        <Route path="/gap/limited-mobile-app-for-parents-only-stub-hooks" element={<GapLimitedMobileAppForParentsOnlyStubHooks />} />
        <Route path="/gap/limited-integration-with-health-immunization-registries" element={<GapLimitedIntegrationWithHealthImmunizationRegistries />} />
        <Route path="/gap/no-state-specific-compliance-validation-rules-engine" element={<GapNoStateSpecificComplianceValidationRulesEngine />} />
        <Route path="/gap/no-webhooks" element={<GapNoWebhooks />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
