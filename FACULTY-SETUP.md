# FACULTY SETUP GUIDE - LOKMANYA COLLEGE

## 🎯 Quick Setup Steps

### Step 1: Run the Updated Database Schema

Go to your Supabase Dashboard > SQL Editor and run the SQL from `database-setup.sql`

Or copy this quick update script:

```sql
-- Update existing tables or create new ones
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Create students table with enrollment number
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  enrollment_no TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read students" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert students" ON students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update students" ON students FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete students" ON students FOR DELETE TO authenticated USING (true);

-- Create attendance table with lecture tracking
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  department TEXT NOT NULL,
  lecture_no INTEGER NOT NULL CHECK (lecture_no >= 1 AND lecture_no <= 10),
  is_present BOOLEAN DEFAULT false,
  marked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(student_id, date, department, lecture_no)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read attendance" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert attendance" ON attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update attendance" ON attendance FOR UPDATE TO authenticated USING (true);
```

### Step 2: Create 8 Faculty Users

Go to Supabase Dashboard > Authentication > Users > Add user

Create these 8 faculty accounts (password: `faculty123` for all):

1. ✅ shanti.lokmanya@lokmanya.edu
2. ✅ kunj.lokmanya@lokmanya.edu
3. ✅ ami.lokmanya@lokmanya.edu
4. ✅ nisha.lokmanya@lokmanya.edu
5. ✅ abhilasha.lokmanya@lokmanya.edu
6. ✅ sheetal.lokmanya@lokmanya.edu
7. ✅ viji.lokmanya@lokmanya.edu
8. ✅ ambili.lokmanya@lokmanya.edu

**Important**: Check "Auto Confirm User" for each!

### Step 3: Add Sample Students (Optional)

Run the sample data from `database-setup.sql` or add your own students via Admin Dashboard.

---

## 📋 New Faculty Dashboard Features

### ✨ What's New:

1. **Date Selection** - Pick any date for attendance
2. **Department Filter** - Select specific department
3. **Lecture Number** - Choose lecture 1-10
4. **Checkbox System** - Simple click = present, unchecked = absent
5. **Enrollment Numbers** - Display student enrollment IDs
6. **Auto-save** - Attendance saves for all students in department

### 📊 How to Mark Attendance:

1. Login with faculty credentials
2. Select:
   - Date (default: today)
   - Department
   - Lecture number
3. Click checkbox for present students
4. Click "Submit Attendance"
5. Done! ✅

---

## 🔑 Test Credentials

**Admin:**
- Email: admin@lokmanya.edu
- Password: admin123

**Faculty (any of the 8):**
- Email: shanti.lokmanya@lokmanya.edu (or any other)
- Password: faculty123

---

## 📝 Database Structure

### Students Table:
- `enrollment_no` - Unique enrollment number (e.g., CS2024001)
- `name` - Student name
- `department` - Department name
- `email` - Student email

### Attendance Table:
- `date` - Date of attendance
- `department` - Department name
- `lecture_no` - Lecture number (1-10)
- `is_present` - Boolean (checkbox checked = true)
- `marked_by` - Faculty who marked it

---

## ✅ Verification

After setup, verify:
1. ✓ All 8 faculty can login
2. ✓ Students show enrollment numbers
3. ✓ Can select date/department/lecture
4. ✓ Checkboxes work
5. ✓ Attendance saves successfully

---

**Ready to use!** 🚀
