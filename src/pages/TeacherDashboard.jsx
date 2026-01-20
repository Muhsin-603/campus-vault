import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import { TEACHER_ENDPOINTS } from '../api/endpoints'

export default function TeacherDashboard() {
  const { user, logout } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axiosClient.get(TEACHER_ENDPOINTS.GET_SUBMISSIONS)
        setSubmissions(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load submissions.')
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [])

  const handleApprove = async (submissionId) => {
    try {
      await axiosClient.post(
        TEACHER_ENDPOINTS.APPROVE_SUBMISSION.replace(':id', submissionId)
      )
      // Refresh submissions
      const response = await axiosClient.get(TEACHER_ENDPOINTS.GET_SUBMISSIONS)
      setSubmissions(response.data)
    } catch (err) {
      setError('Failed to approve submission.')
    }
  }

  const handleReject = async (submissionId) => {
    try {
      await axiosClient.post(
        TEACHER_ENDPOINTS.REJECT_SUBMISSION.replace(':id', submissionId)
      )
      // Refresh submissions
      const response = await axiosClient.get(TEACHER_ENDPOINTS.GET_SUBMISSIONS)
      setSubmissions(response.data)
    } catch (err) {
      setError('Failed to reject submission.')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="teacher-dashboard">
      <header>
        <h1>Welcome, {user?.name}</h1>
        <button onClick={logout}>Logout</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="submissions-container">
        <h2>Student Submissions</h2>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>File</th>
              <th>Submitted At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>{submission.studentName}</td>
                <td>{submission.fileName}</td>
                <td>{new Date(submission.submittedAt).toLocaleDateString()}</td>
                <td>{submission.status}</td>
                <td>
                  <button onClick={() => handleApprove(submission.id)}>Approve</button>
                  <button onClick={() => handleReject(submission.id)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
