import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { ExpenseCategory, AppContextType } from '../../types';
import Card from '../common/Card';
import { exportToCsv } from '../../utils/csvExporter';
import { DownloadIcon } from '../../constants';

const ExpenseTracker: React.FC = () => {
    const context = useContext(AppContext) as AppContextType | null;
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.FOOD_COST);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!context) return null;
    const { expenses, addExpense } = context;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!description.trim() || !amount || isSubmitting) return;
        
        setIsSubmitting(true);

        await addExpense({
            description,
            amount: parseFloat(amount),
            category,
        });

        setDescription('');
        setAmount('');
        setCategory(ExpenseCategory.FOOD_COST);
        setIsSubmitting(false);
    };
    
    const handleExport = () => {
        const dataToExport = expenses.map(({ id, description, category, amount, date }) => ({ id, description, category, amount, date: date.toISOString().split('T')[0] }));
        exportToCsv('expenses', dataToExport);
    };

    return (
        <Card className="p-6 h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Expense Log</h3>
                <button onClick={handleExport} className="bg-gray-200 dark:bg-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                    <DownloadIcon /> Export
                </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                 <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Expense Description"
                    className="md:col-span-2 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                    disabled={isSubmitting}
                />
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount (PKR)"
                    className="p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                    disabled={isSubmitting}
                    step="0.01"
                    min="0"
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    disabled={isSubmitting}
                >
                    {/* FIX: Object.values returns string[], which is a valid key type for React elements in a list. */}
                    {Object.values(ExpenseCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="md:col-span-2 bg-primary text-primary-content py-2 rounded-lg font-semibold hover:bg-primary-focus transition-colors duration-200 disabled:bg-gray-400"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Logging...' : 'Log Expense'}
                </button>
            </form>
            
            <h4 className="font-semibold mb-2">Recent Expenses</h4>
            <div className="overflow-y-auto max-h-60 pr-2">
                {expenses.length > 0 ? (
                    expenses.map(exp => (
                        <div key={exp.id} className="flex justify-between items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5">
                            <div>
                                <p className="font-medium">{exp.description}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{exp.category} - {exp.date.toLocaleDateString()}</p>
                            </div>
                            <p className="font-semibold text-red-500">-PKR {exp.amount.toFixed(0)}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-4">No expenses logged yet.</p>
                )}
            </div>
        </Card>
    );
}

export default ExpenseTracker;