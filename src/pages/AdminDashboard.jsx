import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../config/supabase'

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [activeTab, setActiveTab] = useState('students') // 'students' or 'reports'
  const [newStudent, setNewStudent] = useState({
    name: '',
    enrollment_no: '',
    department: '',
    email: ''
  })
  
  // Attendance Report States
  const [reportData, setReportData] = useState([])
  const [reportLoading, setReportLoading] = useState(false)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDepartment, setSelectedDepartment] = useState('')
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
  
  // Percentage Calculator States
  const [holidays, setHolidays] = useState(0)
  const [showPercentages, setShowPercentages] = useState(false)
  const [attendanceStats, setAttendanceStats] = useState([])

  useEffect(() => {
    fetchStudents()
    fetchDepartments()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('enrollment_no', { ascending: true })
      
      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleAddStudent = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('students')
        .insert([newStudent])
      
      if (error) throw error
      
      setNewStudent({ name: '', enrollment_no: '', department: '', email: '' })
      setShowAddStudent(false)
      fetchStudents()
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Error adding student: ' + error.message)
    }
  }

  const handleDeleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchStudents()
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Error deleting student: ' + error.message)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  const fetchAttendanceReport = async () => {
    try {
      setReportLoading(true)
      
      let query = supabase
        .from('attendance')
        .select(`
          *,
          students:student_id (
            enrollment_no,
            name,
            department,
            email
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
      
      if (selectedDepartment) {
        query = query.eq('department', selectedDepartment)
      }
      
      if (selectedSubject) {
        query = query.eq('subject', selectedSubject)
      }
      
      const { data, error } = await query.order('date', { ascending: false })
      
      if (error) throw error
      setReportData(data || [])
    } catch (error) {
      console.error('Error fetching attendance report:', error)
      alert('Error fetching report: ' + error.message)
    } finally {
      setReportLoading(false)
    }
  }

  const downloadCSV = () => {
    if (reportData.length === 0) {
      alert('No data to export. Please generate a report first.')
      return
    }

    // Get unique dates and sort them
    const uniqueDates = [...new Set(reportData.map(record => record.date))].sort()
    
    // Group data by student
    const studentData = {}
    
    reportData.forEach(record => {
      const enrollmentNo = record.students?.enrollment_no || 'N/A'
      const studentName = record.students?.name || 'N/A'
      const department = record.students?.department || 'N/A'
      const date = record.date
      const status = record.is_present ? 'Present' : 'Absent'
      
      if (!studentData[enrollmentNo]) {
        studentData[enrollmentNo] = {
          name: studentName,
          department: department,
          attendance: {}
        }
      }
      
      // Store attendance for this date (if multiple entries, last one wins)
      studentData[enrollmentNo].attendance[date] = status
    })

    // Prepare CSV headers: Enrollment No, Name, Department, then all dates
    const dateHeaders = uniqueDates.map(date => new Date(date).toLocaleDateString())
    const headers = ['Enrollment No.', 'Student Name', 'Department', ...dateHeaders]
    
    // Prepare CSV rows
    const rows = Object.keys(studentData)
      .sort() // Sort by enrollment number
      .map(enrollmentNo => {
        const student = studentData[enrollmentNo]
        const row = [
          enrollmentNo,
          student.name,
          student.department
        ]
        
        // Add attendance status for each date
        uniqueDates.forEach(date => {
          row.push(student.attendance[date] || '-')
        })
        
        return row
      })

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    // Generate filename with date range
    const filename = `attendance_report_${startDate}_to_${endDate}.csv`
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const calculatePercentages = () => {
    if (reportData.length === 0) {
      alert('Please generate a report first before calculating percentages.')
      return
    }

    // Calculate total days in date range
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end date
    
    // Calculate working days (total days - holidays)
    const workingDays = totalDays - parseInt(holidays || 0)

    // Group attendance by student
    const studentAttendance = {}
    
    reportData.forEach(record => {
      const studentId = record.student_id
      const enrollmentNo = record.students?.enrollment_no
      const studentName = record.students?.name
      const department = record.department
      
      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = {
          enrollmentNo,
          name: studentName,
          department,
          totalPresent: 0,
          totalAbsent: 0,
          totalClasses: 0
        }
      }
      
      studentAttendance[studentId].totalClasses++
      if (record.is_present) {
        studentAttendance[studentId].totalPresent++
      } else {
        studentAttendance[studentId].totalAbsent++
      }
    })

    // Calculate percentages
    const stats = Object.values(studentAttendance).map(student => ({
      ...student,
      percentage: ((student.totalPresent / student.totalClasses) * 100).toFixed(2),
      workingDays,
      totalDays,
      holidays: parseInt(holidays || 0)
    }))

    // Sort by enrollment number
    stats.sort((a, b) => (a.enrollmentNo || '').localeCompare(b.enrollmentNo || ''))
    
    setAttendanceStats(stats)
    setShowPercentages(true)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('students')}
              className={`${
                activeTab === 'students'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Student Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`${
                activeTab === 'reports'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Attendance Reports
            </button>
          </nav>
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{students.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Active Departments</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {[...new Set(students.map(s => s.department))].length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">System Status</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">Active</p>
          </div>
        </div>

        {/* Students Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Student Management</h2>
            <button
              onClick={() => setShowAddStudent(!showAddStudent)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {showAddStudent ? 'Cancel' : 'Add Student'}
            </button>
          </div>

          {/* Add Student Form */}
          {showAddStudent && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Enrollment Number (e.g., CS2024001)"
                  value={newStudent.enrollment_no}
                  onChange={(e) => setNewStudent({...newStudent, enrollment_no: e.target.value})}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Department (e.g., Computer Science)"
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
                <button
                  type="submit"
                  className="md:col-span-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Add Student
                </button>
              </form>
            </div>
          )}

          {/* Students Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No students found. Add your first student!
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.enrollment_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
          </>
        )}

        {/* Attendance Reports Tab */}
        {activeTab === 'reports' && (
          <>
            {/* Report Filters */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance Report Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    />
                  </div>

                  {/* Holidays */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Holidays (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={holidays}
                      onChange={(e) => setHolidays(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    >
                      <option value="">All Subjects</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={fetchAttendanceReport}
                    disabled={reportLoading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reportLoading ? 'Loading...' : 'Generate Report'}
                  </button>
                  
                  {reportData.length > 0 && (
                    <>
                      <button
                        onClick={calculatePercentages}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition font-medium inline-flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Calculate %
                      </button>
                      <button
                        onClick={downloadCSV}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium inline-flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download CSV
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Report Results */}
            {reportData.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Attendance Records</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Found {reportData.length} attendance records
                    </p>
                  </div>
                  <button
                    onClick={downloadCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrollment No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lecture
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.map((record) => (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.students?.enrollment_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.students?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.lecture_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.is_present 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.is_present ? 'Present' : 'Absent'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportData.length === 0 && !reportLoading && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No attendance records found. Please select filters and generate report.
              </div>
            )}

            {/* Percentage Results */}
            {showPercentages && attendanceStats.length > 0 && (
              <div className="bg-white rounded-lg shadow mt-6">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Attendance Percentage Report</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Total Days: {attendanceStats[0]?.totalDays} | Holidays: {attendanceStats[0]?.holidays} | Working Days: {attendanceStats[0]?.workingDays}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPercentages(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrollment No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Classes Attended
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Classes
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceStats.map((student, index) => (
                        <tr key={index} className={student.percentage < 75 ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.enrollmentNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {student.totalPresent}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {student.totalClasses}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                              student.percentage >= 75 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {student.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Note:</span> Students with less than 75% attendance are highlighted in red.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
