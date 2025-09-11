import React from 'react';
import { Sale } from '../types';

interface PrintableReceiptProps {
  sale: Omit<Sale, 'id' | 'timestamp'> & { timestamp?: Date };
}

const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>(({ sale }, ref) => {
    const saleTime = sale.timestamp || new Date();
    
    return (
        <div ref={ref} style={{ 
            padding: '16px',
            backgroundColor: 'white',
            color: 'black',
            fontFamily: "'Courier New', monospace",
            fontSize: '12px',
            width: '300px',
            lineHeight: '1.4'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h1 style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 8px 0' }}>Easy Eat</h1>
                <p style={{ margin: '4px 0' }}>123 Food Street, Karachi</p>
                <p style={{ margin: '4px 0' }}>Thank you for your visit!</p>
            </div>
            
            <p style={{ margin: '8px 0' }}>Date: {saleTime.toLocaleString()}</p>
            
            <hr style={{ 
                border: 'none', 
                borderTop: '1px dashed black', 
                margin: '8px 0' 
            }} />
            
            <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                marginBottom: '8px'
            }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '2px 4px 2px 0' }}>Item</th>
                        <th style={{ textAlign: 'center', padding: '2px 2px' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '2px 2px' }}>Price</th>
                        <th style={{ textAlign: 'right', padding: '2px 0 2px 4px' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map(item => (
                        <tr key={item.id}>
                            <td style={{ textAlign: 'left', padding: '2px 4px 2px 0' }}>
                                {item.name}
                            </td>
                            <td style={{ textAlign: 'center', padding: '2px 2px' }}>
                                {item.quantity}
                            </td>
                            <td style={{ textAlign: 'right', padding: '2px 2px' }}>
                                {item.price.toFixed(0)}
                            </td>
                            <td style={{ textAlign: 'right', padding: '2px 0 2px 4px' }}>
                                {(item.price * item.quantity).toFixed(0)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <hr style={{ 
                border: 'none', 
                borderTop: '1px dashed black', 
                margin: '8px 0' 
            }} />
            
            <div style={{ textAlign: 'right', fontWeight: 'bold', marginBottom: '16px' }}>
                <p style={{ margin: '4px 0' }}>TOTAL: PKR {sale.total.toFixed(0)}</p>
                <p style={{ margin: '4px 0' }}>Paid via: {sale.paymentMethod}</p>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <p style={{ margin: '0' }}>Come Again!</p>
            </div>
        </div>
    );
});

PrintableReceipt.displayName = 'PrintableReceipt';
export default PrintableReceipt;