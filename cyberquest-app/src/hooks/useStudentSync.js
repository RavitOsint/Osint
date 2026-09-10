import { useState, useEffect, useRef, useCallback } from 'react';
import { getSettings, getQuestions } from '../services/firebase';

/**
 * Hook for polling the admin settings and loading questions once a category is active
 */
export function useStudentSync(studentName) {
    const [settings, setSettings] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadedCategoryRef = useRef(null);
    const loadedBroadcastRef = useRef(null);

    const sync = useCallback(async () => {
        if (!studentName) return;
        try {
            const s = await getSettings();
            setSettings(s);

            const catChanged = s?.activeCategoryId && loadedCategoryRef.current !== s.activeCategoryId;
            const broadcastChanged = s?.broadcastTimestamp && loadedBroadcastRef.current !== s.broadcastTimestamp;

            if (s?.activeCategoryId && (catChanged || broadcastChanged || loadedCategoryRef.current === null)) {
                const allQs = await getQuestions();
                const filtered = Object.values(allQs)
                    .filter((q) => {
                        if (!q.categoryIds || !q.categoryIds.includes(s.activeCategoryId)) return false;

                        // Check if hidden in this specific category
                        const isHiddenInCat = (Array.isArray(q.hiddenCategories) && q.hiddenCategories.includes(s.activeCategoryId)) ||
                            (q.hiddenCategories && typeof q.hiddenCategories === 'object' && q.hiddenCategories[s.activeCategoryId] === true) ||
                            (q.hiddenCategoryMap && q.hiddenCategoryMap[s.activeCategoryId] === true);

                        // Check if hidden globally
                        const isHiddenGlobally = q.hidden === true || q.isHidden === true;

                        return !isHiddenInCat && !isHiddenGlobally;
                    })
                    .sort((a, b) => {
                        const aOrder = a.categoryOrder && a.categoryOrder[s.activeCategoryId] !== undefined ? a.categoryOrder[s.activeCategoryId] : (a.order || 0);
                        const bOrder = b.categoryOrder && b.categoryOrder[s.activeCategoryId] !== undefined ? b.categoryOrder[s.activeCategoryId] : (b.order || 0);
                        return aOrder - bOrder;
                    });
                setQuestions(filtered);
                loadedCategoryRef.current = s.activeCategoryId;
                loadedBroadcastRef.current = s.broadcastTimestamp || null;
            }
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [studentName]);

    useEffect(() => {
        if (!studentName) return;
        sync();
        const interval = setInterval(sync, 4000);
        return () => clearInterval(interval);
    }, [studentName, sync]);

    return { settings, questions, isLoading, error };
}

/**
 * Hook for countdown penalty timer
 */
export function usePenaltyTimer(durationSeconds = 10) {
    const [isLocked, setIsLocked] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const startPenalty = useCallback(() => {
        setIsLocked(true);
        setTimeLeft(durationSeconds);
    }, [durationSeconds]);

    useEffect(() => {
        if (!isLocked || timeLeft <= 0) {
            if (isLocked && timeLeft <= 0) setIsLocked(false);
            return;
        }
        const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [isLocked, timeLeft]);

    return { isLocked, timeLeft, startPenalty };
}
