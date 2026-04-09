# Calorie Tracker Web Application

A responsive calorie tracker app built with vanilla HTML, CSS, and JavaScript, now with Firebase authentication and centralized storage for multi-device sync.
This application lets you add food items with nutrition information, delete items, and monitor meal subtotals and daily totals for calories, protein, carbs, and fats.

## Getting Started

1. Set up Firebase (see Firebase Setup below).
2. Open this folder in VS Code.
3. Open `index.html` in your browser or use a static server.
4. Sign in with your email and password.
5. Add food items with nutrition values and review the meal and daily totals.

## Features

- User authentication with Firebase
- Centralized storage with Firestore for multi-device sync
- Add a food item with name, meal type, quantity, serving size, calories, protein, carbs, and fats
- Use autocomplete to recall previously logged foods and fill nutrition fields automatically
- Automatically record a date/time stamp for each entry
- Delete individual food items
- Recall entries by date (all, today, yesterday, or custom date)
- View meal subtotals for breakfast, lunch, dinner, and snacks
- View daily nutrition totals for calories, protein, carbs, and fats
- Real-time sync across devices

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
3. Enable Firestore:
   - Go to Firestore Database
   - Create a database in production mode
4. Get your Firebase config:
   - Go to Project settings > General > Your apps
   - Click "Add app" > Web app
   - Copy the config object
5. In `index.html`, replace the placeholder Firebase config with your actual config:

   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };
   ```
## Firestore Security Rules

Your Firestore database needs rules that allow authenticated users to read and write only their own items.

1. In Firebase Console, go to Firestore Database > Rules.
2. Replace the rules with this:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /items/{itemId} {
         allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
         allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

3. Publish the rules.

If you use the Firebase CLI, you can also store rules in `firebase.rules` and use `firebase.json` to deploy them.
## Project structure

- `index.html` — page markup
- `styles.css` — responsive app styling
- `script.js` — calorie tracker logic with Firebase integration
- `.github/copilot-instructions.md` — workspace custom instructions for Copilot
- `.github/agents/Reviewer.agent.md` — custom agent definition for code review

## Deployment for Internet Access

To make the app accessible from any internet-connected device (like smartphones), deploy it to a static hosting service. Here's how to deploy to GitHub Pages (free):

### Prerequisites

- A GitHub account
- Git installed locally

### Steps

1. Create a new repository on GitHub (e.g., `calorie-tracker`).
2. Initialize Git in your local project folder:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. Add the GitHub repository as remote:

   ```bash
   git remote add origin https://github.com/yourusername/calorie-tracker.git
   git push -u origin main
   ```

4. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Save

5. Your app will be available at `https://yourusername.github.io/calorie-tracker/`

### Alternative: Netlify (also free)

1. Sign up for a Netlify account at netlify.com
2. Drag and drop the project folder to the Netlify dashboard, or connect your GitHub repo
3. Netlify will provide a live URL (e.g., `https://amazing-site.netlify.app`)

The app now uses Firebase for authentication and data storage, enabling multi-device sync. All functionality is preserved when hosted, and users can access their data from any device after signing in.
