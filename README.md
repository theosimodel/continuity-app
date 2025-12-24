
# Continuity: The Social Network for Comic Lovers

Continuity is a modern, high-performance web application designed for comic book enthusiasts to track their reading progress, review their favorite runs, and discover new stories across the multiverse. Inspired by platforms like Letterboxd, it combines high-end aesthetics with deep AI integration.

## 🛠️ Tech Stack

### Core Framework
- **React 19**: Utilizing the latest React features for efficient UI rendering.
- **TypeScript**: Ensuring strict type safety across comic metadata and user profiles.
- **ES Modules (ESM)**: Native browser module loading via `esm.sh` for a lightweight, build-less development experience.

### Styling & UI/UX
- **Tailwind CSS**: Powering the sleek "Cinematic Dark Mode" design.
- **Lucide React**: A clean icon system for navigation and interaction.
- **Bebas Neue & Inter**: Typography chosen to blend comic book bold headers with modern application readability.

### Data Visualization
- **Recharts**: Responsive area charts used to track and visualize reading habits over time.

---

## 🧠 AI Integration (Google Gemini API)

Continuity leverages two distinct models to balance speed, cost, and intelligence:

### 1. Gemini 3 Pro (`gemini-3-pro-image-preview`)
- **Primary Use**: Verified Comic Search.
- **Why**: This is the most powerful reasoning model. It supports **Google Search Grounding**, allowing the app to browse the live web to find:
  - Real-world metadata (Writer, Artist, Publisher).
  - Direct, public URLs for official cover art (Wikipedia, Marvel.com, etc.).
- **Requirement**: Users must select a **paid API key** from a GCP project to access this model.

### 2. Gemini 3 Flash (`gemini-3-flash-preview`)
- **Primary Use**: AI Recommendations & Visual Support.
- **Why**: Flash offers extremely low latency and high efficiency.
- **Visual Analysis**: Powers the "Support" feature where it analyzes screen captures to identify UI bugs or design improvements.
- **Recommendations**: Generates personalized "Multiverse Picks" based on user favorites.

---

## ✨ Key Features

### 🔍 Verified Search
Unlike standard databases, Continuity uses AI to browse the web for your query. It returns "Verified Cover" badges when it successfully finds official art, along with the web sources used to ground the information.

### 📖 Reading Journal
Track every issue you read. Rate your experience on a 5-star scale, write detailed reviews, and keep a chronological history of your reading journey.

### 📊 Reading Stats
The profile page dynamically generates charts based on your journal entries, helping you visualize your "Reading Streak" and monthly volume.

### 📸 AI Support (Vision)
A floating support button allows you to capture your screen. The `analyzeScreen` service then passes that image to Gemini to provide a "Fix Report," identifying layout issues or suggesting UI enhancements.

---

## 🚀 Getting Started

1. **API Keys**: Ensure you have an active Google Gemini API Key.
2. **Paid Key Selection**: For the "Verified Search" feature, use the `SELECT API KEY` button in the Search tab to authorize a project with billing enabled.
3. **Permissions**: The app requests `getDisplayMedia` permissions for the screen capture feature.

---

*© 2024 CONTINUITY. MADE BY FANS FOR FANS.*
