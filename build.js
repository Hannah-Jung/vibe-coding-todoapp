const fs = require("fs");
const path = require("path");

// Fallback values for local development
const fallbackConfig = {
  apiKey: "AIzaSyBc2WKLRw05rAMRQdVCQZV62H6b90rdr6Q",
  authDomain: "vibecoding-todoapp-backend.firebaseapp.com",
  projectId: "vibecoding-todoapp-backend",
  storageBucket: "vibecoding-todoapp-backend.firebasestorage.app",
  messagingSenderId: "474800373014",
  appId: "1:474800373014:web:fa925f3f6ec5493932a437",
  databaseURL:
    "https://vibecoding-todoapp-backend-default-rtdb.firebaseio.com/",
};

// Get environment variables (Vercel provides these)
const envVars = {
  apiKey:
    process.env.VITE_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    fallbackConfig.apiKey,
  authDomain:
    process.env.VITE_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN ||
    fallbackConfig.authDomain,
  projectId:
    process.env.VITE_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    fallbackConfig.projectId,
  storageBucket:
    process.env.VITE_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    fallbackConfig.storageBucket,
  messagingSenderId:
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    fallbackConfig.messagingSenderId,
  appId:
    process.env.VITE_FIREBASE_APP_ID ||
    process.env.FIREBASE_APP_ID ||
    fallbackConfig.appId,
  databaseURL:
    process.env.VITE_FIREBASE_DATABASE_URL ||
    process.env.FIREBASE_DATABASE_URL ||
    fallbackConfig.databaseURL,
};

// Check if environment variables are set (not using fallback)
const usingFallback =
  !process.env.VITE_FIREBASE_API_KEY && !process.env.FIREBASE_API_KEY;
if (usingFallback) {
  console.warn(
    "Warning: Using fallback Firebase config. Set environment variables in Vercel dashboard for production."
  );
} else {
  console.log("Using environment variables from Vercel");
}

// Read the HTML file
const htmlPath = path.join(__dirname, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// Replace placeholders in HTML
html = html.replace(
  /window\.firebaseConfig = \{[\s\S]*?\};/,
  `window.firebaseConfig = ${JSON.stringify(envVars, null, 2)};`
);

// Write the modified HTML
fs.writeFileSync(htmlPath, html, "utf8");
console.log("Firebase config injected into HTML successfully");

// Generate firebase-config.js file
const firebaseConfigPath = path.join(__dirname, "firebase-config.js");
const firebaseConfigContent = `// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Your web app's Firebase configuration
// Use environment variables from window object (set by build script in Vercel) or fallback to local values
const firebaseConfig =
  window.firebaseConfig && 
  window.firebaseConfig.apiKey && 
  window.firebaseConfig.databaseURL
    ? window.firebaseConfig
    : ${JSON.stringify(fallbackConfig, null, 6)};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Export database for use in other modules
export { database };
`;

fs.writeFileSync(firebaseConfigPath, firebaseConfigContent, "utf8");
console.log("firebase-config.js generated successfully");
