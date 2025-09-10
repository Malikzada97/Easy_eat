import React from 'react';
import { Sale } from '../types';

interface PrintableReceiptProps {
  sale: Omit<Sale, 'id' | 'timestamp'> & { timestamp?: Date };
}

const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>(({ sale }, ref) => {
    const saleTime = sale.timestamp || new Date();
    return (
        <div ref={ref} className="p-4 bg-white text-black font-mono text-xs w-[300px]">
            <div className="text-center mb-4">
                <h1 className="font-bold text-lg">Easy Eat</h1>
                <p>123 Food Street, Karachi</p>
                <p>Thank you for your visit!</p>
            </div>
            <p>Date: {saleTime.toLocaleString()}</p>
            <hr className="my-2 border-black border-dashed" />
            <table className="w-full">
                <thead>
                    <tr>
                        <th className="text-left">Item</th>
                        <th className="text-center">Qty</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map(item => (
                        <tr key={item.id}>
                            <td className="text-left pr-1">{item.name}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-right pl-1">{item.price.toFixed(0)}</td>
                            <td className="text-right pl-1">{(item.price * item.quantity).toFixed(0)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr className="my-2 border-black border-dashed" />
            <div className="text-right font-bold">
                <p>TOTAL: PKR {sale.total.toFixed(0)}</p>
                <p>Paid via: {sale.paymentMethod}</p>
            </div>
            <div className="text-center mt-4">
                <p>Come Again!</p>
            </div>
        </div>
    );
});

PrintableReceipt.displayName = 'PrintableReceipt';
export default PrintableReceipt;
