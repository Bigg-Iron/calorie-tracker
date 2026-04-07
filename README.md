# Calorie Tracker Web Application

A responsive calorie tracker app built with vanilla HTML, CSS, and JavaScript.
This application lets you add food items with nutrition information, delete items, and monitor meal subtotals and daily totals for calories, protein, carbs, and fats.

## Getting Started

1. Open this folder in VS Code.
2. Open `index.html` in your browser or use a static server.
3. Add food items with nutrition values and review the meal and daily totals.

## Features

- Add a food item with name, meal type, quantity, serving size, calories, protein, carbs, and fats
- Use autocomplete to recall previously logged foods and fill nutrition fields automatically
- Automatically record a date/time stamp for each entry
- Delete individual food items
- Recall entries by date (all, today, yesterday, or custom date)
- View meal subtotals for breakfast, lunch, dinner, and snacks
- View daily nutrition totals for calories, protein, carbs, and fats
- Persist food items in local storage

## Project structure

- `index.html` — page markup
- `styles.css` — responsive app styling
- `script.js` — calorie tracker logic
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

The app uses localStorage, which works in browsers, so all functionality is preserved when hosted.
