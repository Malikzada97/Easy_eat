// FIX: Define all application-wide types in this file.

export enum UserRole {
  CASHIER = 'cashier',
  ADMIN = 'admin',
}

export enum PaymentMethod {
  CASH = 'Cash',
  CARD = 'Card',
  MOBILE = 'Mobile Wallet',
}

export enum ExpenseCategory {
  FOOD_COST = 'Food & Beverage Cost',
  UTILITIES = 'Utilities',
  RENT = 'Rent/Lease',
  SALARIES = 'Salaries & Wages',
  MARKETING = 'Marketing',
  OTHER = 'Other',
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
  notes?: string;
}

export interface Sale {
  id: string; // Using string for UUIDs or more complex IDs
  items: CartItem[];
  total: number;
  timestamp: Date;
  paymentMethod: PaymentMethod;
  customer?: {
    name: string;
    phone: string;
  }
}

export interface Expense {
    id: number;
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: Date;
}

export interface AiInsight {
  summary: string;
  data: { label: string; value: number }[];
  chartType: 'bar' | 'line' | 'pie';
}

export interface InventoryForecast {
    productId: number;
    productName: string;
    currentStock: number;
    predictedWeeklySales: number;
    suggestedReorderQuantity: number;
    reasoning: string;
}

export interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'timestamp'>) => Promise<void>;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Promise<void>;
  isLoading: boolean;
}
