import React from 'react';
import Card from '../common/Card';
// FIX: Correctly import Product type from a valid module.
import { Product } from '../../types';

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product) => void }> = ({ product, onAddToCart }) => (
  <Card className="flex flex-col overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
    <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="font-bold text-lg">{product.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
      <div className="mt-auto flex justify-between items-center pt-4">
        <p className="text-xl font-semibold">PKR {product.price.toFixed(0)}</p>
        <button 
            onClick={() => onAddToCart(product)}
            className="bg-primary text-primary-content px-4 py-2 rounded-lg hover:bg-primary-focus transition-colors duration-200 disabled:bg-gray-400"
            disabled={product.stock <= 0}
        >
          {product.stock > 0 ? 'Add' : 'Out'}
        </button>
      </div>
    </div>
  </Card>
);

export default ProductCard;
