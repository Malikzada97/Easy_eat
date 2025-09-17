import { supabase } from './supabaseClient';
import { Product, Sale, Expense } from '../types';

// Check if Supabase is available
const isSupabaseAvailable = () => {
    return supabase !== null;
};

// Products API
export const fetchProducts = async (): Promise<Product[]> => {
    if (!isSupabaseAvailable()) {
        throw new Error('Supabase not available');
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching products:', error);
        throw error;
    }

    return data || [];
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    if (!isSupabaseAvailable()) {
        throw new Error('Supabase not available');
    }

    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

    if (error) {
        console.error('Error adding product:', error);
        throw error;
    }

    return data;
};

export const updateProduct = async (productData: Product): Promise<Product> => {
    if (!isSupabaseAvailable()) {
        throw new Error('Supabase not available');
    }

    const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productData.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating product:', error);
        throw error;
    }

    return data;
};

// Sales API
export const fetchSales = async (): Promise<Sale[]> => {
    if (!isSupabaseAvailable()) {
        throw new Error('Supabase not available');
    }

    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('timestamp', { ascending: false });

    if (error) {
        console.error('Error fetching sales:', error);
        throw error;
    }

    return data || [];
};

export const addSale = async (saleData: Omit<Sale, 'id' | 'timestamp'>): Promise<Sale> => {
    if (!isSupabaseAvailable()) {
        throw new Error('Supabase not available');
    }

    // Map paymentMethod to payment_method for Supabase
    const saleWithTimestamp = {
        ...saleData,
        payment_method: saleData.paymentMethod,
        timestamp: new Date().toISOString()
    };
    // Remove paymentMethod field to avoid column mismatch
    delete (saleWithTimestamp as any).paymentMethod;

    const { data, error } = await supabase
        .from('sales')
        .insert([saleWithTimestamp])
        .select()
        .single();

    if (error) {
        console.error('Error adding sale:', error);
        throw error;
    }

    // Update product stock
    for (const item of saleData.items) {
        const { error: stockError } = await supabase
            .from('products')
            .update({ stock: supabase.raw(`stock - ${item.quantity}`) })
            .eq('id', item.id);

        if (stockError) {
            console.error('Error updating product stock:', stockError);
        }
    }

    return data;
};

// Expenses API
export const fetchExpenses = async (): Promise<Expense[]> => {
    if (!isSupabaseAvailable()) {
        throw new Error('Supabase not available');
    }

    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
    }

    return data || [];
};

export const addExpense = async (expenseData: Omit<Expense, 'id' | 'date'>): Promise<Expense> => {
    if (!isSupabaseAvailable()) {
        throw new Error('Supabase not available');
    }

    const expenseWithDate = {
        ...expenseData,
        date: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('expenses')
        .insert([expenseWithDate])
        .select()
        .single();

    if (error) {
        console.error('Error adding expense:', error);
        throw error;
    }

    return data;
};

// Combined initial data fetch
export const fetchInitialData = async () => {
    try {
        const [products, sales, expenses] = await Promise.all([
            fetchProducts(),
            fetchSales(),
            fetchExpenses()
        ]);

        return { products, sales, expenses };
    } catch (error) {
        console.error('Error fetching initial data:', error);
        throw error;
    }
};
