/**
 * Firebase Realtime Database Service
 * Handles all communication with the Firebase backend
 */

const FIREBASE_URL = import.meta.env.VITE_FIREBASE_DB_URL;

if (!FIREBASE_URL) {
    throw new Error(
        'Missing VITE_FIREBASE_DB_URL in .env file. ' +
        'Copy .env.example to .env and fill in your Firebase Realtime Database URL.'
    );
}

// ── Generic Helpers ─────────────────────────────────────────

async function fetchJSON(path) {
    const res = await fetch(`${FIREBASE_URL}${path}.json`);
    if (!res.ok) throw new Error(`Firebase fetch failed: ${res.statusText}`);
    return res.json();
}

async function putJSON(path, data) {
    const res = await fetch(`${FIREBASE_URL}${path}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Firebase put failed: ${res.statusText}`);
    return res.json();
}

async function postJSON(path, data) {
    const res = await fetch(`${FIREBASE_URL}${path}.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Firebase post failed: ${res.statusText}`);
    return res.json();
}

async function deleteJSON(path) {
    const res = await fetch(`${FIREBASE_URL}${path}.json`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Firebase delete failed: ${res.statusText}`);
    return res.json();
}

// ── Categories ──────────────────────────────────────────────

export async function getCategories() {
    const data = await fetchJSON('categories');
    return data || {};
}

export async function addCategory(name) {
    return postJSON('categories', { name });
}

export async function deleteCategory(id) {
    return deleteJSON(`categories/${id}`);
}

// ── Questions ───────────────────────────────────────────────

export async function getQuestions() {
    const data = await fetchJSON('questions');
    return data || {};
}

export async function addQuestion(question) {
    return postJSON('questions', question);
}

export async function updateQuestion(id, question) {
    return putJSON(`questions/${id}`, question);
}

export async function deleteQuestion(id) {
    return deleteJSON(`questions/${id}`);
}

// ── Settings ────────────────────────────────────────────────

export async function getSettings() {
    const data = await fetchJSON('settings');
    return data || {};
}

export async function updateSettings(settings) {
    return putJSON('settings', settings);
}

// ── Submissions ─────────────────────────────────────────────

export async function getSubmissions() {
    const data = await fetchJSON('submissions');
    return data || {};
}

export async function addSubmission(submission) {
    return postJSON('submissions', {
        ...submission,
        timestamp: new Date().toISOString(),
    });
}

export async function markSubmission(id, isCorrect) {
    return putJSON(`submissions/${id}/isCorrect`, isCorrect);
}
