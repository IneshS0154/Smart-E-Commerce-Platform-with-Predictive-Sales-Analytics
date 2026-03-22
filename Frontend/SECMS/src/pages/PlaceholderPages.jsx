import React from 'react';
import { Package, ShoppingCart, Star, Percent, Truck, Settings } from 'lucide-react';

const PlaceholderPage = ({ title, icon: Icon, description }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="w-20 h-20 bg-black text-white flex items-center justify-center mb-6">
        <Icon size={40} />
      </div>
      <h1 className="text-4xl font-bold uppercase tracking-wider text-black mb-4">
        {title}
      </h1>
      <p className="text-gray-500 text-center max-w-md">
        {description || 'This module is under development. Check back soon!'}
      </p>
    </div>
  );
};

export const ProductsPage = () => (
  <PlaceholderPage 
    title="Products" 
    icon={Package}
    description="Manage your product inventory. Add, edit, and organize your clothing & apparel catalog."
  />
);

export const OrdersPage = () => (
  <PlaceholderPage 
    title="Orders" 
    icon={ShoppingCart}
    description="View and manage customer orders, track shipments, and handle fulfillment."
  />
);

export const ReviewsPage = () => (
  <PlaceholderPage 
    title="Reviews" 
    icon={Star}
    description="Monitor customer reviews and feedback for your products."
  />
);

export const PromotionsPage = () => (
  <PlaceholderPage 
    title="Promotions" 
    icon={Percent}
    description="Create and manage promotional campaigns, discounts, and special offers."
  />
);

export const SuppliersPage = () => (
  <PlaceholderPage 
    title="Suppliers" 
    icon={Truck}
    description="Manage your supplier relationships and product sourcing."
  />
);

export const SettingsPage = () => (
  <PlaceholderPage 
    title="Settings" 
    icon={Settings}
    description="Configure your account settings and preferences."
  />
);

export default PlaceholderPage;
