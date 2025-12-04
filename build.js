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

// Debug: Log environment variables
console.log('=== Environment Variables Debug ===');
console.log('VITE_FIREBASE_API_KEY:', process.env.VITE_FIREBASE_API_KEY ? 'SET' : 'NOT SET');
console.log('FIREBASE_API_KEY:', process.env.FIREBASE_API_KEY ? 'SET' : 'NOT SET');
console.log('FIREBASE_API_KEY value:', process.env.FIREBASE_API_KEY ? `${process.env.FIREBASE_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('All FIREBASE_* env vars:', Object.keys(process.env).filter(key => key.startsWith('FIREBASE_')));

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
  console.warn("Required env vars: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, FIREBASE_DATABASE_URL");
} else {
  console.log("✓ Using environment variables from Vercel");
  console.log("✓ API Key:", envVars.apiKey ? `${envVars.apiKey.substring(0, 10)}...` : 'NOT SET');
  console.log("✓ Auth Domain:", envVars.authDomain || 'NOT SET');
  console.log("✓ Project ID:", envVars.projectId || 'NOT SET');
  console.log("✓ Database URL:", envVars.databaseURL || 'NOT SET');
}

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log("Created dist directory");
}

// Copy all files to dist directory
const filesToCopy = ['index.html', 'styles.css', 'app.js'];
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(distDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to dist/`);
  }
});

// Read the HTML file and inject Firebase config
const htmlPath = path.join(distDir, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// Inject Firebase config into HTML (replace placeholder script tag or existing config)
const firebaseConfigScript = `<script>
  window.firebaseConfig = ${JSON.stringify(envVars, null, 2)};
</script>`;

// Replace the placeholder script tag with actual config, or replace existing config
html = html.replace(
  /<!-- Firebase config will be injected by build script from environment variables -->\s*<script id="firebase-config-inject"><\/script>/,
  firebaseConfigScript
);

// Also handle case where config already exists (replace it)
html = html.replace(
  /<script>\s*\/\/ Firebase config will be injected by build script\s*window\.firebaseConfig = \{[\s\S]*?\};\s*<\/script>/,
  firebaseConfigScript
);

fs.writeFileSync(htmlPath, html, "utf8");
console.log("Firebase config injected into HTML successfully");

// Generate firebase.js file
const firebasePath = path.join(distDir, "firebase.js");
const firebaseContent = `// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: ${JSON.stringify(envVars.apiKey)},
  authDomain: ${JSON.stringify(envVars.authDomain)},
  projectId: ${JSON.stringify(envVars.projectId)},
  storageBucket: ${JSON.stringify(envVars.storageBucket)},
  messagingSenderId: ${JSON.stringify(envVars.messagingSenderId)},
  appId: ${JSON.stringify(envVars.appId)},
  databaseURL: ${JSON.stringify(envVars.databaseURL)},
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Export database for use in other modules
export { database };
`;

fs.writeFileSync(firebasePath, firebaseContent, "utf8");
console.log("firebase.js generated successfully");
