import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import { STUDENT_ENDPOINTS } from '../api/endpoints'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosClient.get(STUDENT_ENDPOINTS.GET_DASHBOARD)
        setStats(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="student-dashboard">
      <header>
        <h1>Welcome, {user?.name}</h1>
        <button onClick={logout}>Logout</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="dashboard-content">
          <div className="stats-card">
            <h3>Files Uploaded</h3>
            <p>{stats.filesUploaded}</p>
          </div>
          <div className="stats-card">
            <h3>Pending Review</h3>
            <p>{stats.pendingReview}</p>
          </div>
          <div className="stats-card">
            <h3>Approved</h3>
            <p>{stats.approved}</p>
          </div>
        </div>
      )}
    </div>
  )
}
