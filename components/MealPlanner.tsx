import React, { useState } from 'react';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { getMealSuggestions } from '../services/apiService';

interface MealPlannerProps {
}

const MealPlanner: React.FC<MealPlannerProps> = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');
        setResult('');

        try {
            const suggestions = await getMealSuggestions(query);
            setResult(suggestions);
        } catch (err) {
            setError('אירעה שגיאה בקבלת הצעות. נסה שוב.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card>
            <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">תכנון ארוחות חכם</h3>
                <p className="text-slate-500 mb-4">צריך רעיונות? שאל את ה-AI! (למשל: "ארוחת ערב מהירה ודלת פחמימות")</p>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input 
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="מה בא לך לאכול?"
                        className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        disabled={isLoading}
                    />
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition disabled:bg-slate-400" disabled={isLoading || !query.trim()}>
                        {isLoading ? <Spinner /> : 'חפש'}
                    </button>
                </form>

                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                {result && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-md border border-slate-200">
                        <h4 className="font-semibold text-slate-700 mb-2">הנה כמה רעיונות:</h4>
                        <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\s*\*\s/g, '<br/>• ').replace(/^\s*\*\s/g, '• ') }} />
                    </div>
                )}
            </div>
        </Card>
    );
};

export default MealPlanner;
