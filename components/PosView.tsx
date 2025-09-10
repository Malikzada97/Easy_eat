import React, { useContext, useState, useMemo, useRef } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Product, CartItem, PaymentMethod, AppContextType, Sale } from '../types';
import ProductCard from './pos/ProductCard';
import CartItemRow from './pos/CartItemRow';
import Card from './common/Card';
import PrintableReceipt from './PrintableReceipt';
import { CartIconLarge, PrinterIcon } from '../constants';

const PosView: React.FC = () => {
    const context = useContext(AppContext) as AppContextType | null;
    
    if (!context) return null;
    const { products, addSale } = context;

    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [lastSale, setLastSale] = useState<Omit<Sale, 'id'> | null>(null);

    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (!lastSale) {
            console.error('No sale data available for printing');
            return;
        }

        console.log('Printing receipt for sale:', lastSale);
        
        // Create receipt HTML directly instead of relying on hidden element
        const saleTime = lastSale.timestamp || new Date();
        const receiptHTML = `
            <div style="padding: 16px; background: white; color: black; font-family: monospace; font-size: 12px; width: 300px;">
                <div style="text-align: center; margin-bottom: 16px;">
                    <h1 style="font-weight: 700; font-size: 18px; margin: 0;">Easy Eat</h1>
                    <p style="margin: 4px 0;">123 Food Street, Karachi</p>
                    <p style="margin: 4px 0;">Thank you for your visit!</p>
                </div>
                <p style="margin: 8px 0;">Date: ${saleTime.toLocaleString()}</p>
                <hr style="border: 0; border-top: 1px dashed #000; margin: 8px 0;" />
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 2px 0;">Item</th>
                            <th style="text-align: center; padding: 2px 0;">Qty</th>
                            <th style="text-align: right; padding: 2px 0;">Price</th>
                            <th style="text-align: right; padding: 2px 0;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lastSale.items.map(item => `
                            <tr>
                                <td style="text-align: left; padding-right: 4px;">${item.name}</td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: right; padding-left: 4px;">${item.price.toFixed(0)}</td>
                                <td style="text-align: right; padding-left: 4px;">${(item.price * item.quantity).toFixed(0)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <hr style="border: 0; border-top: 1px dashed #000; margin: 8px 0;" />
                <div style="text-align: right; font-weight: 700;">
                    <p style="margin: 4px 0;">TOTAL: PKR ${lastSale.total.toFixed(0)}</p>
                    <p style="margin: 4px 0;">Paid via: ${lastSale.paymentMethod}</p>
                </div>
                <div style="text-align: center; margin-top: 16px;">
                    <p style="margin: 0;">Come Again!</p>
                </div>
            </div>
        `;

        const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=400,height=600');
        if (!printWindow) {
            // Fallback: try to print the current page
            window.print();
            setLastSale(null);
            return;
        }

        const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Receipt - Easy Eat</title>
    <style>
      body { 
        background: white; 
        color: black; 
        font-family: monospace;
        margin: 0;
        padding: 0;
      }
      @media print {
        body { margin: 0; }
        @page { margin: 0.5in; }
      }
    </style>
  </head>
  <body>
    ${receiptHTML}
    <script>
      window.onload = function() {
        setTimeout(function() {
          window.focus();
          window.print();
          setTimeout(function() {
            window.close();
          }, 1000);
        }, 100);
      };
    </script>
  </body>
 </html>`;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        setLastSale(null);
    };

    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                 if (existingItem.quantity < product.stock) {
                    return prevCart.map(item =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                }
                return prevCart; // Do not add if stock limit reached
            }
            if (product.stock > 0) {
                 return [...prevCart, { ...product, quantity: 1 }];
            }
            return prevCart;
        });
    };

    const updateQuantity = (productId: number, newQuantity: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        if (newQuantity <= 0) {
            setCart(prevCart => prevCart.filter(item => item.id !== productId));
        } else if (newQuantity <= product.stock) {
            setCart(prevCart => prevCart.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            ));
        }
    };
    
    const clearCart = () => {
        setCart([]);
    };

    const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

    const handleCheckout = async (paymentMethod: PaymentMethod) => {
        if (cart.length === 0) return;
        
        const saleData = { items: cart, total, paymentMethod, timestamp: new Date() };
        await addSale(saleData);
        setLastSale(saleData);
        clearCart();
    };

    const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);
    
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, searchTerm, selectedCategory]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <Card className="p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="flex-grow p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                    ))}
                </div>
            </div>
            <div className="lg:col-span-1 sticky top-24">
               <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Current Order</h2>
                    {cart.length > 0 ? (
                        <div className="flex flex-col h-full">
                            <div className="overflow-y-auto max-h-96 pr-2 -mr-2">
                                {cart.map(item => (
                                    <CartItemRow key={item.id} item={item} onUpdateQuantity={updateQuantity} />
                                ))}
                            </div>
                            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between font-bold text-lg mb-4">
                                    <span>Total</span>
                                    <span>PKR {total.toFixed(0)}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                     {Object.values(PaymentMethod).map(method => (
                                        <button key={method} onClick={() => handleCheckout(method)} className="bg-primary text-primary-content text-sm py-2 px-1 rounded-lg hover:bg-primary-focus transition-colors duration-200">
                                            {method}
                                        </button>
                                     ))}
                                </div>
                                <button onClick={clearCart} className="w-full mt-2 bg-red-600/20 text-red-500 py-2 rounded-lg hover:bg-red-600/30 transition-colors duration-200">
                                    Clear Cart
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-gray-300 dark:text-gray-600"><CartIconLarge /></div>
                            <p className="mt-4 text-gray-500">Your cart is empty.</p>
                            <p className="text-sm text-gray-400">Add products to get started.</p>
                        </div>
                    )}
                     {lastSale && (
                        <div className="mt-4 p-4 bg-green-500/10 rounded-lg text-center">
                            <p className="font-semibold text-green-400">Sale Completed!</p>
                            <button onClick={handlePrint} className="mt-2 text-sm flex items-center justify-center gap-2 mx-auto text-primary hover:underline">
                                <PrinterIcon /> Print Receipt
                            </button>
                        </div>
                    )}
                </Card>
                <div className="hidden">
                    {lastSale && <PrintableReceipt ref={receiptRef} sale={lastSale} />}
                </div>
            </div>
        </div>
    );
};
export default PosView;