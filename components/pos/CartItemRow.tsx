import React from 'react';
import { CartItem } from '../../types';
import { TrashIcon, PlusIcon, MinusIcon } from '../../constants';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onUpdateQuantity }) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700/50">
      <div className="flex-grow pr-2">
        <p className="font-semibold leading-tight">{item.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">PKR {item.price.toFixed(0)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><MinusIcon /></button>
        <span className="w-8 text-center font-bold">{item.quantity}</span>
        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" disabled={item.quantity >= item.stock}><PlusIcon /></button>
      </div>
      <div className="w-20 text-right font-semibold">
        PKR {(item.price * item.quantity).toFixed(0)}
      </div>
       <button onClick={() => onUpdateQuantity(item.id, 0)} className="ml-2 text-red-500 hover:text-red-400 p-1">
          <TrashIcon />
       </button>
    </div>
  );
};

export default CartItemRow;