import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { AppContextType } from '../../types';
import Card from '../common/Card';

const RecentSales: React.FC = () => {
    const context = useContext(AppContext) as AppContextType | null;
    
    if(!context) return null;
    const { sales } = context;

    return (
        <Card className="p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg mb-4">Recent Sales</h3>
            <div className="flex-grow overflow-y-auto pr-2 max-h-96">
                {sales.length === 0 && <p className="text-center text-gray-500">No sales recorded yet.</p>}
                {sales.slice(0, 20).map(sale => (
                    <div key={sale.id} className="py-2.5 border-b border-gray-200 dark:border-gray-700/50">
                        <div className="flex justify-between items-center">
                            <span className="font-bold">PKR {sale.total.toFixed(0)}</span>
                            <span className="text-xs text-gray-400">{sale.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {sale.items.length} items via {sale.paymentMethod}
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default RecentSales;
