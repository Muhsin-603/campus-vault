import dotenv from "dotenv";

// Load your .env file
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ ERROR: No GEMINI_API_KEY found in .env file.");
  process.exit(1);
}

async function listAllModels() {
  console.log("🔍 Contacting Google HQ for the full model list...\n");

  try {
    // We hit the API directly to get the raw list
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ ACCESS GRANTED. Found ${data.models.length} available models:\n`);
    
    // Print them cleanly
    data.models.forEach(model => {
      // We filter for "generateContent" models (the ones that write text/chat)
      const isChatModel = model.supportedGenerationMethods.includes("generateContent");
      const icon = isChatModel ? "💬" : "🔢"; // Chat vs Embedding
      
      console.log(`${icon} Name: \x1b[36m${model.name.replace('models/', '')}\x1b[0m`);
      console.log(`   Desc: ${model.displayName}`);
      console.log(`   Limit: ${model.inputTokenLimit} tokens`);
      console.log("---------------------------------------------------");
    });

  } catch (error) {
    console.error("💥 FAILED:", error.message);
  }
}

listAllModels();