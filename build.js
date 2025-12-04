const fs = require("fs");
const path = require("path");

// Read the HTML file
const htmlPath = path.join(__dirname, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// Get environment variables (Vercel provides these)
const envVars = {
  apiKey:
    process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "",
  authDomain:
    process.env.VITE_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN ||
    "",
  projectId:
    process.env.VITE_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    "",
  storageBucket:
    process.env.VITE_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    "",
  messagingSenderId:
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    "",
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "",
  databaseURL:
    process.env.VITE_FIREBASE_DATABASE_URL ||
    process.env.FIREBASE_DATABASE_URL ||
    "",
};

// Check if all required environment variables are set
const requiredVars = ['apiKey', 'authDomain', 'projectId', 'databaseURL'];
const missingVars = requiredVars.filter(key => !envVars[key]);

if (missingVars.length > 0) {
  console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
  console.warn('Make sure to set Firebase environment variables in Vercel dashboard');
}

// Replace placeholders in HTML
html = html.replace(
  /window\.firebaseConfig = \{[\s\S]*?\};/,
  `window.firebaseConfig = ${JSON.stringify(envVars, null, 2)};`
);

// Write the modified HTML
fs.writeFileSync(htmlPath, html, "utf8");
console.log("Firebase config injected successfully");
