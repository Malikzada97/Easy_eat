

import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
// FIX: Ensure AiInsight type is correctly imported from a valid types.ts module.
import { AiInsight, AppContextType } from '../../types';
import { getAiInsight } from '../../services/geminiService';

const AiQuery: React.FC = () => {
  // FIX: Explicitly type the context after null check.
  const context = useContext(AppContext) as AppContextType | null;
  const [query, setQuery] = useState('');
  const [insight, setInsight] = useState<AiInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !context) return;

    setIsLoading(true);
    setError(null);
    setInsight(null);
    
    const { products, sales, expenses } = context;

    try {
      const result = await getAiInsight(query, { products, sales, expenses });
      setInsight(result);
    } catch (err) {
      setError('Failed to get insights. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 flex flex-col h-full">
      <h3 className="font-bold text-lg mb-4">AI Business Insights</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 'Top 3 selling drinks this month'"
          className="flex-grow p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-primary text-primary-content px-4 py-2 rounded-lg hover:bg-primary-focus transition-colors duration-200 disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? '...' : 'Ask'}
        </button>
      </form>
      <div className="mt-4 flex-grow flex flex-col justify-center">
        {isLoading && <div className="text-center">Analyzing data...</div>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {insight && (
          <div className="space-y-4">
            <p className="italic text-gray-600 dark:text-gray-300">"{insight.summary}"</p>
            {insight.data.length > 0 && insight.chartType === 'bar' && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insight.data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="label" width={80} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}/>
                    <Bar dataKey="value" fill="hsl(210, 40%, 50%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
        {!isLoading && !insight && !error && (
            <div className="text-center text-gray-500 dark:text-gray-400">
                <p>Ask a question about your business to get AI-powered insights.</p>
            </div>
        )}
      </div>
    </Card>
  );
};

export default AiQuery;
