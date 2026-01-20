import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  
  // The AI's detective work
  eventName: { type: String, required: true },
  eventDate: { type: String, required: true },
  predictedPoints: { type: Number, required: true },
  
  // Fraud check details
  fraudAnalysis: {
    riskLevel: { type: String, enum: ['LOW', 'HIGH'], default: 'LOW' },
    reason: { type: String },
    isSuspicious: { type: Boolean, default: false }
  },

  // Status for the Teacher Dashboard
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  
  submittedAt: { type: Date, default: Date.now }
});

export const Submission = mongoose.model('Submission', submissionSchema);