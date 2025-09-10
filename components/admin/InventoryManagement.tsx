import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import Card from '../common/Card';
// FIX: Ensure Product and AppContextType are imported from a valid module.
import { Product, AppContextType } from '../../types';
import ProductEditModal from './ProductEditModal';
import { exportToCsv } from '../../utils/csvExporter';
import { DownloadIcon } from '../../constants';

const InventoryManagement: React.FC = () => {
    // FIX: Explicitly type context to allow property access.
    const context = useContext(AppContext) as AppContextType | null;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    if(!context) return null;
    const { products, addProduct, updateProduct } = context;

    const handleOpenModal = (product: Product | null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    const handleSaveProduct = async (productData: Product | Omit<Product, 'id'>) => {
        if ('id' in productData) {
            await updateProduct(productData as Product);
        } else {
            await addProduct(productData as Omit<Product, 'id'>);
        }
        handleCloseModal();
    };

    const handleExport = () => {
        const dataToExport = products.map(({ id, name, category, price, cost, stock }) => ({ id, name, category, price, cost, stock }));
        exportToCsv('inventory', dataToExport);
    };
    
    const sortedProducts = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name)), [products]);

    return (
        <>
            <Card className="p-6">
                 <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Inventory</h3>
                     <div className="flex gap-2">
                        <button onClick={handleExport} className="bg-gray-200 dark:bg-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                            <DownloadIcon /> Export
                        </button>
                        <button onClick={() => handleOpenModal(null)} className="bg-primary text-primary-content px-4 py-2 rounded-lg hover:bg-primary-focus transition-colors duration-200 text-sm font-semibold">
                            Add Product
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Product</th>
                                <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                                <th className="p-2 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-light-text dark:text-dark-text">
                            {sortedProducts.map((product: Product) => (
                                <tr 
                                    key={product.id} 
                                    className={`border-b border-gray-200 dark:border-gray-700/50 transition-colors ${product.stock < 10 ? 'bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                >
                                    <td className="p-2 font-semibold">{product.name}</td>
                                    <td className="p-2">{product.category}</td>
                                    <td className="p-2">PKR {product.price.toFixed(0)}</td>
                                    <td className={`p-2 font-bold ${product.stock < 10 ? 'text-red-500' : ''}`}>{product.stock}</td>
                                    <td className="p-2">
                                        <button onClick={() => handleOpenModal(product)} className="text-primary hover:underline text-sm">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {isModalOpen && (
                <ProductEditModal 
                    product={editingProduct}
                    onSave={handleSaveProduct}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};

export default InventoryManagement;