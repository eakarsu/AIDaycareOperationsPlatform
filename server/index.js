const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — env-driven allow list (CORS_ORIGINS=https://a.com,https://b.com), fallback '*' in dev.
const corsOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/children', require('./routes/children'));
app.use('/api/milestones', require('./routes/milestones'));
app.use('/api/compliance', require('./routes/compliance'));
app.use('/api/communications', require('./routes/communications'));
app.use('/api/ratios', require('./routes/ratios'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/ai', require('./routes/aiNew'));





app.use('/api/ai', require('./routes/nutritionOptimize'));
app.use('/api/ai', require('./routes/curriculumPersonal'));
app.use('/api/ai', require('./routes/staffBurnout'));
app.use('/api/ai', require('./routes/parentEngage'));
app.use('/api/ai', require('./routes/developmentFlag'));
app.use('/api/ai-features', require('./routes/aiFeatures'));
app.use('/api/enrollment', require('./routes/enrollment'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/classrooms', require('./routes/classrooms'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/immunizations', require('./routes/immunizations'));
app.use('/api/waitlist', require('./routes/waitlist'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/dailyreports', require('./routes/dailyreports'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-none-major-strong-ai-to-route-alignment-across-compliance-mi', require('./routes/gap_none_major_strong_ai_to_route_alignment_across_compliance_mi'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-inventory-lacks-ai-reorder-prediction', require('./routes/gap_inventory_lacks_ai_reorder_prediction'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-attendance-lacks-ai-no-show-prediction', require('./routes/gap_attendance_lacks_ai_no_show_prediction'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-photo-video-sharing-with-parents-privacy-compliant', require('./routes/gap_no_photo_video_sharing_with_parents_privacy_compliant'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-limited-mobile-app-for-parents-only-stub-hooks', require('./routes/gap_limited_mobile_app_for_parents_only_stub_hooks'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-limited-integration-with-health-immunization-registries', require('./routes/gap_limited_integration_with_health_immunization_registries'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-state-specific-compliance-validation-rules-engine', require('./routes/gap_no_state_specific_compliance_validation_rules_engine'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-webhooks', require('./routes/gap_no_webhooks'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
