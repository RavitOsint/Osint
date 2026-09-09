import * as XLSX from 'xlsx';

/**
 * Helper to get clean display string for question type in Hebrew
 */
const getQuestionTypeLabel = (type) => {
    switch (type) {
        case 'multiple': return 'שאלה אמריקאית';
        case 'explanation': return 'הסבר (ללא מענה)';
        case 'open':
        default: return 'שאלה פתוחה';
    }
};

/**
 * Exports questions & answers for one or all categories to an Excel file (.xlsx).
 * 
 * @param {Object} categories - Object containing all categories
 * @param {Object} questions - Object containing all questions
 * @param {string|null} targetCatId - Optional category ID to filter by. If null, exports all categories.
 */
export const exportCategoriesToExcel = (categories = {}, questions = {}, targetCatId = null) => {
    try {
        const wb = XLSX.utils.book_new();

        // 1. Exporting a single specific category
        if (targetCatId) {
            const cat = categories[targetCatId];
            const catName = cat?.name || 'קטגוריה';
            const catQuestions = Object.entries(questions)
                .filter(([, q]) => (q.categoryIds || []).includes(targetCatId))
                .sort((a, b) => {
                    const aOrder = a[1].categoryOrder?.[targetCatId] ?? (a[1].order || 0);
                    const bOrder = b[1].categoryOrder?.[targetCatId] ?? (b[1].order || 0);
                    return aOrder - bOrder;
                });

            const rows = catQuestions.map(([, q], index) => {
                const optionsStr = Array.isArray(q.options) && q.options.length > 0
                    ? q.options.filter(o => o && o.trim()).map((opt, i) => `${i + 1}) ${opt}`).join(' | ')
                    : '—';

                return {
                    'מספר שאלה': index + 1,
                    'שם הקטגוריה': catName,
                    'כותרת השאלה': q.title || 'ללא כותרת',
                    'תוכן השאלה': q.text || '',
                    'סוג השאלה': getQuestionTypeLabel(q.type),
                    'תשובה נכונה / Flag': q.answer || '—',
                    'אפשרויות תשובה (אמריקאית)': optionsStr,
                    'בדיקה אוטומטית': q.hasFlag ? 'כן' : 'לא',
                    'מדיה מצורפת': q.imageUrl ? 'כן' : 'ללא'
                };
            });

            const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{
                'מספר שאלה': '—',
                'שם הקטגוריה': catName,
                'כותרת השאלה': 'אין שאלות בקטגוריה זו',
                'תוכן השאלה': '',
                'סוג השאלה': '',
                'תשובה נכונה / Flag': '',
                'אפשרויות תשובה (אמריקאית)': '',
                'בדיקה אוטומטית': '',
                'מדיה מצורפת': ''
            }]);

            ws['!cols'] = [
                { wch: 12 },
                { wch: 20 },
                { wch: 25 },
                { wch: 45 },
                { wch: 18 },
                { wch: 25 },
                { wch: 35 },
                { wch: 15 },
                { wch: 15 }
            ];

            const safeSheetName = catName.replace(/[:\\/?*\[\]]/g, '').substring(0, 31) || 'קטגוריה';
            XLSX.utils.book_append_sheet(wb, ws, safeSheetName);

            const safeFileName = `שאלות_ותשובות_${catName.replace(/[\s\/:*?"<>|]/g, '_')}.xlsx`;
            XLSX.writeFile(wb, safeFileName);
            return;
        }

        // 2. Exporting ALL categories
        const allRows = [];
        const catEntries = Object.entries(categories);

        // Build main table with all questions grouped by category
        catEntries.forEach(([catId, cat]) => {
            const catQs = Object.entries(questions)
                .filter(([, q]) => (q.categoryIds || []).includes(catId))
                .sort((a, b) => {
                    const aOrder = a[1].categoryOrder?.[catId] ?? (a[1].order || 0);
                    const bOrder = b[1].categoryOrder?.[catId] ?? (b[1].order || 0);
                    return aOrder - bOrder;
                });

            catQs.forEach(([, q], index) => {
                const optionsStr = Array.isArray(q.options) && q.options.length > 0
                    ? q.options.filter(o => o && o.trim()).map((opt, i) => `${i + 1}) ${opt}`).join(' | ')
                    : '—';

                allRows.push({
                    'שם הקטגוריה': cat.name,
                    'מספר שאלה בקטגוריה': index + 1,
                    'כותרת השאלה': q.title || 'ללא כותרת',
                    'תוכן השאלה': q.text || '',
                    'סוג השאלה': getQuestionTypeLabel(q.type),
                    'תשובה נכונה / Flag': q.answer || '—',
                    'אפשרויות תשובה (אמריקאית)': optionsStr,
                    'בדיקה אוטומטית': q.hasFlag ? 'כן' : 'לא',
                    'מדיה מצורפת': q.imageUrl ? 'כן' : 'ללא'
                });
            });
        });

        // Check for uncategorized questions
        const uncategorizedQs = Object.entries(questions).filter(([, q]) => !q.categoryIds || q.categoryIds.length === 0);
        if (uncategorizedQs.length > 0) {
            uncategorizedQs.forEach(([, q], index) => {
                const optionsStr = Array.isArray(q.options) && q.options.length > 0
                    ? q.options.filter(o => o && o.trim()).map((opt, i) => `${i + 1}) ${opt}`).join(' | ')
                    : '—';

                allRows.push({
                    'שם הקטגוריה': 'ללא קטגוריה',
                    'מספר שאלה בקטגוריה': index + 1,
                    'כותרת השאלה': q.title || 'ללא כותרת',
                    'תוכן השאלה': q.text || '',
                    'סוג השאלה': getQuestionTypeLabel(q.type),
                    'תשובה נכונה / Flag': q.answer || '—',
                    'אפשרויות תשובה (אמריקאית)': optionsStr,
                    'בדיקה אוטומטית': q.hasFlag ? 'כן' : 'לא',
                    'מדיה מצורפת': q.imageUrl ? 'כן' : 'ללא'
                });
            });
        }

        const wsAll = XLSX.utils.json_to_sheet(allRows.length > 0 ? allRows : [{
            'שם הקטגוריה': '—',
            'מספר שאלה בקטגוריה': '—',
            'כותרת השאלה': 'אין שאלות במערכת',
            'תוכן השאלה': '',
            'סוג השאלה': '',
            'תשובה נכונה / Flag': '',
            'אפשרויות תשובה (אמריקאית)': '',
            'בדיקה אוטומטית': '',
            'מדיה מצורפת': ''
        }]);

        wsAll['!cols'] = [
            { wch: 20 },
            { wch: 18 },
            { wch: 25 },
            { wch: 45 },
            { wch: 18 },
            { wch: 25 },
            { wch: 35 },
            { wch: 15 },
            { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(wb, wsAll, 'כל השאלות והתשובות');

        // Add individual sheets per category
        catEntries.forEach(([catId, cat]) => {
            const catQs = Object.entries(questions)
                .filter(([, q]) => (q.categoryIds || []).includes(catId))
                .sort((a, b) => {
                    const aOrder = a[1].categoryOrder?.[catId] ?? (a[1].order || 0);
                    const bOrder = b[1].categoryOrder?.[catId] ?? (b[1].order || 0);
                    return aOrder - bOrder;
                });

            if (catQs.length > 0) {
                const catRows = catQs.map(([, q], index) => {
                    const optionsStr = Array.isArray(q.options) && q.options.length > 0
                        ? q.options.filter(o => o && o.trim()).map((opt, i) => `${i + 1}) ${opt}`).join(' | ')
                        : '—';

                    return {
                        'מספר שאלה': index + 1,
                        'כותרת השאלה': q.title || 'ללא כותרת',
                        'תוכן השאלה': q.text || '',
                        'סוג השאלה': getQuestionTypeLabel(q.type),
                        'תשובה נכונה / Flag': q.answer || '—',
                        'אפשרויות תשובה (אמריקאית)': optionsStr,
                        'בדיקה אוטומטית': q.hasFlag ? 'כן' : 'לא',
                        'מדיה מצורפת': q.imageUrl ? 'כן' : 'ללא'
                    };
                });

                const wsCat = XLSX.utils.json_to_sheet(catRows);
                wsCat['!cols'] = [
                    { wch: 12 },
                    { wch: 25 },
                    { wch: 45 },
                    { wch: 18 },
                    { wch: 25 },
                    { wch: 35 },
                    { wch: 15 },
                    { wch: 15 }
                ];
                const safeSheetName = cat.name.replace(/[:\\/?*\[\]]/g, '').substring(0, 31) || `קטגוריה ${catId}`;
                XLSX.utils.book_append_sheet(wb, wsCat, safeSheetName);
            }
        });

        const dateStr = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `מאגר_שאלות_ותשובות_לפי_קטגוריות_${dateStr}.xlsx`);
    } catch (err) {
        console.error('Error exporting categories to Excel:', err);
        alert('אירעה שגיאה בעת ייצוא הקובץ לאקסל. אנא נסה שוב.');
    }
};
