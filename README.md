# Todo App with Firebase

A modern todo application built with vanilla JavaScript and Firebase Realtime Database.

## Features

- ✅ Add, edit, and delete todos
- 📌 Pin/unpin todos
- ✅ Mark todos as complete/incomplete
- 🔍 Real-time search functionality
- 📱 Responsive design for mobile and desktop
- 💾 Real-time synchronization with Firebase

## Setup

1. Clone the repository:
```bash
git clone https://github.com/Hannah-Jung/vibe-coding-todoapp.git
cd vibe-coding-todoapp
```

2. Create your Firebase configuration file:
   - Copy `firebase-config.example.js` to `firebase-config.js`
   - Replace the placeholder values with your actual Firebase credentials from the Firebase Console

3. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

## Firebase Setup

### Local Development

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Realtime Database
4. Get your Firebase configuration from Project Settings > General > Your apps
5. Copy `firebase-config.example.js` to `firebase-config.js` and add your actual Firebase credentials

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the following environment variables:
   - `FIREBASE_API_KEY` (or `VITE_FIREBASE_API_KEY`)
   - `FIREBASE_AUTH_DOMAIN` (or `VITE_FIREBASE_AUTH_DOMAIN`)
   - `FIREBASE_PROJECT_ID` (or `VITE_FIREBASE_PROJECT_ID`)
   - `FIREBASE_STORAGE_BUCKET` (or `VITE_FIREBASE_STORAGE_BUCKET`)
   - `FIREBASE_MESSAGING_SENDER_ID` (or `VITE_FIREBASE_MESSAGING_SENDER_ID`)
   - `FIREBASE_APP_ID` (or `VITE_FIREBASE_APP_ID`)
   - `FIREBASE_DATABASE_URL` (or `VITE_FIREBASE_DATABASE_URL`)
4. The build script will automatically inject these values into the HTML during deployment

## Security Note

⚠️ **IMPORTANT**: Never commit `firebase-config.js` to version control. It contains sensitive API keys. The file is already in `.gitignore`.

## License

MIT
