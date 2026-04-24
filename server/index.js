const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Middleware
app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
