import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(file) {
  return {
    inlineData: {
      data: file.buffer.toString("base64"),
      mimeType: file.mimetype,
    },
  };
}

// 📜 THE OFFICIAL KTU RULEBOOK
const KTU_RULES = `
OFFICIAL KTU ACTIVITY POINT REGULATIONS (Reference: B.Tech 2019/2024 Scheme):

1. **NATIONAL INITIATIVES (NCC/NSS)**
   - NSS/NCC Participation (2 years): 60 Points (Max)
   - "C" Certificate/Outstanding Performance: +20 Points (Max 80)

2. **SPORTS & GAMES**
   - Participation (College Level): 8 Points
   - Participation (Zonal/State): 15 Points
   - Participation (University): 25 Points
   - Participation (National): 40 Points
   - Participation (International): 60 Points
   - *Winner (1st/2nd/3rd)*: Add +10/8/5 Points extra.

3. **PROFESSIONAL INITIATIVES (Tech Fests/Workshops)**
   - Tech Fest/Quiz Participation (College): 10 Points
   - Tech Fest/Quiz (Zonal): 20 Points
   - Tech Fest/Quiz (National/IIT/NIT): 40 Points
   - MOOC Course (with Certificate): 50 Points
   - Workshop/Seminar/STTP (at IIT/NIT): 20 Points
   - Workshop/Seminar (at KTU affiliated colleges): 12 Points
   - Paper Presentation (IIT/NIT): 30 Points
   - Paper Presentation (KTU Colleges): 16 Points

4. **INDUSTRY INTERACTION**
   - Internship (Min 5 full days): 20 Points
   - Industrial Visit (IV): 5 Points (Max 10 points total allowed)

5. **ENTREPRENEURSHIP**
   - Registered Startup: 60 Points
   - Patent Filed: 30 Points | Published: 35 Points | Approved: 50 Points

6. **LEADERSHIP**
   - Core Coordinator (Student Societies/Fests): 15 Points
   - Chairman (Student Union): 30 Points | Secretary: 25 Points

⚠️ **FRAUD DETECTION PROTOCOL:**
- If the image is NOT a valid certificate (e.g., selfie, blurry, food, random screenshot), RETURN "predictedPoints": 0 and "isSuspicious": true.
- If the certificate looks fake (edited text, mismatched fonts), FLAG AS HIGH RISK.
`;

export const analyzeCertificate = async (req, res) => {
  console.log("--- 🏁 START ANALYSIS (KTU PROTOCOL) ---");
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in .env");
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    console.log(`📸 Processing: ${req.file.originalname}`);
    const category = req.body.category || "General Certificate"; 
    console.log(`🎬 Scene Context: ${category}`);

   // 👇 The Evergreen "Flash" model (Best for speed & free tier limits)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    let categoryInstruction = "";
    
    // 👇 Context Logic
    if (category === "duty_leave") {
        context = `
        CONTEXT: This is a DUTY LEAVE REQUEST.
        TASK:
        1. VERIFY SIGNATURE: Look for a Principal's or Faculty Advisor's signature/seal. If missing, flag as SUSPICIOUS.
        2. VERIFY DETAILS: Ensure Student Name, Event Name, and Dates are clearly visible.
        3. POINTS: ALWAYS return 0 (Zero). This is for attendance only.
        4. REASON: If valid, set reason to "Verified: Signed by Authority". If invalid, "Rejected: Missing Signature/Details".
        `;
    } else if (category === "internship") {
        categoryInstruction = `
        CONTEXT: This is an INTERNSHIP REPORT/CERTIFICATE.
        FOCUS: Look for duration (Min 5 days required).
        POINTS: If duration >= 5 days, grant 20 Points. Otherwise, 0.
        `;
    } else {
        categoryInstruction = `
        CONTEXT: This is a STANDARD ACTIVITY CERTIFICATE.
        FOCUS: Event Name, Level (National/Zone), and Achievement (Winner/Participant).
        `;
    }

    const prompt = `
      Analyze this image against the following KTU Rules:
      ${KTU_RULES}

      Specific Instructions for this Category (${category}):
      ${categoryInstruction}

      Task:
      1. Identify the Activity Type.
      2. Extract Student Name, Event Name, and Event Date.
      3. Assign points STRICTLY based on the rulebook (or 0 if Duty Leave).
      4. Check for fraud/suspicious documents.

      Return ONLY JSON in this format:
      {
        "studentName": "Name of student",
        "eventName": "Name of event",
        "eventDate": "DD/MM/YYYY",
        "category": "${category}",
        "predictedPoints": Number,
        "fraudAnalysis": {
          "riskLevel": "LOW" or "HIGH",
          "reason": "Why did you assign these points?",
          "isSuspicious": boolean
        }
      }
    `;

    console.log("🚀 Sending to Gemini...");
    
    const imagePart = fileToGenerativePart(req.file);
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log("🤖 Gemini Answered!");

    // 🛡️ JSON PARSE SAFETY NET
    let data;
    try {
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        data = JSON.parse(cleanedText);
    } catch (parseError) {
        console.error("⚠️ AI JSON Parse Error. Raw text:", text);
        throw new Error("AI returned invalid data format.");
    }

    // Safety Lock for Duty Leave
    if (category === "duty_leave") {
        data.predictedPoints = 0;
        data.fraudAnalysis.reason = "Duty Leave Request - Attendance Only (0 Points)";
    }

    // Bouncer Logic
    if (data.fraudAnalysis.isSuspicious) {
        data.predictedPoints = 0;
        console.log("🚫 BLOCKED: Document flagged as suspicious.");
    }

    console.log(`✅ Verdict: ${data.predictedPoints} Points for ${data.eventName}`);
    res.status(200).json({ success: true, data: data });

  } catch (error) {
    console.error("💥 CRASH REPORT:", error.message);
    res.status(500).json({ 
      message: "AI Analysis Failed", 
      error: error.message 
    });
  }
};