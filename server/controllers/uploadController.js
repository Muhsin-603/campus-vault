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
    let strictContext = "";
    console.log(`📸 Processing: ${req.file.originalname}`);
    const category = req.body.category || "General Certificate"; 
    console.log(`🎬 Scene Context: ${category}`);

   // 👇 The Evergreen "Flash" model (Best for speed & free tier limits)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    
    
    // 👇 Context Logic
    if (category === "duty_leave") {
        strictContext = `
        MODE: DUTY LEAVE VERIFICATION
        ⚠️ CRITICAL CHECKS:
        1. MUST contain keywords: "Duty Leave", "On Duty", "O.D.", "Attendance".
        2. MUST have a SIGNATURE/SEAL.
        3. 🕵️‍♀️ TIME HUNT:
           - Scan for "Period" (e.g., "P 4-6", "Period 5"). Assume 1 Period = 1 Hr.
           - Scan for "Hour" (e.g., "2 Hrs", "3 Hours").
           - Scan for Times (e.g., "10 am to 1 pm").
           - IF FOUND: Put it in 'timeRange'.
           - IF IMPLICIT (e.g., "Full Day"): Put "Full Day".
        LOGIC:
        - FORCE 0 POINTS.
        - Verified Signature -> Status: "VERIFIED".
        `;
    } else if (category === "internship") {
        strictContext = `
        MODE: INTERNSHIP AUDIT
        ⚠️ CRITICAL CHECKS:
        1. MUST contain keywords: "Internship", "Completed", "Training", "Industrial Visit".
        2. MUST show DURATION (Start Date AND End Date, or "X Days/Weeks").
        3. IGNORE logos, ID cards, or screenshots of emails.
        LOGIC:
        - If "Industrial Visit" or "IV" -> 5 Points.
        - If "Internship" AND Duration >= 5 Days -> 20 Points.
        - If Duration < 5 Days -> 0 Points (Reason: Duration too short).
        - If NO dates found -> 0 Points (Reason: Invalid Internship Proof).
        `;
    }
    else if(category === "mooc"){
      strictContext = `
        MODE: MOOC / COURSE AUDIT
        ⚠️ CRITICAL CHECKS:
        1. Platform Names: "NPTEL", "Coursera", "Udemy", "EdX", "Infosys Springboard".
        2. Keywords: "Certificate of Completion", "Successfully Completed".
        LOGIC:
        - If valid certificate -> 50 Points.
        - If just a screenshot of a dashboard/progress bar -> 0 Points (Reason: Not a Certificate).
        `;
    }
    else if (category === "sports") {
        strictContext = `
        MODE: SPORTS AUDIT
        ⚠️ CRITICAL CHECKS:
        1. Keywords: "First Place", "Runner up", "Participation", "Meet", "Tournament".
        2. Level: Identify if College, Zonal, or National.
        LOGIC:
        - Assign points based on Level + Achievement.
        - Reject generic gym selfies or jersey photos.
        `;

    } else {
        strictContext = `
        MODE: GENERAL CERTIFICATE AUDIT
        ⚠️ CRITICAL CHECKS:
        1. Keywords: "Certificate of Appreciation", "Merit", "Participation".
        2. Reject generic images, logos, or blurry photos.
        `;
    }

    const prompt = `
      You are a strict Forensic Document Auditor. 
      Your job is to reject invalid files (logos, selfies, screenshots) and rate valid ones.
      Also verify the KTU RULES:
      ${KTU_RULES}

      CURRENT CATEGORY: ${category.toUpperCase()}
      ${strictContext}

      TASK:
      1. IS_DOCUMENT_VALID? (Boolean): Check if this is a real document. 
         - If it's just a logo, cartoon, selfie, or random object -> FALSE.
         - If text is unreadable -> FALSE.
      2. EXTRACT DETAILS: Student Name, Event, Dates.
      3. CALCULATE POINTS: Apply the rules above strictly.

      OUTPUT JSON ONLY:
      {
        "studentName": "String (or 'Unknown')",
        "eventName": "String (or 'Unknown')",
        "eventDate": "String (or 'Unknown')",
        "predictedPoints": Number,
        "fraudAnalysis": { 
            "riskLevel": "LOW" or "HIGH", 
            "isSuspicious": Boolean,
            "reason": "Clear explanation (e.g., 'Rejected: Image is just a logo', 'Verified: 5-Day Internship')" 
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
      // Find the first '{' and the last '}'
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
          throw new Error("No JSON object found in AI response");
      }

      // Parse ONLY the matched part
      data = JSON.parse(jsonMatch[0]);

    } catch (e) {
      console.error("⚠️ JSON Parse Failed. AI Text:", text);
      return res.status(500).json({ message: "AI Analysis Failed (Invalid Format)" });
    }

    // Safety Lock for Duty Leave
    if (category === "duty_leave") {
        data.predictedPoints = 0;
        if (!data.fraudAnalysis.isSuspicious) {
            data.fraudAnalysis.reason = "Attendance Verified (Signature Found)";
        }

        // 1. Clean up existing timeRange
        if (data.timeRange && data.timeRange !== "null" && data.timeRange !== "Unknown") {
             data.timeRange = data.timeRange.trim();
        } 
        
        // 2. RESCUE MISSION: If Unknown, check the "Reason" text for clues
        if (!data.timeRange || data.timeRange === "Unknown" || data.timeRange === "null") {
            const reasonText = JSON.stringify(data.fraudAnalysis.reason || "") + JSON.stringify(text);
            
            // Regex to find "X Hrs" or "Period X-Y" inside the AI's explanation
            const hoursMatch = reasonText.match(/(\d+)\s*Hrs/i);
            const periodMatch = reasonText.match(/Period\s*(\d+)/i);
            const fullDayMatch = reasonText.match(/Full\s*Day/i);

            if (hoursMatch) {
                data.timeRange = `${hoursMatch[1]} Hours (Rescued)`;
            } else if (periodMatch) {
                data.timeRange = `Period ${periodMatch[1]} (Rescued)`;
            } else if (fullDayMatch) {
                data.timeRange = "Full Day";
            } else {
                data.timeRange = "Unknown"; // Truly gave up
            }
        }
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