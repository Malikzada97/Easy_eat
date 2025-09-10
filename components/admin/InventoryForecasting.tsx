import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Card from '../common/Card';
import { getInventoryForecast } from '../../services/geminiService';
// FIX: Ensure InventoryForecast and AppContextType are imported from a valid module.
import { InventoryForecast, AppContextType } from '../../types';

const InventoryForecasting: React.FC = () => {
    // FIX: Explicitly type context to allow property access.
    const context = useContext(AppContext) as AppContextType | null;
    const [forecast, setForecast] = useState<InventoryForecast[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateForecast = async () => {
        if (!context) return;
        setIsLoading(true);
        setError(null);
        setForecast(null);

        const { products, sales } = context;
        try {
            const result = await getInventoryForecast({ products, sales });
            setForecast(result);
        } catch (err) {
            setError('Failed to generate forecast. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="p-6 flex-grow flex flex-col">
            <h3 className="font-bold text-lg mb-4">AI Inventory Forecast</h3>
            
            <div className="flex-grow flex flex-col justify-center">
                {isLoading && <div className="text-center animate-pulse">Forecasting inventory needs...</div>}
                {error && <p className="text-red-500 text-center">{error}</p>}
                
                {forecast && forecast.length > 0 && (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {forecast.map(item => (
                            <div key={item.productId} className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                                <div className="flex justify-between items-center font-bold">
                                    <span>{item.productName}</span>
                                    <span className="text-primary">Reorder: {item.suggestedReorderQuantity}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">{item.reasoning}</p>
                                <div className="flex justify-between text-xs mt-2 text-gray-400">
                                    <span>Stock: {item.currentStock}</span>
                                    <span>~{item.predictedWeeklySales}/week</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {forecast && forecast.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400">All inventory levels seem sufficient for now.</p>
                )}
                {!isLoading && !forecast && !error && (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <p>Click the button to generate an inventory forecast based on recent sales.</p>
                    </div>
                )}
            </div>


            {!isLoading && (
                 <button
                    onClick={handleGenerateForecast}
                    className="w-full mt-4 bg-primary text-primary-content px-4 py-2 rounded-lg hover:bg-primary-focus transition-colors duration-200 disabled:bg-gray-400"
                    disabled={isLoading}
                >
                    {forecast ? 'Regenerate Forecast' : 'Generate Forecast'}
                </button>
            )}
        </Card>
    );
};

export default InventoryForecasting;
