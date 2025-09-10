import React, { useContext, useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { AppContext } from '../../contexts/AppContext';
import Card from '../common/Card';
import { AppContextType } from '../../types';

const SalesChart: React.FC = () => {
    // FIX: Explicitly type context to allow property access.
    const context = useContext(AppContext) as AppContextType | null;
    const [timePeriod, setTimePeriod] = useState<'7D' | '30D' | 'ALL'>('30D');

    if(!context) return null;
    const { sales } = context;
    
    const chartData = useMemo(() => {
        const now = new Date();
        let startDate = new Date(0); // For 'ALL' time

        if (timePeriod === '7D') {
            startDate = new Date();
            startDate.setDate(now.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
        } else if (timePeriod === '30D') {
            startDate = new Date();
            startDate.setDate(now.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
        }

        const filteredSales = sales.filter(sale => sale.timestamp >= startDate);

        const dailySales = filteredSales.reduce((acc, sale) => {
            // Use a consistent, readable format for the date.
            const date = sale.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            acc[date] = (acc[date] || 0) + sale.total;
            return acc;
        }, {} as Record<string, number>);

        // Since sales are sorted newest-to-oldest, the aggregated data needs to be reversed
        // to show oldest-to-newest on the chart's x-axis.
        return Object.entries(dailySales).map(([date, total]) => ({ date, total })).reverse();
    }, [sales, timePeriod]);

    const renderNoData = () => (
        <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">No sales data for this period.</p>
        </div>
    );
    
    const filterButtons = (
         <div className="flex items-center gap-1 bg-light-bg dark:bg-dark-bg p-1 rounded-lg">
            <button
                onClick={() => setTimePeriod('7D')}
                className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${timePeriod === '7D' ? 'bg-primary text-primary-content shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
                7D
            </button>
            <button
                onClick={() => setTimePeriod('30D')}
                className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${timePeriod === '30D' ? 'bg-primary text-primary-content shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
                30D
            </button>
            <button
                onClick={() => setTimePeriod('ALL')}
                className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${timePeriod === 'ALL' ? 'bg-primary text-primary-content shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
                All
            </button>
        </div>
    );

    return (
        <Card className="p-6 h-96 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Sales Overview</h3>
                {filterButtons}
            </div>
            <div className="flex-grow">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(210, 40%, 50%)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(210, 40%, 50%)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                            <YAxis />
                            <Tooltip 
                                formatter={(value: number) => [`PKR ${value.toFixed(0)}`, 'Sales']}
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                    borderColor: 'hsl(210, 40%, 50%)',
                                    borderRadius: '0.5rem',
                                }}
                                labelStyle={{ fontWeight: 'bold' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="total" stroke="hsl(210, 40%, 50%)" fillOpacity={1} fill="url(#colorTotal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : renderNoData()}
            </div>
        </Card>
    )
};

export default SalesChart;
