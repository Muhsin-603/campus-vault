import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFileUpload } from '../hooks/useFileUpload';
import axiosClient from '../api/axiosClient';
import { STUDENT_ENDPOINTS } from '../api/endpoints';
// 👇 IMPORT 1: The Bell
import NotificationBell from '../components/common/NotificationBell';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const { 
    file, 
    loading, 
    error: uploadError, 
    handleFileSelect, 
    uploadFile, 
    clearFile 
  } = useFileUpload();

  const [analysisResult, setAnalysisResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // 👇 STATE 2: The Category
  const [category, setCategory] = useState('certificate');

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
      setAnalysisResult(null);
    }
  };

  const handleUpload = async () => {
    // 👇 LOGIC 3: Pass category to the hook
    const response = await uploadFile(category);
    if (response && response.success) {
      setAnalysisResult(response.data);
    }
  };

  const handleConfirm = async () => {
    if (!analysisResult) return;
    setSubmitting(true);
    
    try {
      await axiosClient.post(STUDENT_ENDPOINTS.SUBMIT_CERTIFICATE, {
        ...analysisResult,
        category, // 👇 LOGIC 4: Save category to DB
        studentId: user.id 
      });

      alert("✅ Certificate Submitted Successfully!");
      setAnalysisResult(null); 
      if(clearFile) clearFile(); 
    } catch (error) {
      alert("❌ Submission Failed: " + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans text-gray-200 bg-gray-950">
      
      {/* --- HEADER --- */}
      <header className="flex justify-between items-center mb-12 animate-fade-in">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">
            CAMPUS<span className="text-cyan-400">VAULT</span>
          </h1>
          <p className="text-gray-400 text-sm">Secure Point Verification Protocol</p>
        </div>
        
        <div className="flex items-center gap-6">
          {/* 👇 UI 1: The Notification Bell */}
          <NotificationBell />

          <div className="text-right hidden md:block">
            <span className="text-gray-500 text-xs uppercase tracking-widest block">Operator</span>
            <span className="text-cyan-400 font-mono text-sm">{user?.name}</span>
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-sm transition-colors"
          >
            Disconnect
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* --- LEFT: UPLOAD ZONE --- */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
            Initialize Upload
          </h2>
          
          {/* 👇 UI 2: Category Selector */}
          <div className="mb-6">
            <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Protocol Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 text-cyan-300 rounded-lg p-3 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="certificate">🏅 Merit/Participation Certificate</option>
              <option value="duty_leave">📝 Duty Leave Form</option>
              <option value="internship">💼 Internship Report</option>
              <option value="mooc">🎓 MOOC/Course Certificate</option>
              <option value="sports">🏃 Sports Certificate</option>
            </select>
          </div>

          <div className="relative group mb-6">
            <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
              file ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-800 hover:border-cyan-500 hover:bg-cyan-500/5'
            }`}>
              <input 
                type="file" 
                onChange={onFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept="image/*,application/pdf"
              />
              
              <div className="space-y-4 pointer-events-none">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${
                  file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-900 text-gray-400 group-hover:text-cyan-400 group-hover:scale-110'
                }`}>
                  {file ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  )}
                </div>
                <div>
                  {file ? (
                    <p className="font-mono text-emerald-400 truncate max-w-xs mx-auto">{file.name}</p>
                  ) : (
                    <p className="text-gray-400">Drag file or <span className="text-cyan-400 font-bold">Initialize Upload</span></p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center font-mono">
              [ERROR]: {uploadError}
            </div>
          )}

          {/* Action Button */}
          <button 
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider transition-all ${
              !file || loading 
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20'
            }`}
          >
            {loading ? 'Analyzing Data Stream...' : 'Execute Analysis'}
          </button>
        </div>

        {/* --- RIGHT: ANALYSIS TERMINAL --- */}
        <div className="space-y-6">
          
          {/* Idle State */}
          {!analysisResult && !loading && (
            <div className="border border-gray-800 border-dashed rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-800">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-500">Awaiting Data Stream</h3>
              <p className="text-gray-600 text-sm mt-2">Gemini AI is ready for input...</p>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
             <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 animate-pulse">
               <div className="h-6 bg-gray-800 rounded w-1/3 mb-6"></div>
               <div className="space-y-4">
                 <div className="h-4 bg-gray-800/50 rounded w-full"></div>
                 <div className="h-4 bg-gray-800/50 rounded w-5/6"></div>
                 <div className="h-4 bg-gray-800/50 rounded w-4/6"></div>
               </div>
               <div className="mt-8 h-32 bg-gray-950 rounded border border-gray-800"></div>
             </div>
          )}

          {/* --- THE RESULT CARD --- */}
          {analysisResult && (
            <div className="bg-gray-900/80 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
              <div className="p-8 border-b border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold text-white">Analysis Complete</h2>
                  {/* FRAUD BADGE */}
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-2 uppercase tracking-wide ${
                    analysisResult.fraudAnalysis?.riskLevel === 'HIGH' 
                      ? 'bg-red-500/10 text-red-400 border-red-500/50' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50'
                  }`}>
                    RISK: {analysisResult.fraudAnalysis?.riskLevel}
                  </div>
                </div>
                <div className="flex gap-2">
                   <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono rounded border border-cyan-500/20 uppercase">
                     Category: {category}
                   </span>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Points</span>
                    <p className="text-3xl font-bold text-cyan-400">+{analysisResult.predictedPoints}</p>
                  </div>
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Event Date</span>
                    <p className="text-lg font-semibold text-white mt-2">{analysisResult.eventDate}</p>
                  </div>
                </div>

                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 mb-6">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Event Identity</span>
                  <p className="font-semibold text-gray-200 mt-1">{analysisResult.eventName}</p>
                </div>

                {/* Fraud Warning */}
                {analysisResult.fraudAnalysis?.isSuspicious && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
                    <p className="text-red-400 text-sm">
                      <strong className="block mb-1 text-red-300">⚠️ Flagged by Gemini:</strong> 
                      {analysisResult.fraudAnalysis.reason}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3">
                   <button 
                     onClick={() => setAnalysisResult(null)}
                     className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                   >
                     Discard
                   </button>
                   <button 
                     onClick={handleConfirm} 
                     disabled={submitting}
                     className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {submitting ? 'Vaulting...' : 'Confirm & Submit'}
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}