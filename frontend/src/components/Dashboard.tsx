import { useState } from 'react';
import { Product, Alert } from '../types';
import { useProducts, getStockLevel } from '../hooks/useProducts';
import { useAlerts } from '../hooks/useAlerts';
import { useMovements } from '../hooks/useMovements';
import { ProductCard } from './ProductCard';
import { AlertItem } from './AlertItem';
import { ProductForm } from './ProductForm';
import { MovementForm } from './MovementForm';

export function Dashboard() {
  const { products, loading: loadingProducts, createProduct, fetchProducts } = useProducts();
  const { alerts, resolveAlert, fetchAlerts } = useAlerts();
  const { registerMovement } = useMovements();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'alerts'>('inventory');

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowMovementForm(true);
  };

  const handleCreateProduct = async (data: Partial<Product>) => {
    const result = await createProduct(data);
    if (result) {
      setShowProductForm(false);
      fetchProducts();
    }
  };

  const handleRegisterMovement = async (
    productId: string,
    type: 'ENTRY' | 'EXIT',
    quantity: number,
    reason?: string
  ) => {
    await registerMovement(productId, type, quantity, reason);
    setShowMovementForm(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleResolveAlert = async (id: string) => {
    await resolveAlert(id);
    fetchAlerts();
    fetchProducts();
  };

  const criticalProducts = products.filter(p => getStockLevel(p) === 'critical');

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-primary">Critical Inventory</h1>
            <div className="flex items-center gap-3">
              {alerts.length > 0 && (
                <button
                  onClick={() => setActiveTab(activeTab === 'inventory' ? 'alerts' : 'inventory')}
                  className="relative btn btn-secondary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {alerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-critical text-white text-xs rounded-full flex items-center justify-center">
                      {alerts.length}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setShowProductForm(true)}
                className="btn btn-primary"
              >
                + Add
              </button>
            </div>
          </div>
          
          <div className="flex gap-1 mt-4 bg-surface rounded-lg p-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-white text-primary shadow-soft'
                  : 'text-secondary'
              }`}
            >
              Inventory ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'alerts'
                  ? 'bg-white text-primary shadow-soft'
                  : 'text-secondary'
              }`}
            >
              Alerts ({alerts.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'inventory' ? (
          <div className="space-y-3">
            {criticalProducts.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-secondary mb-3">Critical Stock</h2>
                <div className="space-y-2">
                  {criticalProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={handleProductSelect}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <h2 className="text-sm font-medium text-secondary mb-3">
              {criticalProducts.length > 0 ? 'All Products' : 'Products'}
            </h2>
            <div className="space-y-2">
              {products
                .filter(p => getStockLevel(p) !== 'critical')
                .map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={handleProductSelect}
                  />
                ))}
              {products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-secondary">No products yet</p>
                  <button
                    onClick={() => setShowProductForm(true)}
                    className="btn btn-primary mt-4"
                  >
                    Add your first product
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map(alert => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onResolve={handleResolveAlert}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-primary font-medium">All clear!</p>
                <p className="text-sm text-secondary mt-1">No active alerts</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showProductForm && (
        <ProductForm
          onSubmit={handleCreateProduct}
          onClose={() => setShowProductForm(false)}
        />
      )}

      {showMovementForm && selectedProduct && (
        <MovementForm
          product={selectedProduct}
          onSubmit={handleRegisterMovement}
          onClose={() => {
            setShowMovementForm(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
