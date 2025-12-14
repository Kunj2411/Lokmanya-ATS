# Lokmanya College - Smart Attendance Management System

A modern, production-ready attendance management system built with React, Vite, Tailwind CSS, and Supabase.

## 🎯 Features

- 🔐 Role-based authentication (Admin & Faculty)
- 👥 Student management
- 📊 Attendance tracking
- 📈 Real-time analytics dashboard
- 📱 Fully responsive design
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast performance with Vite

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Routing**: React Router v6
- **Authentication**: Supabase Auth

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- Supabase account (free tier works - [Sign up](https://supabase.com))

## 🚀 Installation

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set up Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready (this may take a few minutes)
4. Go to **Project Settings** > **API**
5. Copy your **Project URL** and **anon/public** key

### Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Edit the `.env` file and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Set up Database Schema

Go to your Supabase project dashboard > **SQL Editor** and run the following SQL:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'faculty')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow profile creation"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'faculty');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  roll_number TEXT NOT NULL UNIQUE,
  class TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security for students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policies for students (allow authenticated users to read/write)
CREATE POLICY "Allow authenticated users to read students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update students"
  ON students FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete students"
  ON students FOR DELETE
  TO authenticated
  USING (true);

-- Create attendance table
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  marked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(student_id, date)
);

-- Enable Row Level Security for attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policies for attendance
CREATE POLICY "Allow authenticated users to read attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (true);
```

### Step 5: Create Test Users

#### Method 1: Via Supabase Dashboard

1. Go to **Authentication** > **Users** in your Supabase dashboard
2. Click **Add user** > **Create new user**
3. Create these users:

**Admin User:**
- Email: `admin@lokmanya.edu`
- Password: `admin123`
- Auto Confirm User: ✓ (checked)

**Faculty User:**
- Email: `faculty@lokmanya.edu`
- Password: `faculty123`
- Auto Confirm User: ✓ (checked)

4. After creating the admin user, update their role in the SQL Editor:
```sql
-- Replace <admin_user_id> with the actual UUID from the users table
UPDATE profiles SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@lokmanya.edu');
```

### Step 6: Run the Development Server

```bash
npm run dev
```

The application will open at [http://localhost:3000](http://localhost:3000)

## 🔑 Login Credentials

After setup, use these credentials to login:

**Admin Account:**
- Email: `admin@lokmanya.edu`
- Password: `admin123`
- Access: Full system management, student CRUD operations

**Faculty Account:**
- Email: `faculty@lokmanya.edu`
- Password: `faculty123`
- Access: Mark attendance, view students

## 📁 Project Structure

```
attendance-system/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/
│   │   ├── LoadingSpinner.jsx  # Loading component
│   │   ├── Toast.jsx           # Toast notification component
│   │   └── ProtectedRoute.jsx  # Route protection wrapper
│   ├── contexts/
│   │   └── AuthContext.jsx     # Authentication context
│   ├── config/
│   │   └── supabase.js         # Supabase client configuration
│   ├── pages/
│   │   ├── LoginPage.jsx       # Login page
│   │   ├── AdminDashboard.jsx  # Admin dashboard
│   │   ├── FacultyDashboard.jsx # Faculty dashboard
│   │   └── UnauthorizedPage.jsx # 403 error page
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # App entry point
│   └── index.css               # Global styles + Tailwind
├── .env.example                # Environment variables template
├── .env                        # Your environment variables (create this)
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # This file
```

## 🎮 Usage Guide

### Admin Dashboard

1. **View Statistics**: See total students, active classes, and system status
2. **Add Students**: 
   - Click "Add Student" button
   - Fill in student details (Name, Roll Number, Class, Email)
   - Click "Add Student" to save
3. **Manage Students**: View all students in a table format
4. **Delete Students**: Click "Delete" button for any student

### Faculty Dashboard

1. **Select Class**: Choose class from dropdown
2. **Mark Attendance**:
   - Click "Present" or "Absent" for each student
   - Green = Present, Red = Absent
3. **Submit**: Click "Submit Attendance" when done
4. **View Stats**: See present/absent count in real-time

## 🏗️ Build for Production

```bash
npm run build
```

The production build will be created in the `dist` folder.

## 🚀 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `dist` folder to [Netlify](https://app.netlify.com)

3. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Protected routes
- Secure authentication with Supabase
- Environment variables for sensitive data

## 🐛 Troubleshooting

### Issue: Can't login with credentials
- Verify users are created in Supabase Auth
- Check if admin role is set correctly in SQL
- Ensure environment variables are set

### Issue: Students not showing
- Check Supabase connection
- Verify RLS policies are created
- Check browser console for errors

### Issue: Attendance not submitting
- Ensure attendance table exists
- Verify RLS policies allow insert
- Check if student_id is valid UUID

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for learning or production.

## 💬 Support

For support, email support@lokmanya.edu or open an issue on GitHub.

## 🙏 Acknowledgments

- Built with React and Vite
- Styled with Tailwind CSS
- Backend powered by Supabase
- Icons from Heroicons

---

**Built with ❤️ for Lokmanya College**

*Happy Coding!* 🚀
