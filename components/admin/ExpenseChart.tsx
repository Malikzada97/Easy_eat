import React, { useContext, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { AppContext } from '../../contexts/AppContext';
import Card from '../common/Card';
// FIX: Ensure types are imported from a valid module.
import { ExpenseCategory, AppContextType } from '../../types';

// Predefined colors for consistent chart appearance
const COLORS: Record<ExpenseCategory, string> = {
    [ExpenseCategory.FOOD_COST]: '#0088FE',
    [ExpenseCategory.UTILITIES]: '#00C49F',
    [ExpenseCategory.RENT]: '#FFBB28',
    [ExpenseCategory.SALARIES]: '#FF8042',
    [ExpenseCategory.MARKETING]: '#AF19FF',
    [ExpenseCategory.OTHER]: '#8884d8',
};


const ExpenseChart: React.FC = () => {
    // FIX: Explicitly type context to allow property access.
    const context = useContext(AppContext) as AppContextType | null;
    if (!context) return null;
    const { expenses } = context;

    const chartData = useMemo(() => {
        const expenseByCategory = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {} as Record<ExpenseCategory, number>);

        return Object.entries(expenseByCategory).map(([name, value]) => ({
            name: name as ExpenseCategory,
            value,
        }));
    }, [expenses]);

    const renderNoData = () => (
        <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">No expense data to display.</p>
        </div>
    );
    
    return (
        <Card className="p-6 h-96 flex flex-col">
            <h3 className="font-bold text-lg mb-4">Expense Distribution</h3>
            <div className="flex-grow">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius="80%"
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                // FIX: Explicitly type the label props to resolve type inference issues with recharts.
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; index: number }) => {
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                    if (percent < 0.05) return null; // Hide label for small slices
                                    return (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number, name: string) => [`PKR ${value.toFixed(0)}`, name]}
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                    borderColor: '#6b7280',
                                    borderRadius: '0.5rem',
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : renderNoData()}
            </div>
        </Card>
    );
};

export default ExpenseChart;
