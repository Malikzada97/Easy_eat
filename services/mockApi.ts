import { Product, Sale, Expense, ExpenseCategory, PaymentMethod } from '../types';

// Mock data generation for a more realistic application feel
const generateMockProducts = (): Product[] => {
    return [
      { id: 1, name: 'Chicken Karahi', category: 'Karahi & Gravy', price: 1200, cost: 450, stock: 50, imageUrl: 'https://source.unsplash.com/400x300/?karahi' },
      { id: 2, name: 'Mutton Karahi', category: 'Karahi & Gravy', price: 1800, cost: 700, stock: 35, imageUrl: 'https://source.unsplash.com/400x300/?mutton' },
      { id: 3, name: 'Chicken Tikka', category: 'BBQ & Grills', price: 600, cost: 200, stock: 80, imageUrl: 'https://source.unsplash.com/400x300/?tikka' },
      { id: 4, name: 'Beef Seekh Kebab', category: 'BBQ & Grills', price: 750, cost: 280, stock: 65, imageUrl: 'https://source.unsplash.com/400x300/?kebab' },
      { id: 5, name: 'Chicken Biryani', category: 'Rice Dishes', price: 550, cost: 180, stock: 120, imageUrl: 'https://source.unsplash.com/400x300/?biryani' },
      { id: 6, name: 'Plain Naan', category: 'Breads', price: 50, cost: 15, stock: 300, imageUrl: 'https://source.unsplash.com/400x300/?naan' },
      { id: 7, name: 'Garlic Naan', category: 'Breads', price: 70, cost: 25, stock: 250, imageUrl: 'https://source.unsplash.com/400x300/?garlic+naan' },
      { id: 8, name: 'Soft Drink', category: 'Beverages', price: 100, cost: 40, stock: 500, imageUrl: 'https://source.unsplash.com/400x300/?soda' },
      { id: 9, name: 'Mineral Water', category: 'Beverages', price: 80, cost: 30, stock: 450, imageUrl: 'https://source.unsplash.com/400x300/?water+bottle' },
      { id: 10, name: 'Gulab Jamun', category: 'Desserts', price: 250, cost: 90, stock: 40, imageUrl: 'https://source.unsplash.com/400x300/?gulab+jamun' },
      { id: 11, name: 'Mutton Pulao', category: 'Rice Dishes', price: 850, cost: 350, stock: 9, imageUrl: 'https://source.unsplash.com/400x300/?pulao' },
    ];
};

const MOCK_PRODUCTS = generateMockProducts();

const generateMockSales = (): Sale[] => {
    const sales: Sale[] = [];
    const now = Date.now();
    for (let i = 0; i < 150; i++) {
        const saleItemsCount = Math.floor(Math.random() * 5) + 1;
        const items = [];
        let total = 0;
        for (let j = 0; j < saleItemsCount; j++) {
            const productIndex = Math.floor(Math.random() * MOCK_PRODUCTS.length);
            const product = MOCK_PRODUCTS[productIndex];
            const quantity = Math.floor(Math.random() * 3) + 1;
            items.push({ ...product, quantity });
            total += product.price * quantity;
        }
        const timestamp = new Date(now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) - Math.random() * 12 * 60 * 60 * 1000);
        sales.push({
            id: `sale-${i + 1}-${timestamp.getTime()}`,
            items,
            total,
            timestamp,
            paymentMethod: Object.values(PaymentMethod)[Math.floor(Math.random() * Object.values(PaymentMethod).length)],
        });
    }
    return sales.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const generateMockExpenses = (): Expense[] => {
  return [
    { id: 1, description: 'Weekly vegetable supply', amount: 15000, category: ExpenseCategory.FOOD_COST, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { id: 2, description: 'Electricity Bill', amount: 25000, category: ExpenseCategory.UTILITIES, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { id: 3, description: 'Staff Salaries - Oct', amount: 120000, category: ExpenseCategory.SALARIES, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { id: 4, description: 'Monthly Rent', amount: 80000, category: ExpenseCategory.RENT, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { id: 5, description: 'Social Media Ad Campaign', amount: 10000, category: ExpenseCategory.MARKETING, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { id: 6, description: 'Chicken and Meat order', amount: 45000, category: ExpenseCategory.FOOD_COST, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
};

const db = {
    products: generateMockProducts(),
    sales: generateMockSales(),
    expenses: generateMockExpenses(),
};

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchInitialData = async () => {
    await delay(1200); // Simulate network delay
    return {
        products: db.products,
        sales: db.sales,
        expenses: db.expenses,
    };
};

export const addProductApi = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    await delay(300);
    const newProduct: Product = {
        ...productData,
        id: Math.max(...db.products.map(p => p.id), 0) + 1,
    };
    db.products.push(newProduct);
    return newProduct;
};

export const updateProductApi = async (productData: Product): Promise<Product> => {
    await delay(300);
    const index = db.products.findIndex(p => p.id === productData.id);
    if (index !== -1) {
        db.products[index] = productData;
        return productData;
    }
    throw new Error("Product not found");
};

export const addSaleApi = async (saleData: Omit<Sale, 'id' | 'timestamp'>): Promise<Sale> => {
    await delay(500);
    const newSale: Sale = {
        ...saleData,
        id: `sale-${db.sales.length + 1}-${Date.now()}`,
        timestamp: new Date(),
    };
    db.sales.unshift(newSale); // Add to beginning of array
    // Update stock
    newSale.items.forEach(item => {
        const product = db.products.find(p => p.id === item.id);
        if (product) {
            product.stock -= item.quantity;
        }
    });
    return newSale;
};

export const addExpenseApi = async (expenseData: Omit<Expense, 'id' | 'date'>): Promise<Expense> => {
    await delay(300);
    const newExpense: Expense = {
        ...expenseData,
        id: Math.max(...db.expenses.map(e => e.id), 0) + 1,
        date: new Date(),
    };
    db.expenses.unshift(newExpense);
    return newExpense;
};
