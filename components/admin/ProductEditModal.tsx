import React, { useState, useEffect } from 'react';
// FIX: Correctly import Product type from a valid module.
import { Product } from '../../types';
import Card from '../common/Card';

interface ProductEditModalProps {
    product: Product | null;
    onSave: (productData: Product | Omit<Product, 'id'>) => void;
    onClose: () => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ product, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        imageUrl: '',
        cost: '',
    });
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                category: product.category,
                price: String(product.price),
                stock: String(product.stock),
                imageUrl: product.imageUrl,
                cost: String(product.cost || ''),
            });
        } else {
            setFormData({ name: '', category: '', price: '', stock: '', imageUrl: 'https://source.unsplash.com/400x300/?food', cost: '' });
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            setUploadProgress(0); // Start progress and show bar

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    // Stop before 100 to let the file reader finish
                    if (prev === null || prev >= 95) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 5;
                });
            }, 50); // Update every 50ms

            reader.onloadend = () => {
                clearInterval(progressInterval);
                setUploadProgress(100);
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
                
                // Hide progress bar after a short delay
                setTimeout(() => {
                    setUploadProgress(null);
                }, 500);
            };
            
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productData = {
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price) || 0,
            stock: parseInt(formData.stock, 10) || 0,
            cost: parseFloat(formData.cost) || 0,
            imageUrl: formData.imageUrl,
        };

        if (product) {
            onSave({ ...product, ...productData });
        } else {
            onSave(productData);
        }
    };

    const uniqueCategories = ['BBQ & Grills', 'Karahi & Gravy', 'Rice Dishes', 'Breads', 'Beverages', 'Desserts'];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <Card className="w-full max-w-lg p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">{product ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400">Product Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg" required />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-400">Category</label>
                        <select name="category" id="category" value={formData.category} onChange={handleChange} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg" required>
                            <option value="" disabled>Select a category</option>
                            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-400">Price (PKR)</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg" required />
                        </div>
                        <div>
                            <label htmlFor="cost" className="block text-sm font-medium text-gray-400">Cost (PKR)</label>
                            <input type="number" name="cost" id="cost" value={formData.cost} onChange={handleChange} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg" required />
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-400">Stock</label>
                            <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} className="w-full mt-1 p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Product Image</label>
                        <div className="mt-1 flex items-center gap-4">
                            {formData.imageUrl && <img src={formData.imageUrl} alt="Product Preview" className="w-20 h-20 rounded-lg object-cover" />}
                            <div className="flex-grow">
                                <label htmlFor="imageUpload" className={`cursor-pointer w-full inline-block bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-center transition-colors ${uploadProgress !== null ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                    <span>
                                      {uploadProgress !== null ? `Uploading... ${uploadProgress}%` : 'Upload Image'}
                                    </span>
                                </label>
                                <input 
                                    id="imageUpload" 
                                    type="file" 
                                    name="imageUpload" 
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleImageChange} 
                                    className="hidden" 
                                    disabled={uploadProgress !== null}
                                />
                            </div>
                        </div>
                        {uploadProgress !== null && (
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2 overflow-hidden">
                                <div 
                                    className="bg-primary h-2.5 rounded-full" 
                                    style={{ width: `${uploadProgress}%`, transition: 'width 0.1s linear' }}
                                >
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled={uploadProgress !== null}>Cancel</button>
                        <button type="submit" className="bg-primary text-primary-content py-2 px-4 rounded-lg font-semibold hover:bg-primary-focus disabled:opacity-50 disabled:cursor-not-allowed" disabled={uploadProgress !== null}>Save Product</button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ProductEditModal;
