import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, push, remove } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// Configuration loaded from .env variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DB_URL
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Auth
export const auth = getAuth(app);

// ── Auth ────────────────────────────────────────────────────

export function loginAdmin(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function logoutAdmin() {
    return signOut(auth);
}

export function listenToAuthChanges(callback) {
    return onAuthStateChanged(auth, callback);
}

// ── Categories ──────────────────────────────────────────────

export async function getCategories() {
    const snap = await get(ref(db, 'categories'));
    return snap.val() || {};
}

export async function addCategory(name) {
    const newRef = push(ref(db, 'categories'));
    await set(newRef, { name });
}

export async function updateCategory(id, name) {
    await set(ref(db, `categories/${id}`), { name });
}

export async function deleteCategory(id) {
    await remove(ref(db, `categories/${id}`));
}

// ── Questions ───────────────────────────────────────────────

export async function getQuestions() {
    const snap = await get(ref(db, 'questions'));
    return snap.val() || {};
}

export async function addQuestion(question) {
    const newRef = push(ref(db, 'questions'));
    await set(newRef, question);
}

export async function updateQuestion(id, question) {
    await set(ref(db, `questions/${id}`), question);
}

export async function deleteQuestion(id) {
    await remove(ref(db, `questions/${id}`));
}

// ── Settings ────────────────────────────────────────────────

export async function getSettings() {
    const snap = await get(ref(db, 'settings'));
    return snap.val() || {};
}

export async function updateSettings(settings) {
    await set(ref(db, 'settings'), settings);
}

// ── Submissions ─────────────────────────────────────────────

export async function getSubmissions() {
    const snap = await get(ref(db, 'submissions'));
    return snap.val() || {};
}

export async function addSubmission(submission) {
    const newRef = push(ref(db, 'submissions'));
    await set(newRef, {
        ...submission,
        timestamp: new Date().toISOString(),
    });
}

export async function markSubmission(id, isCorrect) {
    await set(ref(db, `submissions/${id}/isCorrect`), isCorrect);
}

export async function deleteAllSubmissions() {
    await remove(ref(db, 'submissions'));
}
