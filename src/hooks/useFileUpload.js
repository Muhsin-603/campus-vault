import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { STUDENT_ENDPOINTS } from '../api/endpoints';

export const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (selectedFile) => {
    setError(null);
    setSuccess(false);

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only JPEG, PNG, and PDF are allowed.');
      return false;
    }

    // 5MB Limit
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return false;
    }

    setFile(selectedFile);
    return true;
  };

  const uploadFile = async (category = 'certificate') => {
    if (!file) {
      setError('No file selected.');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      // ✅ FIX: Changed UPLOAD_CERTIFICATE to UPLOAD_FILE
      const response = await axiosClient.post(STUDENT_ENDPOINTS.UPLOAD_FILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      return response.data;
    } catch (err) {
      console.error("Upload Error:", err);
      setError(err.response?.data?.message || 'Upload failed.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
  };

  return {
    file,
    loading,
    error,
    success,
    handleFileSelect,
    uploadFile,
    clearFile
  };
};