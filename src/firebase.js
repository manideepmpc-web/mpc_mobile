// Re-export the already-initialized Firebase app from firebaseConfig.js
// Do NOT call initializeApp again here — it causes a "duplicate-app" crash.
export { firebaseApp as default } from "./firebaseConfig";