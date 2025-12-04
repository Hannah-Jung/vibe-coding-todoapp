# Todo App with Firebase

A simple, modern todo application with Firebase Firestore integration. Add, edit, and delete tasks with real-time synchronization.

## Features

- ✅ Add new tasks
- ✏️ Edit existing tasks
- 🗑️ Delete tasks
- 🔄 Real-time updates using Firebase Firestore
- 📱 Responsive design
- 🎨 Modern UI with smooth animations

## Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Get your Firebase configuration

2. **Configure Firebase**
   - Open `firebase-config.js`
   - Replace the placeholder values with your Firebase project configuration:
     ```javascript
     const firebaseConfig = {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_AUTH_DOMAIN",
         projectId: "YOUR_PROJECT_ID",
         storageBucket: "YOUR_STORAGE_BUCKET",
         messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
         appId: "YOUR_APP_ID"
     };
     ```

3. **Set up Firestore Rules**
   - In Firebase Console, go to Firestore Database > Rules
   - For development, you can use:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /todos/{document=**} {
           allow read, write: if true;
         }
       }
     }
     ```
   - ⚠️ **Note**: This rule allows anyone to read/write. For production, implement proper authentication.

4. **Run the App**
   - Install dependencies (optional, for local server):
     ```bash
     npm install
     ```
   - Start a local server:
     ```bash
     npm start
     ```
   - Or simply open `index.html` in your browser

## Usage

1. **Add a Task**: Type a task in the input field and click "Add Task" or press Enter
2. **Edit a Task**: Click the "Edit" button on any task, modify the text, and click "Save"
3. **Delete a Task**: Click the "Delete" button on any task and confirm

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- Firebase Firestore
- Firebase SDK v10.7.1

## Browser Support

Works on all modern browsers that support ES6+ and Firebase SDK.

