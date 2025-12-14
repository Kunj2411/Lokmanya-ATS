import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../config/supabase'

export default function FacultyDashboard() {
  const { user, signOut } = useAuth()
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedLecture, setSelectedLecture] = useState('1')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [departments, setDepartments] = useState([])
  const [subjects] = useState([
    'Mathematics',
    'Physics',
    'Chemistry',
    'Computer Science',
    'Data Structures',
    'Database Management',
    'Web Development',
    'Software Engineering',
    'Operating Systems',
    'Computer Networks',
    'Artificial Intelligence',
    'Machine Learning',
    'Programming in C',
    'Programming in Java',
    'Programming in Python'
  ])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (selectedDepartment && selectedSubject) {
      fetchStudents()
      fetchExistingAttendance()
    }
  }, [selectedDepartment, selectedDate, selectedLecture, selectedSubject])

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('department')
      
      if (error) throw error
      
      const uniqueDepts = [...new Set(data.map(s => s.department))]
      setDepartments(uniqueDepts)
      if (uniqueDepts.length > 0 && !selectedDepartment) {
        setSelectedDepartment(uniqueDepts[0])
      }
      if (subjects.length > 0 && !selectedSubject) {
        setSelectedSubject(subjects[0])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('department', selectedDepartment)
        .order('enrollment_no')
      
      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', selectedDate)
        .eq('department', selectedDepartment)
        .eq('lecture_no', parseInt(selectedLecture))
        .eq('subject', selectedSubject)
      
      if (error) throw error
      
      const attendanceMap = {}
      data.forEach(record => {
        attendanceMap[record.student_id] = record.is_present
      })
      setAttendance(attendanceMap)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const handleAttendanceToggle = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }))
  }

  const handleSubmitAttendance = async () => {
    if (Object.keys(attendance).length === 0) {
      alert('Please mark attendance for at least one student')
      return
    }

    if (!confirm(`Submit attendance for ${selectedDepartment}, ${selectedSubject}, Lecture ${selectedLecture} on ${selectedDate}?`)) {
      return
    }

    try {
      setSaving(true)
      
      // Create attendance records for all students in the department
      const attendanceRecords = students.map(student => ({
        student_id: student.id,
        date: selectedDate,
        department: selectedDepartment,
        lecture_no: parseInt(selectedLecture),
        subject: selectedSubject,
        is_present: attendance[student.id] || false,
        marked_by: user.id
      }))

      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, {
          onConflict: 'student_id,date,department,lecture_no,subject'
        })
      
      if (error) throw error
      
      alert('Attendance submitted successfully!')
    } catch (error) {
      console.error('Error submitting attendance:', error)
      alert('Error submitting attendance: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  const presentCount = Object.values(attendance).filter(present => present).length
  const absentCount = students.length - presentCount

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{students.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Present</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{presentCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Absent</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{absentCount}</p>
          </div>
        </div>

        {/* Attendance Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Lecture Number Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lecture Number
                </label>
                <select
                  value={selectedLecture}
                  onChange={(e) => setSelectedLecture(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>Lecture {num}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Marking */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Mark Attendance</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedDepartment} - {selectedSubject} - Lecture {selectedLecture} - {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <button
              onClick={handleSubmitAttendance}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Submit Attendance'}
            </button>
          </div>

          {/* Students List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found in this department
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrollment No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Present
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.enrollment_no}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={attendance[student.id] || false}
                            onChange={() => handleAttendanceToggle(student.id)}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
