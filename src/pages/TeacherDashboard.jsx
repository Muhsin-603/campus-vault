import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { TEACHER_ENDPOINTS } from '../api/endpoints';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import NotificationBell from '../components/common/NotificationBell';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Submissions on Load
  const fetchSubmissions = async () => {
    try {
      const response = await axiosClient.get(TEACHER_ENDPOINTS.GET_SUBMISSIONS);
      setSubmissions(response.data);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Action Handlers
  const handleAction = async (id, action) => {
    try {
      const endpoint = action === 'approve'
        ? TEACHER_ENDPOINTS.APPROVE_SUBMISSION
        : TEACHER_ENDPOINTS.REJECT_SUBMISSION;

      await axiosClient.post(endpoint.replace(':id', id));
      fetchSubmissions(); // Refresh the list
    } catch (err) {
      alert(`Failed to ${action} submission.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 font-sans text-gray-200">

      {/* Header */}
      <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            TEACHER <span className="text-cyan-400">CONSOLE</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Authorized Personnel: {user?.name}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm transition-colors"
        >

          End Session
        </button>
        <div className="flex items-center gap-6">

          {/* 👇 ADD THIS LINE RIGHT HERE! */}
          <NotificationBell />

          <div className="text-right hidden md:block">
            <p className="text-gray-500 text-xs uppercase tracking-widest">Operator</p>
            <p className="text-cyan-400 font-mono text-sm">{user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-sm transition-all"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20 text-cyan-500 animate-pulse">
            Loading Secure Data...
          </div>
        ) : (
          <div className="grid gap-4">
            {submissions.map((sub) => (
              <div
                key={sub._id}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between hover:border-cyan-500/30 transition-all shadow-lg"
              >
                {/* Left: Student Info */}
                <div className="flex-1 min-w-0 mb-4 md:mb-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white truncate">{sub.studentName}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-800 text-gray-400 border border-gray-700 uppercase">
                      {sub.category || 'Certificate'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{sub.eventName}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-mono">
                    <span>📅 {sub.eventDate}</span>
                    <span className="text-cyan-400 font-bold">+{sub.predictedPoints} PTS</span>
                  </div>
                </div>

                {/* Center: Fraud Analysis */}
                <div className="flex-1 px-4 mb-4 md:mb-0">
                  {sub.fraudAnalysis?.isSuspicious ? (
                    <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      <span>WARNING: {sub.fraudAnalysis.reason}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-500 text-xs opacity-60">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>AI Verification Passed</span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                  {sub.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleAction(sub._id, 'reject')}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircleIcon className="w-8 h-8" />
                      </button>
                      <button
                        onClick={() => handleAction(sub._id, 'approve')}
                        className="p-2 text-cyan-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircleIcon className="w-8 h-8" />
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${sub.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                      {sub.status}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {submissions.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                No pending submissions in the vault.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}