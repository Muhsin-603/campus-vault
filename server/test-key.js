import dotenv from "dotenv";
dotenv.config();

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log("🔑 Testing API Key...");

if (!key) {
    console.error("❌ ERROR: No API Key found in .env!");
    process.exit(1);
}

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.error) {
        console.error("❌ API Refused Connection:");
        console.error(JSON.stringify(data.error, null, 2));
    } else {
        console.log("✅ Connection Successful! Available Models for this Key:");
        const flashModels = data.models.filter(m => m.name.includes('flash'));
        
        if (flashModels.length > 0) {
            console.log("⚡ FLASH MODELS FOUND:");
            flashModels.forEach(m => console.log(`   * ${m.name.replace('models/', '')}`));
        } else {
            console.log("⚠️ NO FLASH MODELS FOUND. Here is what you have:");
            data.models.forEach(m => console.log(`   * ${m.name.replace('models/', '')}`));
        }
    }
  })
  .catch(err => console.error("💥 Network Error:", err));