import { Product, Sale, Expense } from '../types';
import { supabase } from './supabaseClient';
import { 
    fetchInitialData as fetchInitialDataMock,
    addProductApi,
    updateProductApi,
    addSaleApi,
    addExpenseApi
} from './mockApi';

// Check if Supabase is available
const isSupabaseAvailable = () => {
    const available = supabase !== null;
    console.log('Supabase available:', available, supabase ? 'Connected' : 'Not connected');
    return available;
};

// Products API
export const fetchProducts = async (): Promise<Product[]> => {
    if (isSupabaseAvailable()) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.warn('Supabase products fetch failed, using mock data:', error);
        }
    }
    
    // Fallback to mock data
    const mockData = await fetchInitialDataMock();
    return mockData.products;
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    if (isSupabaseAvailable()) {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Supabase add product failed, using mock data:', error);
        }
    }
    
    // Fallback to mock data
    return await addProductApi(productData);
};

export const updateProduct = async (productData: Product): Promise<Product> => {
    if (isSupabaseAvailable()) {
        try {
            const { data, error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', productData.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Supabase update product failed, using mock data:', error);
        }
    }
    
    // Fallback to mock data
    return await updateProductApi(productData);
};

// Sales API
export const fetchSales = async (): Promise<Sale[]> => {
    if (isSupabaseAvailable()) {
        try {
            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .order('timestamp', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.warn('Supabase sales fetch failed, using mock data:', error);
        }
    }
    
    // Fallback to mock data
    const mockData = await fetchInitialDataMock();
    return mockData.sales;
};

export const addSale = async (saleData: Omit<Sale, 'id' | 'timestamp'>): Promise<Sale> => {
    if (isSupabaseAvailable()) {
        try {
            const saleWithTimestamp = {
                ...saleData,
                timestamp: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('sales')
                .insert([saleWithTimestamp])
                .select()
                .single();

            if (error) throw error;

            // Update product stock
            for (const item of saleData.items) {
                const { error: stockError } = await supabase
                    .from('products')
                    .update({ stock: supabase.raw(`stock - ${item.quantity}`) })
                    .eq('id', item.id);

                if (stockError) {
                    console.warn('Error updating product stock:', stockError);
                }
            }

            return data;
        } catch (error) {
            console.warn('Supabase add sale failed, using mock data:', error);
        }
    }
    
    // Fallback to mock data
    return await addSaleApi(saleData);
};

// Expenses API
export const fetchExpenses = async (): Promise<Expense[]> => {
    if (isSupabaseAvailable()) {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.warn('Supabase expenses fetch failed, using mock data:', error);
        }
    }
    
    // Fallback to mock data
    const mockData = await fetchInitialDataMock();
    return mockData.expenses;
};

export const addExpense = async (expenseData: Omit<Expense, 'id' | 'date'>): Promise<Expense> => {
    if (isSupabaseAvailable()) {
        try {
            const expenseWithDate = {
                ...expenseData,
                date: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('expenses')
                .insert([expenseWithDate])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.warn('Supabase add expense failed, using mock data:', error);
        }
    }
    
    // Fallback to mock data
    return await addExpenseApi(expenseData);
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
