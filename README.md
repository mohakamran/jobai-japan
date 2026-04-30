# JobAI Japan 🌏

**Japan Career Accelerator & AI-Powered Document Suite**

JobAI Japan is a high-performance web platform designed to streamline the job hunting experience for international professionals targeting the Japanese market. It combines artificial intelligence with a clean, industrial design to manage the entire career lifecycle—from document translation to application tracking.

<img width="2726" height="1532" alt="jobai-png" src="https://github.com/user-attachments/assets/c3196215-121a-4f05-a1db-c4b825fd808f" />

## 🚀 Core Features

### 📄 AI Document Hub
*   **English Master Resume**: Centralized management of your English CV.
*   **AI Auto-Translate**: Instantly generate structured **履歴書 (Rirekisho)** and **職務経歴書 (Shokumu Keirekisho)** using Google Gemini AI.
*   **Manual Refinement**: Direct editing of generated Japanese text to ensure cultural and professional nuances are perfect.

### 🔍 Japanese Job Explorer
*   **Market Insights**: Browse curated technical and professional roles in Japan.
*   **Match Scoring**: View AI-calculated compatibility scores for different roles.
*   **One-Click Apply**: Seamlessly synchronize applications with your tracking board.

### 📊 Professional Application Tracker
*   **Lifecycle Management**: Track stages from "Applied" and "Interview" to "Offer".
*   **Detailed Notes**: Keep track of interview feedback, salary negotiations, and work locations for every role.
*   **History Logs**: Monitor last status changes and application dates.

### 👤 Profile & JLPT Intelligence
*   **JLPT Metrics**: Track your Japanese proficiency milestones.
*   **Skill Matrix**: Manage your core technical skills used for AI document generation context.
*   **Real-time Notifications**: Get instant updates on profile synchronizations and application successes.

## 🛠 Tech Stack

*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **Animations**: Framer Motion
*   **Backend & DB**: Firebase (Auth & Firestore)
*   **AI Engine**: Google Gemini API via `@google/genai`
*   **Icons**: Lucide React

## 💻 Local Installation

Follow these steps to set up the project on your local machine:

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- A **Firebase Project** (create one at [console.firebase.google.com](https://console.firebase.google.com/))
- A **Google Gemini API Key** (get one at [aistudio.google.com](https://aistudio.google.com/app/apikey))

### 2. Clone and Install
```bash
# Clone the repository
git clone https://github.com/mohakamran/jobai-japan
cd jobai-japan

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory by copying the example file:
```bash
cp .env.example .env
```
Open `.env` and fill in your keys:
- `GEMINI_API_KEY`: Your Google Gemini API key.
- `APP_URL`: Set to `http://localhost:3000` for local development.

### 4. Firebase Configuration
1.  In your Firebase Console, create a new project.
2.  Enable **Firestore Database** in test mode or production mode.
3.  Enable **Authentication** and activate the **Google sign-in provider**.
4.  Create a file named `firebase-applet-config.json` in the root directory with your Firebase configuration:
    ```json
    {
      "apiKey": "YOUR_API_KEY",
      "authDomain": "YOUR_AUTH_DOMAIN",
      "projectId": "YOUR_PROJECT_ID",
      "storageBucket": "YOUR_STORAGE_BUCKET",
      "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
      "appId": "YOUR_APP_ID",
      "firestoreDatabaseId": "(default)"
    }
    ```

### 5. Deploy Firestore Rules
Install Firebase CLI if you haven't:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
```
Copy the contents of `firestore.rules` from this project to your Firebase project and deploy:
```bash
firebase deploy --only firestore:rules
```

### 6. Run the Application
```bash
# Start the development server
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🏗 Build for Production
To create a production build:
```bash
npm run build
```
The static files will be generated in the `dist` folder.

## 🔒 Security
*   **Attribute-Based Access Control (ABAC)**: Robust Firestore security rules ensure users only access their own data.
*   **Identity Protection**: Verification of Firebase Auth UIDs and secure relational synchronization between collections.
*   **PII Isolation**: Strict read/write validation for sensitive user profile data.

---
*Built with precision for the next generation of global talent in Japan.*
