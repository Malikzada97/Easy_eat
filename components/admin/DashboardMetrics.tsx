import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Card from '../common/Card';
import { AppContextType } from '../../types';

const DashboardMetrics: React.FC = () => {
    // FIX: Explicitly type context to allow property access.
    const context = useContext(AppContext) as AppContextType | null;
    if(!context) return null;
    const { sales, expenses } = context;

    const totalRevenue = useMemo(() => sales.reduce((sum, sale) => sum + sale.total, 0), [sales]);
    const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
    const netProfit = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);
    const totalSales = sales.length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
                <h3 className="text-gray-400">Total Revenue</h3>
                <p className="text-3xl font-bold">PKR {totalRevenue.toFixed(0)}</p>
            </Card>
            <Card className="p-6">
                <h3 className="text-gray-400">Total Expenses</h3>
                <p className="text-3xl font-bold text-red-500">PKR {totalExpenses.toFixed(0)}</p>
            </Card>
            <Card className="p-6">
                <h3 className="text-gray-400">Net Profit</h3>
                <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    PKR {netProfit.toFixed(0)}
                </p>
            </Card>
             <Card className="p-6">
                <h3 className="text-gray-400">Total Sales</h3>
                <p className="text-3xl font-bold">{totalSales}</p>
            </Card>
        </div>
    )
};

export default DashboardMetrics;
