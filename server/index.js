const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters');
}
if (process.env.NODE_ENV === 'production' && (!process.env.CORS_ORIGINS || process.env.CORS_ORIGINS.includes('*'))) {
  throw new Error('Production CORS_ORIGINS must be an explicit allowlist');
}
for (const key of ['DB_NAME', 'DB_USER', 'DB_PASSWORD']) {
  if (!process.env[key]) throw new Error(`${key} is required`);
}

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
app.use('/api/allergy-action-plan', require('./routes/allergyActionPlan'));
app.use('/api/governed-workflows', require('./routes/governedWorkflow'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
