// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh'
}

// Student endpoints
export const STUDENT_ENDPOINTS = {
  GET_DASHBOARD: '/student/dashboard',
  UPLOAD_FILE: '/student/upload',
  GET_FILES: '/student/files',
  GET_FILE: '/student/files/:id'
}

// Teacher endpoints
export const TEACHER_ENDPOINTS = {
  GET_DASHBOARD: '/teacher/dashboard',
  GET_SUBMISSIONS: '/teacher/submissions',
  APPROVE_SUBMISSION: '/teacher/submissions/:id/approve',
  REJECT_SUBMISSION: '/teacher/submissions/:id/reject',
  GET_FRAUD_ALERTS: '/teacher/fraud-alerts'
}

// User endpoints
export const USER_ENDPOINTS = {
  GET_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/password'
}
