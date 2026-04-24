-- AI Daycare Operations Platform - Database Schema & Seed Data

-- Drop existing tables
DROP TABLE IF EXISTS daily_reports CASCADE;
DROP TABLE IF EXISTS supply_inventory CASCADE;
DROP TABLE IF EXISTS waitlist CASCADE;
DROP TABLE IF EXISTS immunizations CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS classrooms CASCADE;
DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS ai_assessments CASCADE;
DROP TABLE IF EXISTS staff_schedules CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS billing CASCADE;
DROP TABLE IF EXISTS staff_ratios CASCADE;
DROP TABLE IF EXISTS parent_communications CASCADE;
DROP TABLE IF EXISTS licensing_compliance CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Children table
CREATE TABLE children (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  age_group VARCHAR(50),
  classroom VARCHAR(50),
  parent_name VARCHAR(255),
  parent_email VARCHAR(255),
  parent_phone VARCHAR(20),
  allergies TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Milestones table
CREATE TABLE milestones (
  id SERIAL PRIMARY KEY,
  child_name VARCHAR(255) NOT NULL,
  milestone_type VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'in_progress',
  age_months INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Licensing Compliance table
CREATE TABLE licensing_compliance (
  id SERIAL PRIMARY KEY,
  requirement TEXT NOT NULL,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  responsible_person VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Parent Communications table
CREATE TABLE parent_communications (
  id SERIAL PRIMARY KEY,
  parent_name VARCHAR(255) NOT NULL,
  child_name VARCHAR(255),
  subject VARCHAR(500),
  message TEXT,
  type VARCHAR(50) DEFAULT 'general',
  status VARCHAR(50) DEFAULT 'sent',
  priority VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staff Ratios table
CREATE TABLE staff_ratios (
  id SERIAL PRIMARY KEY,
  classroom VARCHAR(100) NOT NULL,
  age_group VARCHAR(50),
  staff_count INTEGER DEFAULT 0,
  child_count INTEGER DEFAULT 0,
  required_ratio VARCHAR(20),
  actual_ratio VARCHAR(20),
  status VARCHAR(50) DEFAULT 'compliant',
  ai_suggestion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Billing table
CREATE TABLE billing (
  id SERIAL PRIMARY KEY,
  parent_name VARCHAR(255) NOT NULL,
  child_name VARCHAR(255),
  amount DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  invoice_number VARCHAR(50),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance table
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  child_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status VARCHAR(50) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Incidents table
CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  child_name VARCHAR(255) NOT NULL,
  incident_type VARCHAR(100),
  description TEXT,
  severity VARCHAR(50) DEFAULT 'low',
  date DATE,
  time TIME,
  location VARCHAR(255),
  action_taken TEXT,
  reported_by VARCHAR(255),
  parent_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Meal Plans table
CREATE TABLE meal_plans (
  id SERIAL PRIMARY KEY,
  meal_name VARCHAR(255) NOT NULL,
  meal_type VARCHAR(50),
  date DATE,
  age_group VARCHAR(50),
  description TEXT,
  calories INTEGER,
  allergens TEXT,
  servings INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI Assessments table
CREATE TABLE ai_assessments (
  id SERIAL PRIMARY KEY,
  child_name VARCHAR(255) NOT NULL,
  assessment_type VARCHAR(100),
  date DATE,
  evaluator VARCHAR(255),
  score VARCHAR(50),
  age_group VARCHAR(50),
  areas_evaluated TEXT,
  strengths TEXT,
  areas_for_improvement TEXT,
  recommendations TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Staff Schedules table
CREATE TABLE staff_schedules (
  id SERIAL PRIMARY KEY,
  staff_name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  date DATE,
  shift_start TIME,
  shift_end TIME,
  classroom VARCHAR(100),
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SEED DATA: Admin user (password: admin123)
-- ============================================================
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@daycare.com', '$2a$10$FRnpJUVwPjtNCwEsOzYtI.Xo4P1aN7VurJfJUuawOqmcFXfKLiWEC', 'admin');

-- ============================================================
-- SEED DATA: Children (15 items)
-- ============================================================
INSERT INTO children (first_name, last_name, date_of_birth, age_group, classroom, parent_name, parent_email, parent_phone, allergies, notes) VALUES
('Emma', 'Johnson', '2022-03-15', 'toddler', 'Sunshine Room', 'Sarah Johnson', 'sarah.j@email.com', '555-0101', 'None', 'Very social, loves group activities'),
('Liam', 'Williams', '2023-01-20', 'infant', 'Rainbow Room', 'Mike Williams', 'mike.w@email.com', '555-0102', 'Dairy', 'Needs dairy-free formula'),
('Sophia', 'Brown', '2021-07-10', 'preschool', 'Star Room', 'Jennifer Brown', 'jen.b@email.com', '555-0103', 'Peanuts', 'Advanced reading skills'),
('Noah', 'Davis', '2022-11-05', 'toddler', 'Sunshine Room', 'Amanda Davis', 'amanda.d@email.com', '555-0104', 'None', 'Transitioning from bottles'),
('Olivia', 'Martinez', '2021-04-22', 'preschool', 'Star Room', 'Carlos Martinez', 'carlos.m@email.com', '555-0105', 'Eggs', 'Bilingual - English/Spanish'),
('Ethan', 'Garcia', '2023-06-18', 'infant', 'Rainbow Room', 'Maria Garcia', 'maria.g@email.com', '555-0106', 'None', 'Excellent sleeper'),
('Ava', 'Rodriguez', '2022-08-30', 'toddler', 'Sunshine Room', 'David Rodriguez', 'david.r@email.com', '555-0107', 'Gluten', 'Loves music and dancing'),
('Mason', 'Wilson', '2021-02-14', 'preschool', 'Star Room', 'Lisa Wilson', 'lisa.w@email.com', '555-0108', 'None', 'Natural leader in group activities'),
('Isabella', 'Anderson', '2023-09-01', 'infant', 'Rainbow Room', 'Tom Anderson', 'tom.a@email.com', '555-0109', 'Soy', 'Requires soy-free diet'),
('James', 'Thomas', '2022-05-12', 'toddler', 'Sunshine Room', 'Karen Thomas', 'karen.t@email.com', '555-0110', 'None', 'Very active, needs outdoor time'),
('Charlotte', 'Jackson', '2021-10-08', 'preschool', 'Moon Room', 'Robert Jackson', 'robert.j@email.com', '555-0111', 'Shellfish', 'Enjoys art projects'),
('Benjamin', 'White', '2023-04-25', 'infant', 'Rainbow Room', 'Emily White', 'emily.w@email.com', '555-0112', 'None', 'Teething currently'),
('Mia', 'Harris', '2022-01-17', 'toddler', 'Moon Room', 'Daniel Harris', 'daniel.h@email.com', '555-0113', 'Tree nuts', 'Separation anxiety improving'),
('Lucas', 'Clark', '2020-12-03', 'school_age', 'Galaxy Room', 'Susan Clark', 'susan.c@email.com', '555-0114', 'None', 'After-school program'),
('Harper', 'Lewis', '2021-06-20', 'preschool', 'Moon Room', 'Chris Lewis', 'chris.l@email.com', '555-0115', 'None', 'Preparing for kindergarten');

-- ============================================================
-- SEED DATA: Milestones (15 items)
-- ============================================================
INSERT INTO milestones (child_name, milestone_type, description, status, age_months, notes) VALUES
('Emma Johnson', 'physical', 'Walking independently', 'completed', 18, 'Started walking at 14 months, now very confident'),
('Emma Johnson', 'language', 'Using two-word phrases', 'in_progress', 20, 'Combining words like "more milk" and "daddy go"'),
('Liam Williams', 'physical', 'Rolling over both ways', 'completed', 8, 'Achieved ahead of schedule'),
('Sophia Brown', 'cognitive', 'Counting to 20', 'completed', 36, 'Can count objects accurately up to 20'),
('Sophia Brown', 'social', 'Sharing toys with peers', 'in_progress', 38, 'Improving but still needs reminders'),
('Noah Davis', 'language', 'First words', 'completed', 14, 'Says mama, dada, ball, and dog'),
('Noah Davis', 'physical', 'Climbing stairs with help', 'in_progress', 16, 'Can do 3-4 steps with hand holding'),
('Olivia Martinez', 'language', 'Speaking in full sentences', 'completed', 40, 'Bilingual development on track'),
('Ethan Garcia', 'physical', 'Sitting without support', 'in_progress', 6, 'Can sit for about 30 seconds independently'),
('Ava Rodriguez', 'emotional', 'Self-soothing behaviors', 'in_progress', 18, 'Learning to use comfort objects'),
('Mason Wilson', 'cognitive', 'Letter recognition', 'completed', 42, 'Recognizes all uppercase letters'),
('Isabella Anderson', 'physical', 'Head control', 'completed', 4, 'Strong neck muscles, holds head steady'),
('James Thomas', 'social', 'Parallel play', 'completed', 22, 'Plays alongside other children comfortably'),
('Charlotte Jackson', 'cognitive', 'Color identification', 'in_progress', 30, 'Can identify 6 out of 8 basic colors'),
('Mia Harris', 'emotional', 'Managing transitions', 'delayed', 20, 'Struggles with activity changes, needs extra support');

-- ============================================================
-- SEED DATA: Licensing Compliance (15 items)
-- ============================================================
INSERT INTO licensing_compliance (requirement, category, status, due_date, responsible_person, notes) VALUES
('Annual fire safety inspection', 'health_safety', 'compliant', '2026-06-15', 'John Mitchell', 'Last inspection passed with no violations'),
('Staff CPR/First Aid certification renewal', 'training', 'pending', '2026-04-01', 'Sarah Chen', '3 staff members due for renewal'),
('Background check updates for all staff', 'staffing', 'compliant', '2026-12-31', 'HR Department', 'All background checks current'),
('Emergency evacuation drill - quarterly', 'health_safety', 'pending', '2026-04-15', 'John Mitchell', 'Next drill scheduled for April'),
('Kitchen health inspection', 'facility', 'compliant', '2026-08-20', 'Maria Lopez', 'Scored 98/100 on last inspection'),
('Child-to-staff ratio documentation', 'staffing', 'compliant', '2026-03-31', 'Admin Team', 'Monthly reporting up to date'),
('Playground equipment safety check', 'health_safety', 'pending', '2026-03-25', 'Mike Torres', 'Annual inspection due this month'),
('Medication administration log audit', 'documentation', 'in_review', '2026-04-10', 'Nurse Williams', 'Reviewing last quarter records'),
('Staff professional development hours', 'training', 'pending', '2026-06-30', 'Sarah Chen', '5 staff need 10+ more hours'),
('Building accessibility compliance', 'facility', 'compliant', '2026-09-01', 'Facilities Mgr', 'ADA compliant, ramp installed last year'),
('Water quality testing', 'health_safety', 'compliant', '2026-07-15', 'John Mitchell', 'Tested quarterly, all results normal'),
('Parent handbook annual update', 'documentation', 'pending', '2026-05-01', 'Director Kim', 'Updating policies for new school year'),
('Insurance policy renewal', 'documentation', 'compliant', '2026-11-30', 'Admin Team', 'Liability and property insurance current'),
('Outdoor play area fencing inspection', 'facility', 'non_compliant', '2026-03-20', 'Mike Torres', 'Section of fence needs repair - ordered parts'),
('Food allergy action plans review', 'health_safety', 'in_review', '2026-04-05', 'Nurse Williams', 'Updating plans for 3 new children with allergies');

-- ============================================================
-- SEED DATA: Parent Communications (15 items)
-- ============================================================
INSERT INTO parent_communications (parent_name, child_name, subject, message, type, status, priority, created_at) VALUES
('Sarah Johnson', 'Emma Johnson', 'Weekly Progress Update', 'Emma had a wonderful week! She''s been very engaged in art activities and is making great progress with her language development.', 'general', 'sent', 'normal', NOW() - INTERVAL '1 day'),
('Mike Williams', 'Liam Williams', 'Feeding Schedule Change', 'We''d like to adjust Liam''s feeding schedule. Can we move his afternoon bottle to 2:30 PM instead of 3:00 PM?', 'schedule', 'sent', 'normal', NOW() - INTERVAL '2 days'),
('Jennifer Brown', 'Sophia Brown', 'Peanut Allergy Reminder', 'Just a reminder about Sophia''s severe peanut allergy. Please ensure no peanut products are near her during meal times.', 'health', 'sent', 'high', NOW() - INTERVAL '3 days'),
('Amanda Davis', 'Noah Davis', 'Pickup Authorization Change', 'Noah''s grandmother, Martha Davis, will be picking him up on Thursdays starting next week. I''ll send her ID photo.', 'general', 'sent', 'normal', NOW() - INTERVAL '4 days'),
('Carlos Martinez', 'Olivia Martinez', 'Bilingual Support', 'Thank you for supporting Olivia''s Spanish language development. We practice at home too. Any resources you recommend?', 'general', 'sent', 'low', NOW() - INTERVAL '5 days'),
('Maria Garcia', 'Ethan Garcia', 'Vaccination Records', 'Attached are Ethan''s updated vaccination records from his 6-month appointment. Please add to his file.', 'health', 'sent', 'normal', NOW() - INTERVAL '1 day'),
('David Rodriguez', 'Ava Rodriguez', 'Gluten-Free Diet', 'Ava was recently diagnosed with celiac disease. We need to ensure all meals and snacks are completely gluten-free.', 'health', 'sent', 'urgent', NOW() - INTERVAL '1 day'),
('Lisa Wilson', 'Mason Wilson', 'Kindergarten Readiness', 'Can we schedule a meeting to discuss Mason''s kindergarten readiness assessment? We''re looking at schools for fall.', 'schedule', 'draft', 'normal', NOW() - INTERVAL '6 days'),
('Tom Anderson', 'Isabella Anderson', 'Sleep Routine', 'Isabella has been having trouble napping at home. What''s her nap schedule like at daycare? Any tips?', 'general', 'sent', 'normal', NOW() - INTERVAL '2 days'),
('Karen Thomas', 'James Thomas', 'Birthday Party', 'James''s 3rd birthday is next Friday. Can we bring in cupcakes for the class? We''ll make sure they''re allergy-friendly.', 'general', 'sent', 'low', NOW() - INTERVAL '7 days'),
('Robert Jackson', 'Charlotte Jackson', 'Art Project Materials', 'Charlotte absolutely loved the finger painting activity! Could you share what non-toxic paints you use?', 'general', 'sent', 'low', NOW() - INTERVAL '3 days'),
('Emily White', 'Benjamin White', 'Teething Update', 'Benjamin is teething pretty badly. We''re using teething rings at home. Please let us know if he seems too uncomfortable.', 'health', 'sent', 'normal', NOW() - INTERVAL '1 day'),
('Daniel Harris', 'Mia Harris', 'Separation Anxiety Support', 'Mia still cries at drop-off. Any suggestions for making transitions easier? We''ve tried a special goodbye routine.', 'general', 'sent', 'high', NOW() - INTERVAL '4 days'),
('Susan Clark', 'Lucas Clark', 'After School Homework Help', 'Does Lucas have time for homework during the after-school program? He''s been falling behind on reading assignments.', 'general', 'sent', 'normal', NOW() - INTERVAL '5 days'),
('Chris Lewis', 'Harper Lewis', 'Spring Photos', 'Will there be spring photos this year? If so, when? I want to make sure Harper has her outfit ready!', 'general', 'draft', 'low', NOW() - INTERVAL '8 days');

-- ============================================================
-- SEED DATA: Staff Ratios (15 items)
-- ============================================================
INSERT INTO staff_ratios (classroom, age_group, staff_count, child_count, required_ratio, actual_ratio, status) VALUES
('Rainbow Room', 'infant', 3, 9, '1:3', '1:3', 'compliant'),
('Sunshine Room A', 'toddler', 2, 8, '1:4', '1:4', 'compliant'),
('Sunshine Room B', 'toddler', 2, 10, '1:4', '1:5', 'non_compliant'),
('Star Room', 'preschool', 2, 16, '1:10', '1:8', 'compliant'),
('Moon Room', 'preschool', 2, 18, '1:10', '1:9', 'compliant'),
('Galaxy Room', 'school_age', 1, 12, '1:15', '1:12', 'compliant'),
('Rainbow Room PM', 'infant', 2, 6, '1:3', '1:3', 'compliant'),
('Sunshine Room PM', 'toddler', 2, 7, '1:4', '1:3.5', 'compliant'),
('Star Room PM', 'preschool', 1, 8, '1:10', '1:8', 'compliant'),
('Moon Room PM', 'preschool', 1, 11, '1:10', '1:11', 'warning'),
('Galaxy Room PM', 'school_age', 1, 15, '1:15', '1:15', 'compliant'),
('Outdoor Play AM', 'toddler', 3, 12, '1:4', '1:4', 'compliant'),
('Outdoor Play PM', 'preschool', 2, 20, '1:10', '1:10', 'compliant'),
('Nap Room', 'infant', 2, 8, '1:3', '1:4', 'non_compliant'),
('Art Studio', 'preschool', 1, 10, '1:10', '1:10', 'compliant');

-- ============================================================
-- SEED DATA: Billing (15 items)
-- ============================================================
INSERT INTO billing (parent_name, child_name, amount, description, status, due_date, invoice_number, payment_method) VALUES
('Sarah Johnson', 'Emma Johnson', 1200.00, 'Monthly tuition - March 2026', 'paid', '2026-03-01', 'INV-2026-001', 'credit_card'),
('Mike Williams', 'Liam Williams', 1500.00, 'Monthly tuition - March 2026 (Infant)', 'paid', '2026-03-01', 'INV-2026-002', 'bank_transfer'),
('Jennifer Brown', 'Sophia Brown', 1100.00, 'Monthly tuition - March 2026', 'pending', '2026-03-15', 'INV-2026-003', NULL),
('Amanda Davis', 'Noah Davis', 1200.00, 'Monthly tuition - March 2026', 'paid', '2026-03-01', 'INV-2026-004', 'credit_card'),
('Carlos Martinez', 'Olivia Martinez', 1100.00, 'Monthly tuition - March 2026', 'overdue', '2026-03-01', 'INV-2026-005', NULL),
('Maria Garcia', 'Ethan Garcia', 1500.00, 'Monthly tuition - March 2026 (Infant)', 'paid', '2026-03-01', 'INV-2026-006', 'credit_card'),
('David Rodriguez', 'Ava Rodriguez', 1200.00, 'Monthly tuition - March 2026', 'pending', '2026-03-15', 'INV-2026-007', NULL),
('Lisa Wilson', 'Mason Wilson', 1100.00, 'Monthly tuition - March 2026', 'paid', '2026-03-01', 'INV-2026-008', 'bank_transfer'),
('Tom Anderson', 'Isabella Anderson', 1500.00, 'Monthly tuition - March 2026 (Infant)', 'pending', '2026-03-15', 'INV-2026-009', NULL),
('Karen Thomas', 'James Thomas', 1200.00, 'Monthly tuition - March 2026', 'paid', '2026-03-01', 'INV-2026-010', 'check'),
('Robert Jackson', 'Charlotte Jackson', 1100.00, 'Monthly tuition - March 2026', 'paid', '2026-03-01', 'INV-2026-011', 'credit_card'),
('Emily White', 'Benjamin White', 1500.00, 'Monthly tuition - March 2026 (Infant)', 'overdue', '2026-03-01', 'INV-2026-012', NULL),
('Daniel Harris', 'Mia Harris', 1200.00, 'Monthly tuition - March 2026', 'paid', '2026-03-01', 'INV-2026-013', 'credit_card'),
('Susan Clark', 'Lucas Clark', 800.00, 'After-school program - March 2026', 'paid', '2026-03-01', 'INV-2026-014', 'bank_transfer'),
('Chris Lewis', 'Harper Lewis', 1100.00, 'Monthly tuition - March 2026', 'pending', '2026-03-15', 'INV-2026-015', NULL);

-- ============================================================
-- SEED DATA: Attendance (15 items)
-- ============================================================
INSERT INTO attendance (child_name, date, check_in, check_out, status, notes) VALUES
('Emma Johnson', '2026-03-19', '07:45', '17:30', 'present', 'Good day, ate well at lunch'),
('Liam Williams', '2026-03-19', '08:00', '16:45', 'present', 'Napped well, 2 feedings'),
('Sophia Brown', '2026-03-19', '07:30', '17:00', 'present', 'Led circle time activity'),
('Noah Davis', '2026-03-19', '08:15', NULL, 'present', 'Drop-off went smoothly today'),
('Olivia Martinez', '2026-03-19', '07:50', NULL, 'present', 'Practicing Spanish songs'),
('Ethan Garcia', '2026-03-19', NULL, NULL, 'absent', 'Parent called - mild cold'),
('Ava Rodriguez', '2026-03-19', '08:30', NULL, 'late', 'Arrived late due to doctor appointment'),
('Mason Wilson', '2026-03-19', '07:30', '17:15', 'present', 'Excellent participation in group activities'),
('Isabella Anderson', '2026-03-18', '08:00', '16:30', 'present', 'Two good naps today'),
('James Thomas', '2026-03-18', '07:45', '17:00', 'present', 'Loved outdoor play time'),
('Charlotte Jackson', '2026-03-18', '08:10', '16:45', 'present', 'Completed art project'),
('Benjamin White', '2026-03-18', NULL, NULL, 'excused', 'Family vacation - returns Monday'),
('Mia Harris', '2026-03-18', '08:45', '17:30', 'late', 'Late drop-off, parent stuck in traffic'),
('Lucas Clark', '2026-03-18', '15:00', '18:00', 'present', 'After-school pickup from bus'),
('Harper Lewis', '2026-03-18', '07:55', '16:30', 'present', 'Made a new friend today');

-- ============================================================
-- SEED DATA: Incidents (15 items)
-- ============================================================
INSERT INTO incidents (child_name, incident_type, description, severity, date, time, location, action_taken, reported_by, parent_notified) VALUES
('Noah Davis', 'injury', 'Minor scrape on knee from tripping on playground', 'minor', '2026-03-17', '10:30', 'Outdoor Playground', 'Cleaned wound, applied bandage, comforted child', 'Teacher Amy', true),
('Emma Johnson', 'behavioral', 'Pushed another child during free play time', 'low', '2026-03-16', '14:15', 'Sunshine Room', 'Redirected behavior, discussed gentle hands, separated for cool down', 'Teacher Lisa', true),
('Sophia Brown', 'allergy', 'Mild allergic reaction - hives on arms after craft activity', 'medium', '2026-03-15', '11:00', 'Star Room', 'Administered antihistamine per allergy plan, monitored for 2 hours, symptoms resolved', 'Nurse Williams', true),
('Liam Williams', 'illness', 'Fever detected during afternoon check - 101.2F', 'medium', '2026-03-14', '13:45', 'Rainbow Room', 'Isolated child, called parents for immediate pickup, monitored temperature', 'Teacher Sarah', true),
('James Thomas', 'injury', 'Bumped head on table corner while playing', 'low', '2026-03-13', '09:20', 'Sunshine Room', 'Applied ice pack, monitored for concussion signs for 30 min, child resumed play', 'Teacher Amy', true),
('Ava Rodriguez', 'safety', 'Found loose screw on chair in classroom', 'low', '2026-03-12', '08:00', 'Sunshine Room', 'Removed chair from use, reported to maintenance, replaced with safe chair', 'Teacher Lisa', false),
('Charlotte Jackson', 'injury', 'Paper cut on finger during art activity', 'minor', '2026-03-11', '10:15', 'Moon Room', 'Cleaned and applied small bandage, child continued activity happily', 'Teacher Mark', false),
('Mason Wilson', 'behavioral', 'Refused to share building blocks, became upset', 'low', '2026-03-10', '15:00', 'Star Room', 'Facilitated sharing discussion, practiced turn-taking, situation resolved', 'Teacher Jenny', false),
('Mia Harris', 'behavioral', 'Extended crying episode at morning drop-off (45 min)', 'medium', '2026-03-10', '08:00', 'Moon Room', 'Comfort techniques applied, distraction with favorite toy, eventually calmed', 'Teacher Mark', true),
('Ethan Garcia', 'illness', 'Vomiting episode after morning snack', 'medium', '2026-03-09', '10:00', 'Rainbow Room', 'Cleaned up, isolated child, contacted parents, monitored hydration', 'Teacher Sarah', true),
('Benjamin White', 'injury', 'Bit by another child on forearm during play', 'medium', '2026-03-08', '11:30', 'Rainbow Room', 'Cleaned bite area, applied ice, documented, counseled biting child', 'Teacher Sarah', true),
('Harper Lewis', 'safety', 'Door stopper came loose - potential choking hazard', 'high', '2026-03-07', '07:30', 'Moon Room', 'Immediately removed hazard, reported to maintenance, area secured', 'Teacher Mark', false),
('Isabella Anderson', 'illness', 'Diaper rash noticed during changing', 'low', '2026-03-06', '14:00', 'Rainbow Room', 'Applied barrier cream, increased changing frequency, informed parents', 'Teacher Sarah', true),
('Olivia Martinez', 'injury', 'Splinter in finger from wooden playground equipment', 'minor', '2026-03-05', '10:45', 'Outdoor Playground', 'Removed splinter carefully, cleaned area, applied antibiotic ointment', 'Nurse Williams', true),
('Lucas Clark', 'behavioral', 'Conflict with peer over computer time after school', 'low', '2026-03-04', '16:00', 'Galaxy Room', 'Mediated discussion, established timer system for fair computer sharing', 'Teacher Dave', false);

-- ============================================================
-- SEED DATA: Meal Plans (15 items)
-- ============================================================
INSERT INTO meal_plans (meal_name, meal_type, date, age_group, description, calories, allergens, servings, notes) VALUES
('Oatmeal with Berries', 'breakfast', '2026-03-19', 'all', 'Steel-cut oatmeal topped with fresh blueberries and sliced strawberries, served with milk', 280, 'dairy', 30, 'Use dairy-free milk for Liam and Isabella'),
('Turkey & Cheese Wraps', 'lunch', '2026-03-19', 'preschool', 'Whole wheat tortilla with sliced turkey, cheddar cheese, lettuce, and light mayo', 350, 'dairy, gluten', 20, 'Gluten-free wrap for Ava Rodriguez'),
('Apple Slices with Sunbutter', 'snack', '2026-03-19', 'all', 'Fresh apple slices with sunflower seed butter for dipping', 180, 'None', 30, 'Nut-free alternative to peanut butter'),
('Pureed Sweet Potato & Peas', 'lunch', '2026-03-19', 'infant', 'Smooth pureed sweet potato and green peas with breast milk/formula', 120, 'None', 8, 'Stage 2 baby food consistency'),
('Chicken Nuggets & Veggies', 'lunch', '2026-03-20', 'toddler', 'Baked chicken nuggets with steamed broccoli and carrot sticks', 300, 'gluten', 15, 'Homemade nuggets - healthier than frozen'),
('Banana Yogurt Smoothie', 'snack', '2026-03-20', 'all', 'Blended banana, vanilla yogurt, and a splash of orange juice', 200, 'dairy', 30, 'Dairy-free yogurt option available'),
('Scrambled Eggs & Toast', 'breakfast', '2026-03-20', 'preschool', 'Fluffy scrambled eggs with whole wheat toast and fruit cup', 310, 'eggs, gluten', 20, 'Egg-free option: pancakes for Olivia'),
('Rice Cereal with Fruit Puree', 'breakfast', '2026-03-20', 'infant', 'Iron-fortified rice cereal mixed with pureed banana', 100, 'None', 8, 'Introduction to solid foods for younger infants'),
('Pasta Primavera', 'lunch', '2026-03-21', 'all', 'Penne pasta with sauteed zucchini, bell peppers, cherry tomatoes in light marinara', 320, 'gluten', 30, 'Gluten-free pasta option available'),
('Cheese Quesadilla', 'lunch', '2026-03-21', 'toddler', 'Flour tortilla with melted cheese, served with mild salsa and sour cream', 280, 'dairy, gluten', 15, 'Popular with the toddler group'),
('Goldfish Crackers & Fruit', 'snack', '2026-03-21', 'preschool', 'Whole grain goldfish crackers with fresh grapes (halved) and clementine segments', 160, 'gluten', 20, 'Grapes must be halved for safety'),
('Veggie Soup', 'lunch', '2026-03-22', 'all', 'Hearty vegetable soup with potatoes, carrots, celery, and chicken broth', 250, 'None', 30, 'Served with bread rolls on the side'),
('Fruit Popsicles', 'snack', '2026-03-22', 'all', 'Homemade popsicles made from blended watermelon, strawberry, and a touch of honey', 80, 'None', 30, 'No added sugar, made in-house'),
('Grilled Cheese Sandwich', 'lunch', '2026-03-23', 'preschool', 'Classic grilled cheese on whole wheat with tomato soup', 380, 'dairy, gluten', 20, 'Comfort food Friday tradition'),
('Mashed Avocado & Banana', 'lunch', '2026-03-23', 'infant', 'Ripe avocado mashed with banana, smooth consistency', 150, 'None', 8, 'Healthy fats for brain development');

-- ============================================================
-- SEED DATA: AI Assessments (15 items)
-- ============================================================
INSERT INTO ai_assessments (child_name, assessment_type, date, evaluator, score, age_group, areas_evaluated, strengths, areas_for_improvement, recommendations, status) VALUES
('Emma Johnson', 'developmental', '2026-03-10', 'Dr. Sarah Miller', '85/100', 'toddler', 'Motor skills, language, social-emotional, cognitive', 'Strong social skills, excellent gross motor development, enthusiastic learner', 'Fine motor skills need more practice, vocabulary building', 'Introduce more fine motor activities like bead threading and drawing. Read aloud daily.', 'completed'),
('Sophia Brown', 'cognitive', '2026-03-08', 'Teacher Jenny', '92/100', 'preschool', 'Pre-reading, math concepts, problem-solving, memory', 'Advanced reading readiness, strong number sense, excellent memory', 'Needs more challenging activities to stay engaged', 'Consider enrichment activities, introduce simple chapter books, math games with higher numbers', 'completed'),
('Liam Williams', 'developmental', '2026-03-12', 'Dr. Sarah Miller', '78/100', 'infant', 'Motor milestones, feeding, sleep patterns, sensory', 'Good weight gain, strong neck control, responds well to stimuli', 'Tummy time duration could increase, needs more sensory exploration', 'Increase tummy time to 15 min sessions, introduce textured toys and music', 'completed'),
('Noah Davis', 'behavioral', '2026-03-05', 'Teacher Amy', '80/100', 'toddler', 'Self-regulation, peer interaction, following routines', 'Follows classroom routines well, shows empathy toward peers', 'Transitioning between activities, managing frustration', 'Use visual schedule cards, give 5-minute warnings before transitions, teach breathing exercises', 'completed'),
('Olivia Martinez', 'language', '2026-03-15', 'Speech Therapist Dr. Kim', '88/100', 'preschool', 'Receptive language, expressive language, bilingual development', 'Strong bilingual vocabulary, excellent comprehension in both languages', 'Code-switching consistency, some grammatical errors in English', 'Continue bilingual support, focus on English grammar through stories and songs', 'completed'),
('Mason Wilson', 'social_emotional', '2026-03-01', 'Teacher Jenny', '90/100', 'preschool', 'Leadership, cooperation, emotional awareness, conflict resolution', 'Natural leader, empathetic, good at including others in play', 'Sometimes overly directive with peers, needs to listen to others ideas', 'Practice turn-taking in leadership roles, model active listening, role-play scenarios', 'completed'),
('Ava Rodriguez', 'developmental', '2026-03-14', 'Dr. Sarah Miller', '82/100', 'toddler', 'Motor skills, language, social skills, self-help', 'Creative, loves music and movement, good appetite despite dietary restrictions', 'Speech development slightly behind, needs more peer interaction', 'Speech-language screening recommended, increase small group activities, music therapy', 'completed'),
('Charlotte Jackson', 'cognitive', '2026-03-11', 'Teacher Mark', '86/100', 'preschool', 'Art skills, color recognition, spatial awareness, creativity', 'Exceptional artistic ability, strong spatial awareness, creative thinker', 'Needs more structured academic activities alongside creative pursuits', 'Balance art time with academic activities, use art to teach math and literacy concepts', 'completed'),
('James Thomas', 'physical', '2026-03-13', 'PE Specialist', '88/100', 'toddler', 'Gross motor, fine motor, coordination, balance', 'Very active, excellent gross motor skills, loves outdoor play', 'Fine motor precision, sitting still for activities', 'Add fine motor stations, short focused table activities building to longer duration', 'completed'),
('Mia Harris', 'social_emotional', '2026-03-07', 'Teacher Mark', '72/100', 'toddler', 'Attachment, separation anxiety, peer relationships, emotional regulation', 'Sweet temperament, bonds well with caregivers once comfortable', 'Significant separation anxiety, difficulty with new situations', 'Gradual exposure therapy, comfort object protocol, consistent goodbye routine', 'completed'),
('Isabella Anderson', 'developmental', '2026-03-16', 'Dr. Sarah Miller', '75/100', 'infant', 'Motor milestones, visual tracking, social smiling, feeding', 'Good social engagement, tracks objects well, healthy weight', 'Rolling over needs more practice, limited variety in vocalizations', 'More floor time, encourage reaching for toys, sing and talk to promote vocalizations', 'pending'),
('Benjamin White', 'physical', '2026-03-09', 'Dr. Sarah Miller', '80/100', 'infant', 'Growth metrics, motor development, feeding, teething', 'On track for height/weight, good grasp reflex, sleeping well', 'Teething causing fussiness, slightly behind on sitting milestone', 'Provide appropriate teething toys, supported sitting practice, cold washcloths for gums', 'completed'),
('Harper Lewis', 'cognitive', '2026-03-04', 'Teacher Mark', '87/100', 'preschool', 'Kindergarten readiness, literacy, numeracy, social skills', 'Strong kindergarten readiness, recognizes most letters, counts to 30', 'Writing skills need development, following multi-step directions', 'Tracing worksheets, writing name practice, give 2-step then 3-step instructions', 'completed'),
('Lucas Clark', 'behavioral', '2026-03-06', 'Teacher Dave', '76/100', 'school_age', 'Academic engagement, peer relationships, self-management', 'Good reading skills, friendly with peers, independent', 'Homework completion, screen time management, focus during structured activities', 'Homework station with timer, limit screen time to 30 min, movement breaks every 20 min', 'in_progress'),
('Ethan Garcia', 'developmental', '2026-03-17', 'Dr. Sarah Miller', '81/100', 'infant', 'Motor development, feeding progression, sleep patterns, sensory', 'Excellent sleep routine, good appetite, happy disposition', 'Needs more tummy time, limited reaching for objects', 'Structured tummy time 3x daily, dangling toys to encourage reaching, introduce textures', 'scheduled');

-- ============================================================
-- SEED DATA: Staff Schedules (15 items)
-- ============================================================
INSERT INTO staff_schedules (staff_name, role, date, shift_start, shift_end, classroom, status, notes) VALUES
('Amy Thompson', 'lead_teacher', '2026-03-19', '07:00', '15:00', 'Sunshine Room', 'confirmed', 'Opening shift - toddler room lead'),
('Lisa Chen', 'lead_teacher', '2026-03-19', '07:00', '15:00', 'Star Room', 'confirmed', 'Preschool room lead'),
('Sarah Williams', 'lead_teacher', '2026-03-19', '07:00', '15:00', 'Rainbow Room', 'confirmed', 'Infant room lead - CPR certified'),
('Mark Davis', 'lead_teacher', '2026-03-19', '08:00', '16:00', 'Moon Room', 'confirmed', 'Preschool room 2 lead'),
('Jenny Park', 'assistant_teacher', '2026-03-19', '07:30', '15:30', 'Sunshine Room', 'confirmed', 'Toddler room assistant'),
('Dave Johnson', 'lead_teacher', '2026-03-19', '14:00', '18:00', 'Galaxy Room', 'confirmed', 'After-school program lead'),
('Maria Lopez', 'cook', '2026-03-19', '06:30', '14:30', 'Kitchen', 'confirmed', 'Breakfast and lunch preparation'),
('Kim Nguyen', 'director', '2026-03-19', '08:00', '17:00', 'Office', 'confirmed', 'Administrative duties, parent meetings'),
('Rachel Green', 'assistant_teacher', '2026-03-19', '09:00', '17:00', 'Rainbow Room', 'confirmed', 'Infant room support'),
('Mike Torres', 'maintenance', '2026-03-19', '07:00', '15:00', 'Facility', 'confirmed', 'Weekly playground inspection scheduled'),
('Amy Thompson', 'lead_teacher', '2026-03-20', '07:00', '15:00', 'Sunshine Room', 'scheduled', 'Regular shift'),
('Lisa Chen', 'lead_teacher', '2026-03-20', '07:00', '15:00', 'Star Room', 'scheduled', 'Planning parent conferences'),
('Sarah Williams', 'lead_teacher', '2026-03-20', '07:00', '15:00', 'Rainbow Room', 'scheduled', 'Regular shift'),
('Tom Baker', 'assistant_teacher', '2026-03-20', '10:00', '18:00', 'Sunshine Room', 'scheduled', 'Closing shift coverage'),
('Nurse Williams', 'aide', '2026-03-19', '08:00', '16:00', 'Health Office', 'confirmed', 'Medication administration, health checks');

-- ============================================================
-- Enrollments table
-- ============================================================
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  child_name VARCHAR(255) NOT NULL,
  parent_name VARCHAR(255),
  parent_email VARCHAR(255),
  parent_phone VARCHAR(20),
  date_of_birth DATE,
  age_group VARCHAR(50),
  enrollment_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  classroom VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Emergency Contacts table
-- ============================================================
CREATE TABLE emergency_contacts (
  id SERIAL PRIMARY KEY,
  child_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  relationship VARCHAR(50),
  phone VARCHAR(20),
  alt_phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  authorized_pickup BOOLEAN DEFAULT true,
  priority_order INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Classrooms table
-- ============================================================
CREATE TABLE classrooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age_group VARCHAR(50),
  capacity INTEGER DEFAULT 0,
  current_count INTEGER DEFAULT 0,
  lead_teacher VARCHAR(255),
  assistant_teacher VARCHAR(255),
  room_number VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active',
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Activities table
-- ============================================================
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  activity_name VARCHAR(255) NOT NULL,
  activity_type VARCHAR(50),
  date DATE,
  time TIME,
  duration INTEGER,
  age_group VARCHAR(50),
  classroom VARCHAR(100),
  description TEXT,
  materials_needed TEXT,
  learning_objectives TEXT,
  led_by VARCHAR(255),
  status VARCHAR(50) DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Immunizations table
-- ============================================================
CREATE TABLE immunizations (
  id SERIAL PRIMARY KEY,
  child_name VARCHAR(255) NOT NULL,
  vaccine_name VARCHAR(100),
  dose_number INTEGER,
  date_administered DATE,
  administered_by VARCHAR(255),
  next_due_date DATE,
  status VARCHAR(50) DEFAULT 'up_to_date',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SEED DATA: Enrollments (15 items)
-- ============================================================
INSERT INTO enrollments (child_name, parent_name, parent_email, parent_phone, date_of_birth, age_group, enrollment_date, status, classroom, notes) VALUES
('Emma Johnson', 'Sarah Johnson', 'sarah.j@email.com', '555-0101', '2022-03-15', 'toddler', '2023-09-01', 'active', 'Sunshine Room', 'Full-time enrollment, Mon-Fri'),
('Liam Williams', 'Mike Williams', 'mike.w@email.com', '555-0102', '2023-01-20', 'infant', '2023-07-15', 'active', 'Rainbow Room', 'Full-time, dairy-free diet required'),
('Sophia Brown', 'Jennifer Brown', 'jen.b@email.com', '555-0103', '2021-07-10', 'preschool', '2022-09-01', 'active', 'Star Room', 'Preparing for kindergarten next year'),
('Noah Davis', 'Amanda Davis', 'amanda.d@email.com', '555-0104', '2022-11-05', 'toddler', '2023-06-01', 'active', 'Sunshine Room', 'Full-time enrollment'),
('Olivia Martinez', 'Carlos Martinez', 'carlos.m@email.com', '555-0105', '2021-04-22', 'preschool', '2022-08-15', 'active', 'Star Room', 'Bilingual program participant'),
('Ethan Garcia', 'Maria Garcia', 'maria.g@email.com', '555-0106', '2023-06-18', 'infant', '2024-01-10', 'active', 'Rainbow Room', 'Part-time Mon/Wed/Fri'),
('Ava Rodriguez', 'David Rodriguez', 'david.r@email.com', '555-0107', '2022-08-30', 'toddler', '2023-09-01', 'active', 'Sunshine Room', 'Gluten-free diet required'),
('Mason Wilson', 'Lisa Wilson', 'lisa.w@email.com', '555-0108', '2021-02-14', 'preschool', '2022-03-01', 'active', 'Star Room', 'Graduating to kindergarten in fall'),
('Isabella Anderson', 'Tom Anderson', 'tom.a@email.com', '555-0109', '2023-09-01', 'infant', '2024-03-01', 'active', 'Rainbow Room', 'New enrollment, adjusting well'),
('James Thomas', 'Karen Thomas', 'karen.t@email.com', '555-0110', '2022-05-12', 'toddler', '2023-01-15', 'active', 'Sunshine Room', 'Very active child, loves outdoors'),
('Charlotte Jackson', 'Robert Jackson', 'robert.j@email.com', '555-0111', '2021-10-08', 'preschool', '2023-01-10', 'active', 'Moon Room', 'Artistic talent, loves crafts'),
('Benjamin White', 'Emily White', 'emily.w@email.com', '555-0112', '2023-04-25', 'infant', '2023-11-01', 'active', 'Rainbow Room', 'Currently teething'),
('Mia Harris', 'Daniel Harris', 'daniel.h@email.com', '555-0113', '2022-01-17', 'toddler', '2023-03-01', 'active', 'Moon Room', 'Separation anxiety support plan in place'),
('Lucas Clark', 'Susan Clark', 'susan.c@email.com', '555-0114', '2020-12-03', 'school_age', '2024-09-01', 'active', 'Galaxy Room', 'After-school program only'),
('Harper Lewis', 'Chris Lewis', 'chris.l@email.com', '555-0115', '2021-06-20', 'preschool', '2023-01-05', 'waitlisted', 'Moon Room', 'Waitlisted for Star Room transfer');

-- ============================================================
-- SEED DATA: Emergency Contacts (15 items)
-- ============================================================
INSERT INTO emergency_contacts (child_name, contact_name, relationship, phone, alt_phone, email, address, authorized_pickup, priority_order, notes) VALUES
('Emma Johnson', 'Sarah Johnson', 'mother', '555-0101', '555-0201', 'sarah.j@email.com', '123 Oak Street, Springfield', true, 1, 'Primary contact'),
('Emma Johnson', 'Mark Johnson', 'father', '555-0151', '555-0251', 'mark.j@email.com', '123 Oak Street, Springfield', true, 2, 'Works until 5 PM'),
('Liam Williams', 'Mike Williams', 'father', '555-0102', '555-0202', 'mike.w@email.com', '456 Maple Ave, Springfield', true, 1, 'Primary contact, knows about dairy allergy'),
('Liam Williams', 'Grace Williams', 'grandparent', '555-0152', NULL, 'grace.w@email.com', '789 Pine Rd, Springfield', true, 2, 'Available weekday afternoons'),
('Sophia Brown', 'Jennifer Brown', 'mother', '555-0103', '555-0203', 'jen.b@email.com', '321 Elm Blvd, Springfield', true, 1, 'Carries EpiPen for Sophia'),
('Noah Davis', 'Amanda Davis', 'mother', '555-0104', '555-0204', 'amanda.d@email.com', '654 Cedar Lane, Springfield', true, 1, 'Primary contact'),
('Noah Davis', 'Martha Davis', 'grandparent', '555-0154', NULL, NULL, '987 Birch Way, Springfield', true, 2, 'Thursday pickup authorized'),
('Olivia Martinez', 'Carlos Martinez', 'father', '555-0105', '555-0205', 'carlos.m@email.com', '147 Walnut St, Springfield', true, 1, 'Spanish speaking preferred'),
('Olivia Martinez', 'Rosa Martinez', 'mother', '555-0155', '555-0255', 'rosa.m@email.com', '147 Walnut St, Springfield', true, 2, 'Bilingual English/Spanish'),
('Ethan Garcia', 'Maria Garcia', 'mother', '555-0106', '555-0206', 'maria.g@email.com', '258 Spruce Dr, Springfield', true, 1, 'Primary contact'),
('Ava Rodriguez', 'David Rodriguez', 'father', '555-0107', '555-0207', 'david.r@email.com', '369 Ash Court, Springfield', true, 1, 'Knows about celiac disease diet'),
('Mason Wilson', 'Lisa Wilson', 'mother', '555-0108', '555-0208', 'lisa.w@email.com', '741 Poplar Pl, Springfield', true, 1, 'Primary contact'),
('James Thomas', 'Karen Thomas', 'mother', '555-0110', '555-0210', 'karen.t@email.com', '852 Willow Ln, Springfield', true, 1, 'Primary contact'),
('Charlotte Jackson', 'Robert Jackson', 'father', '555-0111', '555-0211', 'robert.j@email.com', '963 Hickory Rd, Springfield', true, 1, 'Works from home, flexible pickup'),
('Mia Harris', 'Daniel Harris', 'father', '555-0113', '555-0213', 'daniel.h@email.com', '174 Chestnut Ave, Springfield', true, 1, 'Aware of separation anxiety plan');

-- ============================================================
-- SEED DATA: Classrooms (15 items)
-- ============================================================
INSERT INTO classrooms (name, age_group, capacity, current_count, lead_teacher, assistant_teacher, room_number, status, description, notes) VALUES
('Rainbow Room', 'infant', 12, 9, 'Sarah Williams', 'Rachel Green', '101', 'active', 'Infant care room with cribs and play area', 'Recently updated with new sensory wall'),
('Sunshine Room A', 'toddler', 10, 8, 'Amy Thompson', 'Jenny Park', '102', 'active', 'Toddler room with art and movement space', 'Morning group'),
('Sunshine Room B', 'toddler', 10, 10, 'Tom Baker', NULL, '103', 'active', 'Toddler room with outdoor access', 'At capacity - needs additional staff'),
('Star Room', 'preschool', 20, 16, 'Lisa Chen', NULL, '201', 'active', 'Preschool classroom with learning centers', 'Pre-K readiness focus'),
('Moon Room', 'preschool', 20, 18, 'Mark Davis', NULL, '202', 'active', 'Preschool classroom with creative arts focus', 'Art and music enrichment'),
('Galaxy Room', 'school_age', 15, 12, 'Dave Johnson', NULL, '301', 'active', 'After-school program room with homework stations', 'Computers and reading nook'),
('Art Studio', 'preschool', 12, 0, NULL, NULL, '203', 'active', 'Shared art and creative space', 'Used by rotation, all age groups'),
('Music Room', 'all', 15, 0, NULL, NULL, '204', 'active', 'Music and movement room with instruments', 'Scheduled sessions throughout the day'),
('Nap Room', 'infant', 10, 8, NULL, NULL, '104', 'active', 'Quiet nap room for infants', 'Dim lighting, white noise machine'),
('Outdoor Play Area', 'all', 30, 0, NULL, NULL, 'EXT-1', 'active', 'Fenced outdoor playground with age-appropriate equipment', 'Fence repair needed on east section'),
('Sensory Room', 'toddler', 8, 0, NULL, NULL, '105', 'active', 'Sensory exploration room with tactile stations', 'Used for therapy sessions too'),
('Kitchen', 'all', 0, 0, 'Maria Lopez', NULL, 'K-1', 'active', 'Full commercial kitchen for meal preparation', 'Last health inspection: 98/100'),
('Conference Room', 'all', 10, 0, NULL, NULL, '401', 'active', 'Parent-teacher conference and staff meeting room', 'A/V equipment available'),
('Health Office', 'all', 4, 0, 'Nurse Williams', NULL, '402', 'active', 'First aid and medication administration', 'Stocked with emergency supplies'),
('Storage Room', 'all', 0, 0, NULL, NULL, 'S-1', 'maintenance', 'Supply and equipment storage', 'Reorganization in progress');

-- ============================================================
-- SEED DATA: Activities (15 items)
-- ============================================================
INSERT INTO activities (activity_name, activity_type, date, time, duration, age_group, classroom, description, materials_needed, learning_objectives, led_by, status) VALUES
('Spring Flower Painting', 'art', '2026-03-19', '09:30', 45, 'preschool', 'Art Studio', 'Children paint spring flowers using various techniques including finger painting and brush work', 'Washable paints, paper, brushes, smocks, flower examples', 'Fine motor skills, color recognition, nature awareness', 'Lisa Chen', 'completed'),
('Musical Instruments Exploration', 'music', '2026-03-19', '10:00', 30, 'toddler', 'Music Room', 'Toddlers explore different musical instruments and learn basic rhythms', 'Tambourines, maracas, drums, xylophones', 'Auditory development, rhythm, cause and effect', 'Amy Thompson', 'completed'),
('Outdoor Nature Walk', 'outdoor', '2026-03-19', '11:00', 40, 'preschool', 'Outdoor Play Area', 'Guided nature walk around the playground identifying plants and insects', 'Magnifying glasses, collection bags, nature bingo cards', 'Science exploration, observation skills, vocabulary building', 'Mark Davis', 'in_progress'),
('Building Block Challenge', 'stem', '2026-03-19', '14:00', 30, 'toddler', 'Sunshine Room A', 'Tower building challenge with various sized blocks', 'Wooden blocks, foam blocks, measuring tape', 'Spatial awareness, problem solving, counting', 'Jenny Park', 'planned'),
('Story Circle - The Very Hungry Caterpillar', 'literacy', '2026-03-19', '09:00', 20, 'preschool', 'Star Room', 'Interactive read-aloud with props and discussion', 'Book, felt board, caterpillar puppet, food props', 'Listening skills, sequencing, nutrition awareness', 'Lisa Chen', 'completed'),
('Sensory Bin - Rice and Scoops', 'sensory', '2026-03-19', '10:30', 25, 'infant', 'Sensory Room', 'Infants explore colored rice with scoops and containers', 'Colored rice, cups, spoons, sensory bin', 'Tactile exploration, fine motor, cause and effect', 'Rachel Green', 'completed'),
('Free Play - Dramatic Corner', 'free_play', '2026-03-19', '15:00', 45, 'preschool', 'Moon Room', 'Children engage in imaginative play in the dramatic play corner', 'Dress-up clothes, play kitchen, puppets', 'Social skills, creativity, language development', 'Mark Davis', 'planned'),
('Circle Time - Days of the Week', 'circle_time', '2026-03-20', '08:30', 15, 'toddler', 'Sunshine Room A', 'Morning circle with calendar, weather, and days of the week song', 'Calendar, weather cards, song lyrics poster', 'Routine, time concepts, group participation', 'Amy Thompson', 'planned'),
('Playdough Creations', 'art', '2026-03-20', '10:00', 35, 'toddler', 'Sunshine Room B', 'Creating animals and shapes with homemade playdough', 'Playdough, cookie cutters, rolling pins, plastic knives', 'Fine motor strength, creativity, shape recognition', 'Tom Baker', 'planned'),
('Water Table Science', 'stem', '2026-03-20', '11:00', 30, 'preschool', 'Star Room', 'Sink or float experiment with various objects', 'Water table, assorted objects, prediction chart', 'Scientific method, prediction, classification', 'Lisa Chen', 'planned'),
('Yoga for Kids', 'outdoor', '2026-03-20', '09:30', 20, 'preschool', 'Moon Room', 'Simple yoga poses with animal themes', 'Yoga mats, animal pose cards', 'Balance, body awareness, mindfulness', 'Mark Davis', 'planned'),
('Puppet Show - Three Little Pigs', 'dramatic_play', '2026-03-20', '14:00', 25, 'preschool', 'Moon Room', 'Staff-led puppet show followed by child participation', 'Pig and wolf puppets, house props', 'Narrative skills, sequencing, dramatic expression', 'Mark Davis', 'planned'),
('Tummy Time with Mirrors', 'sensory', '2026-03-20', '09:00', 15, 'infant', 'Rainbow Room', 'Structured tummy time with safety mirrors and toys', 'Safety mirrors, rattles, textured mats', 'Neck strength, visual tracking, self-awareness', 'Sarah Williams', 'planned'),
('Alphabet Scavenger Hunt', 'literacy', '2026-03-21', '10:00', 30, 'preschool', 'Star Room', 'Find objects around the room that start with each letter', 'Letter cards, collection baskets, stickers', 'Letter recognition, phonics, critical thinking', 'Lisa Chen', 'planned'),
('Finger Painting Fun', 'art', '2026-03-21', '09:30', 30, 'toddler', 'Art Studio', 'Toddlers explore color mixing through finger painting', 'Finger paints, large paper, smocks, wipes', 'Color mixing, sensory exploration, self-expression', 'Jenny Park', 'planned');

-- ============================================================
-- SEED DATA: Immunizations (15 items)
-- ============================================================
INSERT INTO immunizations (child_name, vaccine_name, dose_number, date_administered, administered_by, next_due_date, status, notes) VALUES
('Emma Johnson', 'DTaP', 4, '2025-09-15', 'Dr. Patel', '2026-09-15', 'up_to_date', '4th dose completed on schedule'),
('Emma Johnson', 'MMR', 1, '2023-03-20', 'Dr. Patel', '2026-03-20', 'due_soon', '2nd dose due at age 4'),
('Liam Williams', 'Hep B', 2, '2023-05-20', 'Dr. Lee', '2024-01-20', 'up_to_date', 'On schedule for series'),
('Liam Williams', 'Rotavirus', 2, '2023-07-18', 'Dr. Lee', '2023-11-18', 'up_to_date', 'Series complete'),
('Sophia Brown', 'DTaP', 5, '2025-07-10', 'Dr. Patel', NULL, 'up_to_date', 'Series complete for kindergarten entry'),
('Sophia Brown', 'IPV', 4, '2025-07-10', 'Dr. Patel', NULL, 'up_to_date', 'Final dose administered'),
('Noah Davis', 'PCV13', 3, '2025-05-05', 'Dr. Lee', '2026-05-05', 'up_to_date', '4th dose due at 15 months'),
('Olivia Martinez', 'Varicella', 1, '2022-04-22', 'Dr. Sanchez', '2025-04-22', 'overdue', '2nd dose overdue - parent contacted'),
('Ethan Garcia', 'DTaP', 2, '2025-12-18', 'Dr. Lee', '2026-04-18', 'up_to_date', '3rd dose due at 6 months'),
('Ava Rodriguez', 'Hep A', 1, '2024-02-28', 'Dr. Patel', '2024-08-28', 'up_to_date', '2nd dose completed'),
('Mason Wilson', 'MMR', 2, '2025-02-14', 'Dr. Patel', NULL, 'up_to_date', 'Series complete'),
('Isabella Anderson', 'Hep B', 1, '2023-09-01', 'Dr. Lee', '2024-01-01', 'up_to_date', 'Birth dose given at hospital'),
('James Thomas', 'Influenza', 1, '2025-10-15', 'Nurse Williams', '2026-10-15', 'up_to_date', 'Annual flu shot'),
('Charlotte Jackson', 'DTaP', 4, '2025-04-08', 'Dr. Patel', '2025-10-08', 'overdue', '5th dose overdue - scheduling appointment'),
('Mia Harris', 'COVID-19', 1, '2025-11-17', 'Dr. Lee', '2026-05-17', 'up_to_date', 'First dose of pediatric series');

-- Waiting List table
CREATE TABLE waitlist (
  id SERIAL PRIMARY KEY,
  child_name VARCHAR(255) NOT NULL,
  parent_name VARCHAR(255),
  parent_email VARCHAR(255),
  parent_phone VARCHAR(20),
  date_of_birth DATE,
  age_group VARCHAR(50),
  desired_start_date DATE,
  position INTEGER,
  status VARCHAR(50) DEFAULT 'waiting',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Supply Inventory table
CREATE TABLE supply_inventory (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  quantity INTEGER DEFAULT 0,
  unit VARCHAR(50),
  reorder_level INTEGER,
  cost_per_unit DECIMAL(10,2),
  supplier VARCHAR(255),
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'in_stock',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily Reports table
CREATE TABLE daily_reports (
  id SERIAL PRIMARY KEY,
  child_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  mood VARCHAR(50),
  meals_eaten TEXT,
  nap_start TIME,
  nap_end TIME,
  activities_summary TEXT,
  bathroom_notes TEXT,
  supplies_needed TEXT,
  teacher_notes TEXT,
  sent_to_parent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed Waiting List
INSERT INTO waitlist (child_name, parent_name, parent_email, parent_phone, date_of_birth, age_group, desired_start_date, position, status, notes) VALUES
('Zoe Mitchell', 'Karen Mitchell', 'karen.m@email.com', '555-0201', '2024-06-15', 'infant', '2025-06-01', 1, 'waiting', 'Prefers morning drop-off'),
('Lucas Clark', 'David Clark', 'david.c@email.com', '555-0202', '2023-11-20', 'toddler', '2025-04-01', 2, 'waiting', 'Sibling already enrolled'),
('Aria Lewis', 'Jennifer Lewis', 'jen.lewis@email.com', '555-0203', '2024-02-10', 'infant', '2025-08-15', 3, 'waiting', 'Referred by current family'),
('Henry Walker', 'Mark Walker', 'mark.w@email.com', '555-0204', '2022-09-05', 'preschool', '2025-09-01', 4, 'offered', 'Spot offered on 2025-03-15'),
('Chloe Hall', 'Sarah Hall', 'sarah.h@email.com', '555-0205', '2024-01-30', 'infant', '2025-07-01', 5, 'waiting', 'Needs allergy-friendly classroom'),
('Leo Young', 'Tom Young', 'tom.y@email.com', '555-0206', '2023-07-12', 'toddler', '2025-05-01', 6, 'accepted', 'Accepted offer, enrollment pending'),
('Grace King', 'Amanda King', 'amanda.k@email.com', '555-0207', '2022-03-25', 'preschool', '2025-09-01', 7, 'waiting', 'Full-time care needed'),
('Elijah Wright', 'Robert Wright', 'robert.w@email.com', '555-0208', '2024-08-18', 'infant', '2026-01-01', 8, 'waiting', 'Part-time preferred'),
('Lily Scott', 'Michelle Scott', 'michelle.s@email.com', '555-0209', '2023-04-22', 'toddler', '2025-06-15', 9, 'declined', 'Found another daycare'),
('Owen Green', 'Chris Green', 'chris.g@email.com', '555-0210', '2022-12-01', 'preschool', '2025-04-15', 10, 'enrolled', 'Successfully enrolled March 2025'),
('Sophie Adams', 'Laura Adams', 'laura.a@email.com', '555-0211', '2024-05-08', 'infant', '2025-11-01', 11, 'waiting', 'Twins - need two spots'),
('Jack Nelson', 'Brian Nelson', 'brian.n@email.com', '555-0212', '2023-10-15', 'toddler', '2025-08-01', 12, 'waiting', 'Relocating to the area'),
('Ella Carter', 'Diana Carter', 'diana.c@email.com', '555-0213', '2024-03-20', 'infant', '2025-09-15', 13, 'waiting', 'Needs bilingual program'),
('Ryan Phillips', 'Kevin Phillips', 'kevin.p@email.com', '555-0214', '2022-06-10', 'preschool', '2025-05-01', 14, 'offered', 'Offer sent, awaiting response'),
('Nora Evans', 'Lisa Evans', 'lisa.e@email.com', '555-0215', '2023-08-28', 'toddler', '2025-07-15', 15, 'waiting', 'Interested in Montessori approach');

-- Seed Supply Inventory
INSERT INTO supply_inventory (item_name, category, quantity, unit, reorder_level, cost_per_unit, supplier, location, status, notes) VALUES
('Disposable Diapers (Size 3)', 'medical', 150, 'pcs', 50, 0.35, 'BabyCare Supplies', 'Storage Room A', 'in_stock', 'Most used size'),
('Baby Wipes', 'medical', 80, 'packs', 20, 2.50, 'BabyCare Supplies', 'Storage Room A', 'in_stock', 'Fragrance-free, hypoallergenic'),
('Hand Sanitizer', 'cleaning', 12, 'bottles', 5, 4.99, 'CleanPro Inc', 'All Classrooms', 'in_stock', 'Wall-mounted dispensers'),
('Construction Paper (Assorted)', 'art_supplies', 8, 'packs', 3, 6.99, 'SchoolArts Co', 'Art Supply Closet', 'in_stock', '200 sheets per pack'),
('Crayons (24-count)', 'art_supplies', 25, 'boxes', 10, 3.49, 'SchoolArts Co', 'Art Supply Closet', 'in_stock', 'Non-toxic, washable'),
('Paper Towels', 'cleaning', 6, 'rolls', 10, 1.99, 'CleanPro Inc', 'Storage Room B', 'low_stock', 'Need to reorder soon'),
('Latex-Free Gloves (M)', 'medical', 3, 'boxes', 5, 8.99, 'MedSupply Direct', 'Nurse Station', 'low_stock', '100 gloves per box'),
('Finger Paint (Set)', 'art_supplies', 15, 'bottles', 5, 4.50, 'SchoolArts Co', 'Art Supply Closet', 'in_stock', 'Washable, non-toxic'),
('Bleach Disinfectant', 'cleaning', 4, 'gal', 2, 6.99, 'CleanPro Inc', 'Janitorial Closet', 'in_stock', 'Dilute before use'),
('Copy Paper', 'office', 10, 'packs', 3, 7.99, 'OfficeMax', 'Front Office', 'in_stock', '500 sheets per pack'),
('Bandages (Assorted)', 'medical', 0, 'boxes', 3, 5.99, 'MedSupply Direct', 'Nurse Station', 'out_of_stock', 'URGENT - reorder immediately'),
('Play-Doh (12-pack)', 'toys', 8, 'packs', 3, 9.99, 'SchoolArts Co', 'Toddler Room', 'in_stock', 'Assorted colors'),
('Sippy Cups', 'food', 20, 'pcs', 10, 3.99, 'BabyCare Supplies', 'Kitchen', 'in_stock', 'BPA-free, dishwasher safe'),
('Nap Mats', 'furniture', 2, 'pcs', 5, 24.99, 'KidComfort Inc', 'Nap Room', 'low_stock', '3 mats have tears, need replacement'),
('Sunscreen SPF 50', 'medical', 6, 'bottles', 3, 11.99, 'MedSupply Direct', 'Outdoor Storage', 'in_stock', 'Mineral-based, kid-safe');

-- Seed Daily Reports
INSERT INTO daily_reports (child_name, date, mood, meals_eaten, nap_start, nap_end, activities_summary, bathroom_notes, supplies_needed, teacher_notes, sent_to_parent) VALUES
('Emma Johnson', '2025-03-20', 'happy', 'Breakfast, Morning Snack, Lunch', '12:30', '14:00', 'Finger painting, outdoor play, story time', 'Normal', NULL, 'Emma had a wonderful day! She loved the painting activity.', true),
('Liam Williams', '2025-03-20', 'good', 'Breakfast, Lunch', '12:45', '14:15', 'Block building, music time, sandbox play', 'Normal', 'Extra clothes needed', 'Liam was very engaged with building blocks today.', true),
('Sophia Brown', '2025-03-20', 'happy', 'Breakfast, Morning Snack, Lunch, Afternoon Snack', '13:00', '14:30', 'Circle time, counting games, outdoor play', 'Normal', NULL, 'Sophia is making great progress with counting to 20!', true),
('Noah Davis', '2025-03-20', 'fussy', 'Morning Snack, Lunch', '12:15', '13:45', 'Quiet play, reading corner, sensory bin', '2 diaper changes', 'More diapers', 'Noah seemed a bit under the weather. Low-grade temp of 99.2.', true),
('Olivia Martinez', '2025-03-20', 'happy', 'Breakfast, Lunch, Afternoon Snack', '12:30', '14:00', 'Dance class, art project, dramatic play', 'Normal', NULL, 'Olivia choreographed a dance for her friends!', false),
('Ethan Garcia', '2025-03-20', 'good', 'Breakfast, Morning Snack, Lunch', '12:00', '13:30', 'Tummy time, rattle play, lullaby time', '3 diaper changes', NULL, 'Ethan is getting stronger at tummy time!', true),
('Ava Rodriguez', '2025-03-19', 'okay', 'Breakfast, Lunch', '12:30', '13:00', 'Coloring, playdough, outdoor walk', 'Normal', NULL, 'Short nap today, seemed tired in the afternoon.', true),
('Mason Wilson', '2025-03-19', 'happy', 'Breakfast, Morning Snack, Lunch, Afternoon Snack', '12:45', '14:30', 'Science experiment (volcanoes), free play, reading', 'Normal', NULL, 'Mason loved the baking soda volcano experiment!', true),
('Isabella Anderson', '2025-03-19', 'tired', 'Lunch', '11:30', '14:00', 'Gentle play, cuddling, soft music', '2 diaper changes', 'Pacifier (lost)', 'Isabella had a long nap, may be getting a cold.', true),
('James Thomas', '2025-03-19', 'happy', 'Breakfast, Morning Snack, Lunch', '12:30', '14:00', 'Soccer outside, alphabet practice, puzzles', 'Normal, used potty twice', NULL, 'James is doing great with potty training!', false),
('Charlotte Jackson', '2025-03-18', 'good', 'Breakfast, Lunch, Afternoon Snack', '13:00', '14:30', 'Watercolor painting, nature walk, show-and-tell', 'Normal', NULL, 'Charlotte brought her stuffed bunny for show-and-tell.', true),
('Mia Harris', '2025-03-18', 'happy', 'Breakfast, Morning Snack, Lunch', '12:30', '14:00', 'Yoga class, garden time, free play', 'Normal', 'Sunscreen', 'Mia really enjoyed our mini yoga session today.', true),
('Emma Johnson', '2025-03-19', 'good', 'Breakfast, Lunch', '12:30', '14:15', 'Clay modeling, outdoor play, group singing', 'Normal', NULL, 'Emma made a clay cat - very creative!', true),
('Liam Williams', '2025-03-19', 'okay', 'Morning Snack, Lunch', '13:00', '14:00', 'Truck play, water table, story time', 'Normal', NULL, 'Liam was a bit quiet today but joined in water play.', true),
('Sophia Brown', '2025-03-18', 'happy', 'Breakfast, Morning Snack, Lunch, Afternoon Snack', '12:45', '14:30', 'Letter writing practice, cooking helper, outdoor play', 'Normal', NULL, 'Sophia helped make trail mix for snack - great fine motor practice!', true);
