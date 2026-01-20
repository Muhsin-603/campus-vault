import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFileUpload } from '../hooks/useFileUpload';
import axiosClient from '../api/axiosClient';
import { STUDENT_ENDPOINTS } from '../api/endpoints';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  
  // 1. We use the hook to manage the file state
  const { 
    file, 
    loading, 
    error: uploadError, 
    handleFileSelect, 
    uploadFile 
  } = useFileUpload();

  const [analysisResult, setAnalysisResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // 2. State for the new Category Selector
  const [category, setCategory] = useState('certificate');

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
      setAnalysisResult(null);
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) return;

    // We pass the category to our uploadFile function
    // Ensure your useFileUpload hook is updated to accept this 'category' argument
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
        category, // 3. Ensure category is sent to the final database record
        studentId: user.id
      });

      alert("✅ Certificate Securely Vaulted!");
      setAnalysisResult(null);
    } catch (error) {
      alert("❌ Submission Failed: " + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans text-gray-200 bg-gray-950">
      
      {/* --- HEADER --- */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-1">
            CAMPUS<span className="text-cyan-400">VAULT</span>
          </h1>
          <p className="text-gray-400 text-sm italic">Point Verification Protocol v2.0</p>
        </div>
        
        <div className="flex items-center gap-6">
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

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* --- LEFT: UPLOAD ZONE --- */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-cyan-500 rounded-full"></span>
            Initialize Upload
          </h2>

          {/* 👇 THE CATEGORY SELECTOR */}
          <div className="mb-6">
            <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Protocol Category</label>
            <select 
              value={category}
              onChange={handleCategoryChange}
              className="w-full bg-gray-950 border border-gray-800 text-cyan-300 rounded-lg p-3 focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
            >
              <option value="certificate">🏅 Merit/Participation Certificate</option>
              <option value="duty_leave">📝 Duty Leave Form</option>
              <option value="internship">💼 Internship Report</option>
              <option value="mooc">🎓 MOOC/Course Certificate</option>
              <option value="sports">🏃 Sports Certificate</option>
            </select>
          </div>
          
          <div className="relative group mb-6">
            <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
              file ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-800 hover:border-cyan-500 hover:bg-cyan-500/5'
            }`}>
              <input 
                type="file" 
                onChange={onFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                accept="image/*,application/pdf"
              />
              <div className="space-y-4">
                <div className="text-gray-500 group-hover:text-cyan-400 transition-colors">
                  {file ? '✅ File Locked' : '📥 Drop Certificate Here'}
                </div>
                {file && <p className="text-xs font-mono text-emerald-400 truncate">{file.name}</p>}
              </div>
            </div>
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || loading}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all ${
              !file || loading 
                ? 'bg-gray-800 text-gray-600' 
                : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20'
            }`}
          >
            {loading ? 'Analyzing Data Stream...' : 'Execute Analysis'}
          </button>
        </div>

        {/* --- RIGHT: ANALYSIS RESULT (Only shown after upload) --- */}
        <div className="space-y-6">
          {!analysisResult && !loading && (
            <div className="border border-gray-800 border-dashed rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center opacity-40">
              <p className="text-gray-500">Awaiting Analysis Result...</p>
            </div>
          )}

          {analysisResult && (
            <div className="bg-gray-900/80 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-2">Analysis Result</h2>
                <div className="flex gap-2">
                   <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono rounded border border-cyan-500/20 uppercase">
                     Category: {category}
                   </span>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Points</span>
                    <p className="text-3xl font-bold text-cyan-400">+{analysisResult.predictedPoints}</p>
                  </div>
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Date Found</span>
                    <p className="text-lg font-semibold">{analysisResult.eventDate}</p>
                  </div>
                </div>

                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Event Identity</span>
                  <p className="font-semibold text-gray-300">{analysisResult.eventName}</p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setAnalysisResult(null)}
                    className="flex-1 py-3 text-gray-500 hover:text-white transition-colors"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 transition-all"
                  >
                    {submitting ? 'Vaulting...' : 'Confirm & Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}