import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Product, Sale, Expense, UserRole, AppContextType } from '../types';
import { fetchInitialData, addProduct, updateProduct, addSale, addExpense } from '../services/api';

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [userRole, setUserRole] = useState<UserRole>(UserRole.CASHIER);
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchInitialData();
                setProducts(data.products);
                setSales(data.sales);
                setExpenses(data.expenses);
            } catch (error) {
                console.error("Failed to load initial data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const addProductHandler = async (productData: Omit<Product, 'id'>) => {
        const newProduct = await addProduct(productData);
        setProducts(prev => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const updateProductHandler = async (productData: Product) => {
        const updatedProduct = await updateProduct(productData);
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p).sort((a, b) => a.name.localeCompare(b.name)));
    };

    const addSaleHandler = async (saleData: Omit<Sale, 'id' | 'timestamp'>) => {
        const newSale = await addSale(saleData);
        setSales(prev => [newSale, ...prev]);
        // Also update product stock in the state
        newSale.items.forEach(item => {
            setProducts(prevProducts => prevProducts.map(p => 
                p.id === item.id ? { ...p, stock: p.stock - item.quantity } : p
            ));
        });
    };
    
    const addExpenseHandler = async (expenseData: Omit<Expense, 'id'| 'date'>) => {
        const newExpense = await addExpense(expenseData);
        setExpenses(prev => [newExpense, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
    };

    const value: AppContextType = {
        theme,
        toggleTheme,
        userRole,
        setUserRole,
        products,
        addProduct: addProductHandler,
        updateProduct: updateProductHandler,
        sales,
        addSale: addSaleHandler,
        expenses,
        addExpense: addExpenseHandler,
        isLoading,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
