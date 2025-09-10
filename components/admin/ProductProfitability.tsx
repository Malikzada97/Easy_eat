import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Card from '../common/Card';
// FIX: Ensure Product and AppContextType are imported from a valid module.
import { Product, AppContextType } from '../../types';

interface ProfitabilityData extends Product {
    unitsSold: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
}

const ProductProfitability: React.FC = () => {
    // FIX: Explicitly type context to allow property access.
    const context = useContext(AppContext) as AppContextType | null;
    if (!context) return null;
    const { products, sales } = context;

    const profitabilityData = useMemo((): ProfitabilityData[] => {
        const productSales = new Map<number, { unitsSold: number; totalRevenue: number }>();

        sales.forEach(sale => {
            sale.items.forEach(item => {
                const current = productSales.get(item.id) ?? { unitsSold: 0, totalRevenue: 0 };
                current.unitsSold += item.quantity;
                current.totalRevenue += item.price * item.quantity;
                productSales.set(item.id, current);
            });
        });

        return products
            .map(product => {
                const salesData = productSales.get(product.id) ?? { unitsSold: 0, totalRevenue: 0 };
                const totalCost = (product.cost ?? 0) * salesData.unitsSold;
                const totalProfit = salesData.totalRevenue - totalCost;
                const profitMargin = salesData.totalRevenue > 0 ? (totalProfit / salesData.totalRevenue) * 100 : 0;
                
                return {
                    ...product,
                    ...salesData,
                    totalCost,
                    totalProfit,
                    profitMargin,
                };
            })
            .filter(p => p.unitsSold > 0)
            .sort((a, b) => b.totalProfit - a.totalProfit);

    }, [products, sales]);

    return (
        <Card className="p-6 h-full flex flex-col">
            <h3 className="font-bold text-lg mb-4">Product Profitability</h3>
            <div className="flex-grow overflow-y-auto pr-2">
                {profitabilityData.length === 0 ? (
                     <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">No sales data to analyze profitability.</p>
                     </div>
                ) : (
                    <div className="space-y-4">
                        {/* FIX: Properties like `id`, `name`, etc. are now correctly typed on `p` (ProfitabilityData) */}
                        {profitabilityData.map(p => (
                            <div key={p.id} className="text-sm">
                                <div className="flex justify-between font-semibold">
                                    <span>{p.name}</span>
                                    <span className={p.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        PKR {p.totalProfit.toFixed(0)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                     <span>{p.unitsSold} units sold</span>
                                     <span>
                                        {p.cost > 0 ? `${p.profitMargin.toFixed(1)}% margin` : 'No cost data'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ProductProfitability;
