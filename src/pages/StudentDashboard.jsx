import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFileUpload } from '../hooks/useFileUpload'
import axiosClient from '../api/axiosClient' // Uncomment when backend is ready
import { STUDENT_ENDPOINTS } from '../api/endpoints'


export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const { 
    file, 
    loading, 
    error: uploadError, 
    handleFileSelect, 
    uploadFile, 
    // clearFile 
  } = useFileUpload()

  const [analysisResult, setAnalysisResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
      setAnalysisResult(null)
    }
  }

  const handleUpload = async () => {
    const response = await uploadFile()
    if (response && response.success) {
      setAnalysisResult(response.data)
    }
  }
  const handleConfirm = async () => {
    if (!analysisResult) return;
    setSubmitting(true);
    
    try {
      // Send the AI data to the backend to be saved
      await axiosClient.post(STUDENT_ENDPOINTS.SUBMIT_CERTIFICATE, {
        ...analysisResult,
        studentId: user.id // Attach who is submitting
      });

      alert("✅ Certificate Submitted Successfully!");
      setAnalysisResult(null); // Clear the form
      // clearFile(); // Optional: Clear the file input
    } catch (error) {
      alert("❌ Submission Failed: " + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans text-gray-200">
      
      {/* --- HEADER --- */}
      <header className="flex justify-between items-center mb-12 animate-fade-in">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">
            CAMPUS<span className="text-neon-blue">VAULT</span>
          </h1>
          <p className="text-gray-400 text-sm">Secure Point Verification Protocol</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-gray-400 text-sm">User: <span className="text-neon-purple font-mono">{user?.name}</span></span>
          <button 
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-vault-700 hover:bg-vault-800 text-sm transition-colors"
          >
            Disconnect
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* --- LEFT: UPLOAD ZONE --- */}
        <div className="glass-card rounded-2xl p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-neon-blue rounded-full"></span>
            Upload Certificate
          </h2>
          
          <div className="relative group">
            <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
              file ? 'border-neon-green bg-neon-green/5' : 'border-vault-700 hover:border-neon-blue hover:bg-vault-700/30'
            }`}>
              <input 
                type="file" 
                onChange={onFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept="image/*,application/pdf"
              />
              
              <div className="space-y-4 pointer-events-none">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${
                  file ? 'bg-neon-green/20 text-neon-green' : 'bg-vault-900 text-gray-400 group-hover:text-neon-blue group-hover:scale-110'
                }`}>
                  {file ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  )}
                </div>
                <div>
                  {file ? (
                    <p className="font-mono text-neon-green truncate max-w-xs mx-auto">{file.name}</p>
                  ) : (
                    <p className="text-gray-400">Drag file or <span className="text-neon-blue font-bold">Initialize Upload</span></p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center font-mono">
              [ERROR]: {uploadError}
            </div>
          )}

          {/* Action Button */}
          <button 
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full mt-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-all ${
              !file || loading 
                ? 'bg-vault-700 text-gray-500 cursor-not-allowed' 
                : 'btn-primary'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                Processing...
              </span>
            ) : 'Run Analysis Protocol'}
          </button>
        </div>

        {/* --- RIGHT: ANALYSIS TERMINAL --- */}
        <div className="space-y-6">
          
          {/* Idle State */}
          {!analysisResult && !loading && (
            <div className="glass-card rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center opacity-60 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-vault-900 rounded-full flex items-center justify-center mb-4 border border-vault-700">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-300">Awaiting Data Stream</h3>
              <p className="text-gray-500 text-sm mt-2">Gemini AI is ready for input...</p>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
             <div className="glass-card rounded-2xl p-8 animate-pulse-glow">
               <div className="h-6 bg-vault-700 rounded w-1/3 mb-6"></div>
               <div className="space-y-4">
                 <div className="h-4 bg-vault-700/50 rounded w-full"></div>
                 <div className="h-4 bg-vault-700/50 rounded w-5/6"></div>
                 <div className="h-4 bg-vault-700/50 rounded w-4/6"></div>
               </div>
               <div className="mt-8 h-32 bg-vault-900/50 rounded border border-vault-700"></div>
             </div>
          )}

          {/* --- THE RESULT CARD --- */}
          {analysisResult && (
            <div className="glass-card rounded-2xl p-0 overflow-hidden animate-slide-up border-t-4 border-neon-blue">
              <div className="p-8 bg-gradient-to-b from-neon-blue/10 to-transparent">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Analysis Complete</h2>
                    <p className="text-neon-blue text-xs font-mono mt-1">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                  </div>
                  
                  {/* FRAUD BADGE */}
                  <div className={`px-4 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${
                    analysisResult.fraudAnalysis?.riskLevel === 'HIGH' 
                      ? 'bg-red-500/10 text-red-400 border-red-500/50' 
                      : 'bg-green-500/10 text-green-400 border-green-500/50'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      analysisResult.fraudAnalysis?.riskLevel === 'HIGH' ? 'bg-red-500' : 'bg-green-500'
                    }`}></span>
                    RISK: {analysisResult.fraudAnalysis?.riskLevel}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-vault-900/80 p-4 rounded-xl border border-vault-700">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Points Awarded</span>
                    <p className="text-3xl font-bold text-neon-blue mt-1">+{analysisResult.predictedPoints}</p>
                  </div>
                  <div className="bg-vault-900/80 p-4 rounded-xl border border-vault-700">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Event Date</span>
                    <p className="text-lg font-semibold text-white mt-2">{analysisResult.eventDate}</p>
                  </div>
                </div>

                <div className="bg-vault-900/50 p-4 rounded-xl border border-vault-700 mb-6">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Event Name</span>
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
                   <button className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-vault-700 transition-colors">
                     Reject
                   </button>
                   <button 
                 onClick={handleConfirm} 
                 disabled={submitting}
                 className="flex-1 bg-neon-green text-vault-900 py-3 rounded-xl font-bold hover:bg-emerald-400 shadow-lg shadow-neon-green/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {submitting ? 'Submitting...' : 'Confirm & Submit'}
               
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