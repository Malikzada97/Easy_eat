
import React, { useContext, useMemo } from 'react';
import { AppContext } from './contexts/AppContext';
import PosView from './components/PosView';
import AdminView from './components/AdminView';
import { LogoIcon } from './constants';
import ThemeToggle from './components/common/ThemeToggle';
import { UserRole, AppContextType } from './types';

const App: React.FC = () => {
  // FIX: Cast context to AppContextType after null check to inform TypeScript about available properties.
  const context = useContext(AppContext) as AppContextType | null;

  if (!context) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="text-xl font-semibold">Initializing...</div>
      </div>
    );
  }

  const { theme, userRole, setUserRole, products, isLoading } = context;

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const lowStockCount = useMemo(() => products.filter(p => p.stock < 10).length, [products]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="flex flex-col items-center gap-4">
            <LogoIcon />
            <h1 className="text-2xl font-bold tracking-tight animate-pulse">Loading Business Data...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans text-light-text dark:text-dark-text">
      <header className="sticky top-0 z-30 p-4 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <h1 className="text-2xl font-bold tracking-tight">Easy Eat</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
               <select 
                 value={userRole} 
                 onChange={(e) => setUserRole(e.target.value as UserRole)}
                 className="bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
               >
                 <option value={UserRole.CASHIER}>Cashier View</option>
                 <option value={UserRole.ADMIN}>Admin View</option>
               </select>
               {userRole === UserRole.ADMIN && lowStockCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md animate-pulse">
                  {lowStockCount}
                </span>
               )}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {userRole === UserRole.CASHIER ? <PosView /> : <AdminView />}
      </main>
    </div>
  );
};

export default App;