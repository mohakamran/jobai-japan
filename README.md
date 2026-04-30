# JobAI Japan 🌏

**Japan Career Accelerator & AI-Powered Document Suite**

JobAI Japan is a high-performance web platform designed to streamline the job hunting experience for international professionals targeting the Japanese market. It combines artificial intelligence with a clean, industrial design to manage the entire career lifecycle—from document translation to application tracking.

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

## 🔒 Security

*   **Attribute-Based Access Control (ABAC)**: Robust Firestore security rules ensure users only access their own data.
*   **Identity Protection**: Verification of Firebase Auth UIDs and secure relational synchronization between collections.
*   **PII Isolation**: Strict read/write validation for sensitive user profile data.

## 🏗 Setup & Deployment

1.  **Firebase Setup**:
    *   Initialize a Firebase project.
    *   Enable **Firestore** and **Google Authentication**.
    *   Add your configuration to `src/lib/firebase.ts` (or `firebase-applet-config.json` in AI Studio).
2.  **Environment Variables**:
    *   `GEMINI_API_KEY`: Required for document translation and job matching features.
3.  **Security Rules**:
    *   Deploy `firestore.rules` to your Firebase project to secure user data.

---
*Built with precision for the next generation of global talent in Japan.*
