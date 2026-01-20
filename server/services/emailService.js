import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const data = await resend.emails.send({
      from: 'Campus Vault <onboarding@resend.dev>', // Use this default for testing
      to: [to], // In free tier, this MUST be your verified email address!
      subject: subject,
      html: htmlContent,
    });
    console.log("📧 Email Sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Email Failed:", error);
    return { success: false, error };
  }
};

// Templates for our emails
export const emailTemplates = {
  submissionReceived: (studentName, eventName, points, fraudStatus) => `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1>🎓 Upload Received</h1>
      <p>Hi <strong>${studentName}</strong>,</p>
      <p>We received your certificate for <strong>${eventName}</strong>.</p>
      
      <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
        <h3>🤖 Gemini Analysis Report:</h3>
        <ul>
          <li><strong>Projected Points:</strong> ${points}</li>
          <li><strong>Fraud Risk:</strong> ${fraudStatus}</li>
        </ul>
      </div>
      <p>A teacher will review this shortly.</p>
    </div>
  `,
  
  teacherAlert: (studentName, eventName) => `
    <h1>🔔 New Submission Alert</h1>
    <p>Student <strong>${studentName}</strong> has uploaded a certificate for <strong>${eventName}</strong>.</p>
    <p>Please log in to the Teacher Console to review.</p>
  `
};