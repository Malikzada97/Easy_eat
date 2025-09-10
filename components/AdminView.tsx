import React from 'react';
import AiQuery from './admin/AiQuery';
import DashboardMetrics from './admin/DashboardMetrics';
import SalesChart from './admin/SalesChart';
import InventoryManagement from './admin/InventoryManagement';
import ProductProfitability from './admin/ProductProfitability';
import InventoryForecasting from './admin/InventoryForecasting';
// FIX: Ensure RecentSales is a valid module by providing its content.
import RecentSales from './admin/RecentSales';
import ExpenseTracker from './admin/ExpenseTracker';
import ExpenseChart from './admin/ExpenseChart';

const AdminView: React.FC = () => {
  return (
    <div className="space-y-8">
      <DashboardMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <SalesChart />
        </div>
        <div className="lg:col-span-2 space-y-8">
            <AiQuery />
            <InventoryForecasting />
        </div>
      </div>

      <InventoryManagement />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2"><RecentSales /></div>
          <ProductProfitability/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2"><ExpenseTracker /></div>
          <ExpenseChart />
      </div>
    </div>
  );
};

export default AdminView;
