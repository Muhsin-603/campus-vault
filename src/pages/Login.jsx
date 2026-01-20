import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axiosClient from '../api/axiosClient'
import { AUTH_ENDPOINTS } from '../api/endpoints'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  // --- THE REAL LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await axiosClient.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password
      })

      const { user, token } = response.data
      login(user, token)
      navigate(user.role === 'student' ? '/student-dashboard' : '/teacher-dashboard')
      
    } catch (err) {
      setError(err.response?.data?.message || 'Access Denied. Identity Unverified.')
    } finally {
      setLoading(false)
    }
  }

  // --- THE DUMMY LOGIN (HACKATHON MODE) ---
  const handleDemoLogin = (role) => {
    setLoading(true)
    
    // Fake realistic delay
    setTimeout(() => {
      const mockUser = role === 'student' 
        ? { name: 'Drac The Developer', email: 'drac@ktu.edu', role: 'student', id: 's1' }
        : { name: 'Prof. Snape', email: 'snape@ktu.edu', role: 'teacher', id: 't1' }
      
      login(mockUser, 'demo-token-12345')
      navigate(role === 'student' ? '/student-dashboard' : '/teacher-dashboard')
      setLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#0a0a0f]">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-glow" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-blue to-neon-purple mb-4 shadow-lg shadow-neon-blue/30 transform rotate-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            CAMPUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">VAULT</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2 tracking-widest uppercase">Secure Identity Gateway</p>
        </div>

        {/* The Glass Card */}
        <div className="glass-card rounded-2xl p-8 backdrop-blur-xl mb-6">
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-3 animate-slide-up">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">University ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full pl-4 py-3 rounded-xl outline-none"
                placeholder="student@ktu.edu.in"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Passcode</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full pl-4 py-3 rounded-xl outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all ${
                loading ? 'bg-vault-800 text-gray-500' : 'btn-primary'
              }`}
            >
              {loading ? 'Authenticating...' : 'Establish Connection'}
            </button>
          </form>
        </div>

        {/* --- DEV OVERRIDE SECTION --- */}
        <div className="text-center space-y-3">
          <p className="text-gray-600 text-xs uppercase tracking-widest">Dev Override Protocol</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => handleDemoLogin('student')}
              className="px-4 py-2 text-xs font-mono text-neon-blue border border-neon-blue/30 rounded-lg hover:bg-neon-blue/10 transition-colors"
            >
              [MOCK_STUDENT]
            </button>
            <button 
              onClick={() => handleDemoLogin('teacher')}
              className="px-4 py-2 text-xs font-mono text-neon-purple border border-neon-purple/30 rounded-lg hover:bg-neon-purple/10 transition-colors"
            >
              [MOCK_TEACHER]
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}