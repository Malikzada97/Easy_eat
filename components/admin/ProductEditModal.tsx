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
    const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');

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

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, imageUrl: url }));
    };

    const validateImageUrl = (url: string): boolean => {
        try {
            new URL(url);
            return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('unsplash.com') || url.includes('images.unsplash.com');
        } catch {
            return false;
        }
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
                        
                        {/* Image Preview */}
                        <div className="mt-1 mb-3">
                            {formData.imageUrl && (
                                <div className="relative inline-block">
                                    <img 
                                        src={formData.imageUrl} 
                                        alt="Product Preview" 
                                        className="w-24 h-24 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96x96?text=Invalid+Image';
                                        }}
                                    />
                                    {!validateImageUrl(formData.imageUrl) && formData.imageUrl && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">!</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Input Mode Toggle */}
                        <div className="flex gap-2 mb-3">
                            <button
                                type="button"
                                onClick={() => setImageInputMode('upload')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    imageInputMode === 'upload'
                                        ? 'bg-primary text-primary-content'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                Upload File
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageInputMode('url')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    imageInputMode === 'url'
                                        ? 'bg-primary text-primary-content'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                                Paste URL
                            </button>
                        </div>

                        {/* File Upload Mode */}
                        {imageInputMode === 'upload' && (
                            <div>
                                <label htmlFor="imageUpload" className={`cursor-pointer w-full inline-block bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-center transition-colors ${uploadProgress !== null ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                    <span>
                                      {uploadProgress !== null ? `Uploading... ${uploadProgress}%` : 'Choose Image File'}
                                    </span>
                                </label>
                                <input 
                                    id="imageUpload" 
                                    type="file" 
                                    name="imageUpload" 
                                    accept="image/png, image/jpeg, image/webp, image/gif"
                                    onChange={handleImageChange} 
                                    className="hidden" 
                                    disabled={uploadProgress !== null}
                                />
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
                        )}

                        {/* URL Input Mode */}
                        {imageInputMode === 'url' && (
                            <div>
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={formData.imageUrl}
                                    onChange={handleImageUrlChange}
                                    className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                                
                                {/* Quick URL Presets */}
                                <div className="mt-2">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quick presets:</div>
                                    <div className="flex flex-wrap gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: 'https://source.unsplash.com/400x300/?food' }))}
                                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                        >
                                            Food
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: 'https://source.unsplash.com/400x300/?burger' }))}
                                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                        >
                                            Burger
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: 'https://source.unsplash.com/400x300/?pizza' }))}
                                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                        >
                                            Pizza
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: 'https://source.unsplash.com/400x300/?drink' }))}
                                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                        >
                                            Drink
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: 'https://source.unsplash.com/400x300/?dessert' }))}
                                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                        >
                                            Dessert
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Paste an image URL (supports JPG, PNG, WebP, GIF, SVG, or Unsplash links)
                                </div>
                                {formData.imageUrl && !validateImageUrl(formData.imageUrl) && (
                                    <div className="mt-1 text-xs text-red-500">
                                        ⚠️ This doesn't look like a valid image URL
                                    </div>
                                )}
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
