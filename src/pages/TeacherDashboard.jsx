import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // 🔌 Restored Auth Hook
import axiosClient from '../api/axiosClient';
import { TEACHER_ENDPOINTS } from '../api/endpoints';
import NotificationBell from '../components/common/NotificationBell'; // 🔔 Restored Bell

export default function TeacherDashboard() {
  // 👇 Connect to Auth Context for User Info & Logout
  const { user, logout } = useAuth();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Fetch Data on Load
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data } = await axiosClient.get(TEACHER_ENDPOINTS.GET_PENDING);
      setSubmissions(data.data || []);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Approve/Reject Logic
  const handleVerdict = async (status) => {
    if (!selectedItem) return;
    setActionLoading(true);

    try {
      await axiosClient.post(TEACHER_ENDPOINTS.VERIFY_SUBMISSION, {
        id: selectedItem._id,
        status: status,
        adminComment: status === 'APPROVED' ? 'Verified by Faculty' : 'Rejected: Document Invalid'
      });

      setSubmissions(prev => prev.filter(item => item._id !== selectedItem._id));
      setSelectedItem(null);
      alert(status === 'APPROVED' ? "✅ Submission Approved!" : "🚫 Submission Rejected.");
    } catch (error) {
      alert("Action Failed: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6 md:p-12 font-sans">
      
      {/* --- RESTORED HEADER --- */}
      <header className="flex justify-between items-end mb-12 animate-fade-in border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            COMMAND <span className="text-emerald-400">CONSOLE</span>
            {/* Live Counter Badge */}
            <span className="bg-gray-800 text-emerald-400 text-xs px-2 py-1 rounded-full border border-gray-700">
                {submissions.length} Pending
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Faculty Verification Portal</p>
        </div>

        {/* 👇 Standard Features Restored */}
        <div className="flex items-center gap-6">
          <NotificationBell />

          <div className="text-right hidden md:block">
            <span className="text-gray-500 text-xs uppercase tracking-widest block">Faculty ID</span>
            <span className="text-emerald-400 font-mono text-sm">{user?.name || "Admin"}</span>
          </div>

          <button 
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 hover:text-red-400 text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            End Session
          </button>
        </div>
      </header>

      {/* --- DATA TABLE --- */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-widest bg-gray-900/80">
              <th className="p-6">Student</th>
              <th className="p-6">Event Identity</th>
              <th className="p-6">Category</th>
              <th className="p-6">AI Verdict</th>
              <th className="p-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {loading ? (
              <tr><td colSpan="5" className="p-12 text-center text-gray-500 animate-pulse">Scanning Secure Vault...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan="5" className="p-12 text-center text-gray-500">All Clear. No pending submissions.</td></tr>
            ) : (
              submissions.map((item) => (
                <tr 
                  key={item._id} 
                  onClick={() => setSelectedItem(item)}
                  className="hover:bg-gray-800/40 transition-colors cursor-pointer group"
                >
                  <td className="p-6">
                    <div className="font-bold text-white">{item.studentName}</div>
                    <div className="text-xs text-gray-500">{item.studentId}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-gray-300">{item.eventName}</div>
                    <div className="text-xs text-cyan-500/80 mt-1">{item.eventDate}</div>
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded text-[10px] font-mono border uppercase ${
                      item.category === 'duty_leave' 
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      {item.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-6">
                    {/* Dynamic AI Verdict Display */}
                    {item.category === 'duty_leave' ? (
                        <div className="flex flex-col">
                            <span className="text-yellow-400 font-bold text-sm">
                                {item.timeRange || "Unknown"}
                            </span>
                            <span className="text-[10px] text-gray-500">Attendance Only</span>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-emerald-400 font-bold text-lg">+{item.predictedPoints} Pts</span>
                            <span className="text-[10px] text-gray-500">AI Confidence: High</span>
                        </div>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <button className="text-sm text-gray-500 group-hover:text-white transition-colors underline decoration-gray-700 underline-offset-4">
                      Inspect &gt;
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- INSPECTION MODAL --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden">
            
            {/* LEFT: EVIDENCE (IMAGE) */}
            <div className="w-1/2 bg-black flex items-center justify-center relative border-r border-gray-800">
              <img 
                src={`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/uploads/${selectedItem.fileName}`} 
                alt="Evidence" 
                className="max-w-full max-h-full object-contain p-4"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-gray-300 border border-gray-700">
                EVIDENCE_FILE.jpg
              </div>
            </div>

            {/* RIGHT: DATA & CONTROLS */}
            <div className="w-1/2 p-8 flex flex-col justify-between bg-gray-900">
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-white">Verification Protocol</h2>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    ✕ ESC
                  </button>
                </div>

                {/* AI WARNING BADGE */}
                {selectedItem.fraudAnalysis?.isSuspicious && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl mb-6 flex gap-3 items-start">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <h3 className="text-red-400 font-bold text-sm uppercase">AI Fraud Alert</h3>
                            <p className="text-red-300 text-xs mt-1">{selectedItem.fraudAnalysis.reason}</p>
                        </div>
                    </div>
                )}

                {/* DATA GRID */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">Student</label>
                        <p className="text-white font-medium text-lg">{selectedItem.studentName}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">Category</label>
                        <p className="text-cyan-400 font-mono capitalize">{selectedItem.category.replace('_', ' ')}</p>
                    </div>
                    
                    {/* DYNAMIC FIELD: POINTS vs TIME */}
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">
                            {selectedItem.category === 'duty_leave' ? 'Duration / Time' : 'Credit Points'}
                        </label>
                        <p className={`font-bold text-2xl ${
                            selectedItem.category === 'duty_leave' ? 'text-yellow-400' : 'text-emerald-400'
                        }`}>
                            {selectedItem.category === 'duty_leave' 
                                ? (selectedItem.timeRange || "Unknown")
                                : `+${selectedItem.predictedPoints}`
                            }
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase tracking-widest">Event Date</label>
                        <p className="text-white font-medium">{selectedItem.eventDate}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Event Identity</label>
                    <p className="text-gray-300 text-sm">{selectedItem.eventName}</p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button 
                  onClick={() => handleVerdict('REJECTED')}
                  disabled={actionLoading}
                  className="py-4 rounded-xl border border-red-500/30 text-red-400 font-bold hover:bg-red-500/10 hover:border-red-500 transition-all uppercase tracking-wider disabled:opacity-50"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleVerdict('APPROVED')}
                  disabled={actionLoading}
                  className="py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-wider transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Verify & Approve'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}