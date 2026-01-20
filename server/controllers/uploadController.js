import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from 'fs';
const libPackage = JSON.parse(fs.readFileSync('./node_modules/@google/generative-ai/package.json', 'utf8'));
console.log("⚠️ ACTUAL INSTALLED VERSION:", libPackage.version);

// Ensure env vars are loaded
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to format image for Gemini
function fileToGenerativePart(file) {
  return {
    inlineData: {
      data: file.buffer.toString("base64"),
      mimeType: file.mimetype,
    },
  };
}

export const analyzeCertificate = async (req, res) => {
  console.log("--- 🏁 START ANALYSIS ---");
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in .env");
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    console.log(`📸 Processing: ${req.file.originalname}`);

    // Use the CORRECT model name
    // Switching to the available 2.0 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Analyze this academic certificate/document.
      Extract these details strictly as JSON:
      {
        "studentName": "Name of the student",
        "eventName": "Name of event/workshop",
        "eventDate": "Date in DD/MM/YYYY format",
        "predictedPoints": "Number between 10-50 based on value",
        "fraudAnalysis": {
          "riskLevel": "LOW or HIGH",
          "reason": "Brief reason for risk level",
          "isSuspicious": boolean
        }
      }
      RETURN ONLY JSON. NO MARKDOWN.
    `;

    console.log("🚀 Sending to Gemini 1.5 Flash...");
    
    const imagePart = fileToGenerativePart(req.file);
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log("🤖 Gemini Answered!");

    // Clean up the response (Gemini loves adding ```json ... ```)
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(cleanedText);

    console.log("✅ Analysis Success:", data.predictedPoints, "Points");
    res.status(200).json({ success: true, data: data });

  } catch (error) {
    console.error("💥 CRASH REPORT:", error.message);
    res.status(500).json({ 
      message: "AI Analysis Failed", 
      error: error.message,
      details: "Check Server Logs" 
    });
  }
};