import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileToGenerativePart } from '../utils/imageParser.js';

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeCertificate = async (req, res) => {
  try {
    // 1. Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "No certificate image provided." });
    }

    // 2. Prepare the image for Gemini
    const imagePart = fileToGenerativePart(req.file);

    // 3. The "Forensic" Prompt
    // We ask for strict JSON to avoid parsing headaches
    const prompt = `
      You are an expert Academic Auditor for KTU (University). 
      Analyze this image of a student certificate.
      
      Extract the following details and perform a fraud check.
      
      1. **Event Details**: Name of event, Date, conducting authority.
      2. **Points Calculation**: Estimate KTU Activity Points based on standard rules (e.g., Workshop=10-20, Internship=20+, Sports=10).
      3. **Fraud Detection**: Look for pixelation, mismatched fonts, or signs of digital editing on dates/names.

      Return the result as a strictly valid JSON object. Do not add markdown formatting like \`\`\`json.
      
      JSON Structure:
      {
        "studentName": "String or null",
        "eventName": "String",
        "eventDate": "String (DD/MM/YYYY)",
        "issuingAuthority": "String",
        "predictedPoints": Integer,
        "confidenceScore": Float (0.0 to 1.0),
        "fraudAnalysis": {
          "isSuspicious": Boolean,
          "riskLevel": "LOW" | "MEDIUM" | "HIGH",
          "reason": "String explaining the risk"
        }
      }
    `;

    // 4. Call Gemini
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // 5. Clean and Parse JSON
    // Sometimes Gemini wraps JSON in backticks, so we clean it.
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanedText);

    // 6. Send back to Frontend
    res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ 
      message: "AI Analysis failed", 
      error: error.message 
    });
  }
};