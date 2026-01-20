import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFileUpload } from '../hooks/useFileUpload'
import axiosClient from '../api/axiosClient'
import { STUDENT_ENDPOINTS } from '../api/endpoints'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const { 
    file, 
    loading, 
    error: uploadError, 
    handleFileSelect, 
    uploadFile, 
    clearFile 
  } = useFileUpload()

  // State to store Gemini's Brain Dump
  const [analysisResult, setAnalysisResult] = useState(null)

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
      setAnalysisResult(null) // Reset previous results
    }
  }

  const handleUpload = async () => {
    const response = await uploadFile()
    
    // In our backend, we send { success: true, data: { ... } }
    // The hook returns response.data, so we need response.data.data
    if (response && response.success) {
      setAnalysisResult(response.data)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* --- HEADER --- */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🚀 CampusVault</h1>
          <p className="text-gray-500">Welcome, {user?.name}</p>
        </div>
        <button 
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow transition"
        >
          Logout
        </button>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- LEFT: UPLOAD ZONE --- */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-700">📤 Upload Certificate</h2>
          
          <div className="border-2 border-dashed border-indigo-200 rounded-lg p-8 text-center hover:bg-indigo-50 transition cursor-pointer relative">
            <input 
              type="file" 
              onChange={onFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*,application/pdf"
            />
            {file ? (
              <div className="text-indigo-600 font-semibold">
                📄 {file.name}
                <br/>
                <span className="text-sm text-gray-400">Click to change</span>
              </div>
            ) : (
              <div className="text-gray-400">
                Drag & drop or <span className="text-indigo-500 font-bold">click to browse</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              ⚠️ {uploadError}
            </div>
          )}

          {/* Action Button */}
          <button 
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full mt-6 py-3 rounded-lg font-bold text-white transition-all transform ${
              !file || loading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-md'
            }`}
          >
            {loading ? '🔮 Gemini is analyzing...' : 'Analyze with AI'}
          </button>
        </div>

        {/* --- RIGHT: GEMINI RESULTS --- */}
        <div className="space-y-6">
          
          {/* Default State: Stats */}
          {!analysisResult && !loading && (
            <div className="bg-white p-6 rounded-xl shadow border border-gray-100 opacity-50">
              <h3 className="text-lg font-semibold text-gray-400 text-center">
                Waiting for analysis...
              </h3>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
             <div className="bg-white p-6 rounded-xl shadow animate-pulse">
               <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
               <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
               <div className="h-32 bg-gray-100 rounded"></div>
             </div>
          )}

          {/* --- THE REVEAL --- */}
          {analysisResult && (
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-indigo-500 animate-fade-in-up">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">💎 AI Analysis</h2>
                
                {/* FRAUD BADGE */}
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  analysisResult.fraudAnalysis?.riskLevel === 'HIGH' 
                    ? 'bg-red-100 text-red-600 border-red-200' 
                    : 'bg-green-100 text-green-600 border-green-200'
                }`}>
                  RISK: {analysisResult.fraudAnalysis?.riskLevel}
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-bold text-gray-400 uppercase">Event Name</span>
                  <p className="font-semibold text-gray-800">{analysisResult.eventName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs font-bold text-gray-400 uppercase">Points</span>
                    <p className="text-2xl font-bold text-indigo-600">+{analysisResult.predictedPoints}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs font-bold text-gray-400 uppercase">Date</span>
                    <p className="font-semibold text-gray-800">{analysisResult.eventDate}</p>
                  </div>
                </div>

                {/* Fraud Reason (If any) */}
                {analysisResult.fraudAnalysis?.isSuspicious && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                    <strong>Warning:</strong> {analysisResult.fraudAnalysis.reason}
                  </div>
                )}
                
                <div className="mt-4 flex gap-2">
                   <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-semibold transition">
                     Reject
                   </button>
                   <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold shadow transition">
                     Confirm & Submit
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