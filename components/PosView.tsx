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
    const [lastSale, setLastSale] = useState<Omit<Sale, 'id' | 'timestamp'> | null>(null);

    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const receiptElement = receiptRef.current;
        if (!receiptElement) return;

        const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=400,height=600');
        if (!printWindow) return;

        const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Receipt</title>
    <style>
      body { background: white; color: black; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .font-bold { font-weight: 700; }
      .text-xs { font-size: 12px; }
      .w-\[300px\] { width: 300px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { padding: 2px 0; }
      hr { border: 0; border-top: 1px dashed #000; margin: 8px 0; }
      .p-4 { padding: 16px; }
      .mb-4 { margin-bottom: 16px; }
      .pl-1 { padding-left: 4px; }
      .pr-1 { padding-right: 4px; }
    </style>
  </head>
  <body>
    ${receiptElement.outerHTML}
    <script>window.focus(); window.print(); setTimeout(() => window.close(), 300);<\/script>
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
        
        const saleData = { items: cart, total, paymentMethod };
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