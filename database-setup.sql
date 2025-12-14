-- ==================================================================================
-- LOKMANYA COLLEGE - UPDATED DATABASE SCHEMA
-- Enhanced Attendance System with Department, Lecture Number, and Enrollment
-- ==================================================================================

-- ==================================================================================
-- STEP 1: UPDATE STUDENTS TABLE
-- ==================================================================================

-- Drop existing students table if you want to start fresh
-- DROP TABLE IF EXISTS attendance CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;

-- Create updated students table with enrollment number and department
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  enrollment_no TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security for students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to insert students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to update students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to delete students" ON students;

-- Create policies for students
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

-- ==================================================================================
-- STEP 2: UPDATE ATTENDANCE TABLE
-- ==================================================================================

-- Drop existing attendance table to recreate with new structure
-- DROP TABLE IF EXISTS attendance CASCADE;

-- Create updated attendance table with lecture number and subject
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  department TEXT NOT NULL,
  lecture_no INTEGER NOT NULL CHECK (lecture_no >= 1 AND lecture_no <= 10),
  subject TEXT NOT NULL,
  is_present BOOLEAN DEFAULT false,
  marked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(student_id, date, department, lecture_no, subject)
);

-- Enable Row Level Security for attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read attendance" ON attendance;
DROP POLICY IF EXISTS "Allow authenticated users to insert attendance" ON attendance;
DROP POLICY IF EXISTS "Allow authenticated users to update attendance" ON attendance;

-- Create policies for attendance
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

-- ==================================================================================
-- STEP 3: CREATE 8 FACULTY USERS
-- Run these one by one in Supabase Authentication UI or via SQL
-- ==================================================================================

-- NOTE: You need to create these users in Supabase Dashboard > Authentication > Users
-- Email/Password for each faculty:

/*
1. shanti.lokmanya@lokmanya.edu / faculty123
2. kunj.lokmanya@lokmanya.edu / faculty123
3. ami.lokmanya@lokmanya.edu / faculty123
4. nisha.lokmanya@lokmanya.edu / faculty123
5. abhilasha.lokmanya@lokmanya.edu / faculty123
6. sheetal.lokmanya@lokmanya.edu / faculty123
7. viji.lokmanya@lokmanya.edu / faculty123
8. ambili.lokmanya@lokmanya.edu / faculty123
*/

-- After creating users in Authentication UI, their profiles will be auto-created as 'faculty'
-- via the handle_new_user() trigger

-- ==================================================================================
-- STEP 4: INSERT SAMPLE STUDENTS (Optional - for testing)
-- ==================================================================================

-- BCA_24 Students from Lokmanya College
INSERT INTO students (name, enrollment_no, department, email) VALUES
('ABDELI MASVI JOHARBHAI', '243180601001', 'BCA_24', 'abdeli.masvi@student.lokmanya.edu'),
('ADARSH ARUNKUMAR', '243180601002', 'BCA_24', 'adarsh.arunkumar@student.lokmanya.edu'),
('ADRA SAHIL UMARAM', '243180601003', 'BCA_24', 'adra.sahil@student.lokmanya.edu'),
('BELIM SOHAN ZAVEDBHAI', '243180601007', 'BCA_24', 'belim.sohan@student.lokmanya.edu'),
('BHALGAMIYA RONAK NARESHBHAI', '243180601008', 'BCA_24', 'bhalgamiya.ronak@student.lokmanya.edu'),
('BHAVSAR VINIT MAHESHBHAI', '243180601009', 'BCA_24', 'bhavsar.vinit@student.lokmanya.edu'),
('BHATT OM NIMESHKUMAR', '243180601010', 'BCA_24', 'bhatt.om@student.lokmanya.edu'),
('CHADOTARA KULDIP PRAKASHBHAI', '243180601011', 'BCA_24', 'chadotara.kuldip@student.lokmanya.edu'),
('CHAUHAN MAHI RAKESHBHAI', '243180601014', 'BCA_24', 'chauhan.mahi@student.lokmanya.edu'),
('CHAVDA JAIMIN MUKESHBHAI', '243180601017', 'BCA_24', 'chavda.jaimin@student.lokmanya.edu'),
('DABGAR RISHI HARSHADBHAI', '243180601019', 'BCA_24', 'dabgar.rishi@student.lokmanya.edu'),
('DAGAR ANJALI DINESHBHAI', '243180601020', 'BCA_24', 'dagar.anjali@student.lokmanya.edu'),
('DESAI SAGARBHAI ARJANBHAI', '243180601021', 'BCA_24', 'desai.sagarbhai@student.lokmanya.edu'),
('PATEL DEVKUMAR KALPESHBHAI', '243180601022', 'BCA_24', 'patel.devkumar@student.lokmanya.edu'),
('DEVAIYA NAYAN JAYESHBHAI', '243180601023', 'BCA_24', 'devaiya.nayan@student.lokmanya.edu'),
('DHOLAKIYA NIV BRIJESHBHAI', '243180601024', 'BCA_24', 'dholakiya.niv@student.lokmanya.edu'),
('DODIYA MEET MANISHBHAI', '243180601025', 'BCA_24', 'dodiya.meet@student.lokmanya.edu'),
('GAJARE SUJAL ARUNBHAI', '243180601027', 'BCA_24', 'gajare.sujal@student.lokmanya.edu'),
('GOHIL JENISH BHARATBHAI', '243180601028', 'BCA_24', 'gohil.jenish@student.lokmanya.edu'),
('GOLARANA HETVI DIPAKBHAI', '243180601029', 'BCA_24', 'golarana.hetvi@student.lokmanya.edu'),
('GURAV DEVANSHU RAJENDRABHAI', '243180601030', 'BCA_24', 'gurav.devanshu@student.lokmanya.edu'),
('KAHAR NEHA SUNILBHAI', '243180601034', 'BCA_24', 'kahar.neha@student.lokmanya.edu'),
('KHANVILKAR MAHADEV MADHUKAR', '243180601037', 'BCA_24', 'khanvilkar.mahadev@student.lokmanya.edu'),
('KONKATI JIGAR RAJUBHAI', '243180601039', 'BCA_24', 'konkati.jigar@student.lokmanya.edu'),
('KUMAR DISHANT AMRITLAL', '243180601040', 'BCA_24', 'kumar.dishant@student.lokmanya.edu'),
('KURESHI SAMINBHAI JAMALBHAI', '243180601041', 'BCA_24', 'kureshi.saminbhai@student.lokmanya.edu'),
('LADAVA PRASHANT VAKTAJI', '243180601043', 'BCA_24', 'ladava.prashant@student.lokmanya.edu'),
('LIL KATHAN MANOJBHAI', '243180601046', 'BCA_24', 'lil.kathan@student.lokmanya.edu'),
('LUHAR DISHA NIRAVKUMAR', '243180601047', 'BCA_24', 'luhar.disha@student.lokmanya.edu'),
('LUHAR JAIMIN P', '243180601048', 'BCA_24', 'luhar.jaimin@student.lokmanya.edu'),
('MAKWANA PRIYANSHI RAMESHKUMAR', '243180601049', 'BCA_24', 'makwana.priyanshi@student.lokmanya.edu'),
('MAKWANA DHRUVI RAHULBHAI', '243180601050', 'BCA_24', 'makwana.dhruvi@student.lokmanya.edu'),
('MANSURI SOFIYA SALIMBHAI', '243180601052', 'BCA_24', 'mansuri.sofiya@student.lokmanya.edu'),
('MANSURIPINJARA TANVIRBEN SIRAJBHAI', '243180601053', 'BCA_24', 'mansuripinjara.tanvirben@student.lokmanya.edu'),
('MEHRA MANMOHAN PRAKASH', '243180601054', 'BCA_24', 'mehra.manmohan@student.lokmanya.edu'),
('MULTANI MAHEKBANU ABBASHUSEN', '243180601055', 'BCA_24', 'multani.mahekbanu@student.lokmanya.edu'),
('NAGORI MEMUNA TAREEQKHAN', '243180601056', 'BCA_24', 'nagori.memuna@student.lokmanya.edu'),
('UPADHYAY PRANJAL ASHOKKUMAR', '243180601059', 'BCA_24', 'upadhyay.pranjal@student.lokmanya.edu'),
('PANCHAL ANITA PRAVINBHAI', '243180601060', 'BCA_24', 'panchal.anita@student.lokmanya.edu'),
('PANCHAL HARSHIL GAURANGBHAI', '243180601061', 'BCA_24', 'panchal.harshil@student.lokmanya.edu'),
('PANCHAL HET SUNILKUMAR', '243180601062', 'BCA_24', 'panchal.het@student.lokmanya.edu'),
('PANCHAL MANAV ATULBHAI', '243180601063', 'BCA_24', 'panchal.manav@student.lokmanya.edu'),
('PAREKH PREM HEMANTKUMAR', '243180601064', 'BCA_24', 'parekh.prem@student.lokmanya.edu'),
('PATEL GRISHA M', '243180601067', 'BCA_24', 'patel.grisha@student.lokmanya.edu'),
('PATEL PRIYA HASMUKHBHAI', '243180601069', 'BCA_24', 'patel.priya.h@student.lokmanya.edu'),
('PATEL PRIYA NILESHKUMAR', '243180601070', 'BCA_24', 'patel.priya.n@student.lokmanya.edu'),
('PATEL SHIVANG MUKESHBHAI', '243180601071', 'BCA_24', 'patel.shivang@student.lokmanya.edu'),
('PATEL VIDHI DEVENDRABHAI', '243180601073', 'BCA_24', 'patel.vidhi@student.lokmanya.edu'),
('PATNI SAHIL VIJAYBHAI', '243180601076', 'BCA_24', 'patni.sahil@student.lokmanya.edu'),
('PAWAR VAISHNAVI V', '243180601077', 'BCA_24', 'pawar.vaishnavi@student.lokmanya.edu'),
('PRAJAPATI MAHI JAYESH', '243180601079', 'BCA_24', 'prajapati.mahi@student.lokmanya.edu'),
('PRAJAPATI RAHUL RAJESH', '243180601080', 'BCA_24', 'prajapati.rahul@student.lokmanya.edu'),
('PRAJAPATI YUSHIBEN BHAVESHKUMAR', '243180601081', 'BCA_24', 'prajapati.yushiben@student.lokmanya.edu'),
('RATHOD KASHISH DHARMESHBHAI', '243180601084', 'BCA_24', 'rathod.kashish@student.lokmanya.edu'),
('RATHOD RAJ A', '243180601085', 'BCA_24', 'rathod.raj@student.lokmanya.edu'),
('SAAD SHAIKH', '243180601089', 'BCA_24', 'saad.shaikh@student.lokmanya.edu'),
('SAHANI NEHA', '243180601091', 'BCA_24', 'sahani.neha@student.lokmanya.edu'),
('SHAH VIDHI V', '243180601092', 'BCA_24', 'shah.vidhi@student.lokmanya.edu'),
('SHANKHALA SAHIL GOPALBHAI', '243180601095', 'BCA_24', 'shankhala.sahil@student.lokmanya.edu'),
('SHUKLA SWEETY KAMLESH', '243180601096', 'BCA_24', 'shukla.sweety@student.lokmanya.edu'),
('SIPAI ASLAM H', '243180601098', 'BCA_24', 'sipai.aslam@student.lokmanya.edu'),
('SISODIYA MAHENDRASINH', '243180601099', 'BCA_24', 'sisodiya.mahendrasinh@student.lokmanya.edu'),
('SOLANKI RISHANK PRAVIN KUMAR', '243180601101', 'BCA_24', 'solanki.rishank@student.lokmanya.edu'),
('SOLANKI TIRTHRAJ', '243180601102', 'BCA_24', 'solanki.tirthraj@student.lokmanya.edu'),
('SOLANKI VIVEK H', '243180601103', 'BCA_24', 'solanki.vivek@student.lokmanya.edu'),
('THAKKAR JAIMIN VIPUL BHAI', '243180601106', 'BCA_24', 'thakkar.jaimin@student.lokmanya.edu'),
('THAKOR NEHANGI J', '243180601107', 'BCA_24', 'thakor.nehangi@student.lokmanya.edu'),
('TRIVEDI RUTVA HIMESHBHAI', '243180601109', 'BCA_24', 'trivedi.rutva@student.lokmanya.edu'),
('VANZARA PRADIP MAHENDRABHAI', '243180601114', 'BCA_24', 'vanzara.pradip@student.lokmanya.edu'),
('VARMA CHANCHAL VISHNUBHAI', '243180601115', 'BCA_24', 'varma.chanchal@student.lokmanya.edu'),
('VARMA SHAKSHI H', '243180601116', 'BCA_24', 'varma.shakshi@student.lokmanya.edu'),
('VYASH KHUSH MEHULBHAI', '243180601117', 'BCA_24', 'vyash.khush@student.lokmanya.edu'),
('YASH CHAVDA VIMALBHAI', '243180601119', 'BCA_24', 'chavda.yash@student.lokmanya.edu'),
('ZANJE VAIDEHI S', '243180601120', 'BCA_24', 'zanje.vaidehi@student.lokmanya.edu'),

-- MCA_24 Students from Lokmanya College
('AJWANI SAKSHI RAMCHAND', '245810694002', 'MCA_24', 'ajwani.sakshi@student.lokmanya.edu'),
('ANSARI AMAN ANSAR AHMED', '245810694004', 'MCA_24', 'ansari.aman@student.lokmanya.edu'),
('BADAMALIA RUTVA SHAILESHBHAI', '245810694005', 'MCA_24', 'badamalia.rutva@student.lokmanya.edu'),
('BALOLKAR KAUSHAL SUNILBHAI', '245810694006', 'MCA_24', 'balolkar.kaushal@student.lokmanya.edu'),
('CHAUHAN DIYA RAJESHBHAI', '245810694008', 'MCA_24', 'chauhan.diya@student.lokmanya.edu'),
('CHAUHAN VIREN DHARMENDRABHAI', '245810694009', 'MCA_24', 'chauhan.viren@student.lokmanya.edu'),
('DARJI MANSIBEN CHETANBHAI', '245810694012', 'MCA_24', 'darji.mansiben@student.lokmanya.edu'),
('DESAI PRACHI JAYESH', '245810694013', 'MCA_24', 'desai.prachi@student.lokmanya.edu'),
('GAUD SHIVANI RAMESH', '245810694015', 'MCA_24', 'gaud.shivani@student.lokmanya.edu'),
('JADAV KAUSHAL HITESHKUMAR', '245810694016', 'MCA_24', 'jadav.kaushal@student.lokmanya.edu'),
('JAIN DARSHAN RAJESHKUMAR', '245810694017', 'MCA_24', 'jain.darshan@student.lokmanya.edu'),
('JANI SIDDHIBEN AJAYBHAI', '245810694018', 'MCA_24', 'jani.siddhiben@student.lokmanya.edu'),
('KAMANI HIRALBEN PRAKASHKUMAR', '245810694019', 'MCA_24', 'kamani.hiralben@student.lokmanya.edu'),
('KHUNT DEVANG NILESHBHAI', '245810694022', 'MCA_24', 'khunt.devang@student.lokmanya.edu'),
('KOSHTI DHVANI BANSILAL', '245810694023', 'MCA_24', 'koshti.dhvani@student.lokmanya.edu'),
('KOSHTI ESHA BANSILAL', '245810694024', 'MCA_24', 'koshti.esha@student.lokmanya.edu'),
('KUMAWAT SEEMA DEVARAM', '245810694025', 'MCA_24', 'kumawat.seema@student.lokmanya.edu'),
('KUMAWAT SHUBHAM MADANBHAI', '245810694026', 'MCA_24', 'kumawat.shubham@student.lokmanya.edu'),
('LAKHANI RENUKA BHIKHUBHAI', '245810694027', 'MCA_24', 'lakhani.renuka@student.lokmanya.edu'),
('MAKWANA ANURAG YOGESHBHAI', '245810694028', 'MCA_24', 'makwana.anurag@student.lokmanya.edu'),
('MANAVAR KRUPA VIJAYBHAI', '245810694029', 'MCA_24', 'manavar.krupa@student.lokmanya.edu'),
('NANDANWAR  VIVEK MANIKRAV', '245810694032', 'MCA_24', 'nandanwar.vivek@student.lokmanya.edu'),
('NASKAR SUMIT MADANBHAI', '245810694033', 'MCA_24', 'naskar.sumit@student.lokmanya.edu'),
('PANDYA KETAN BABUBHAI', '245810694035', 'MCA_24', 'pandya.ketan@student.lokmanya.edu'),
('PATEL DHRUVKUMAR  SHAILESHBHAI', '245810694037', 'MCA_24', 'patel.dhruvkumar@student.lokmanya.edu'),
('PATEL DISHABEN HARESHBHAI', '245810694038', 'MCA_24', 'patel.dishaben@student.lokmanya.edu'),
('PATEL KATHAN NAVINCHANDRA', '245810694039', 'MCA_24', 'patel.kathan@student.lokmanya.edu'),
('PATEL VISHAL KANUBHAI', '245810694041', 'MCA_24', 'patel.vishal@student.lokmanya.edu'),
('PRAJAPATI AYUSHI NARESHBHAI', '245810694042', 'MCA_24', 'prajapati.ayushi@student.lokmanya.edu'),
('PRAJAPATI BHAVNA MAHENDRASINGH', '245810694043', 'MCA_24', 'prajapati.bhavna@student.lokmanya.edu'),
('PRAJAPATI DINESH PRAKASHBHAI', '245810694044', 'MCA_24', 'prajapati.dinesh@student.lokmanya.edu'),
('PRAJAPATI NIRALI MANISHBHAI', '245810694045', 'MCA_24', 'prajapati.nirali@student.lokmanya.edu'),
('SHAH PRIYANKA KALPESHBHAI', '245810694049', 'MCA_24', 'shah.priyanka@student.lokmanya.edu'),
('SHAHU ABHAY SHIVBODHAN', '245810694050', 'MCA_24', 'shahu.abhay@student.lokmanya.edu'),
('SHAIKH MUZAFFARMIYA YUSUFMIYA', '245810694051', 'MCA_24', 'shaikh.muzaffarmiya@student.lokmanya.edu'),
('THAKKAR AYUSHI MUKESHBHAI', '245810694053', 'MCA_24', 'thakkar.ayushi@student.lokmanya.edu'),
('VAGHELA PRATHAM DHIRAJBHAI', '245810694054', 'MCA_24', 'vaghela.pratham@student.lokmanya.edu')
ON CONFLICT (enrollment_no) DO NOTHING;

-- ==================================================================================
-- VERIFICATION QUERIES
-- ==================================================================================

-- Check all students
SELECT * FROM students ORDER BY department, enrollment_no;

-- Check all faculty profiles
SELECT u.email, p.role 
FROM auth.users u 
JOIN profiles p ON u.id = p.id 
WHERE p.role = 'faculty';

-- Check attendance records
SELECT 
  s.enrollment_no,
  s.name,
  a.date,
  a.department,
  a.lecture_no,
  a.is_present
FROM attendance a
JOIN students s ON a.student_id = s.id
ORDER BY a.date DESC, a.lecture_no, s.enrollment_no;
