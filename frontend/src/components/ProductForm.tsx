import { useState } from 'react';
import { Product } from '../types';

interface ProductFormProps {
  onSubmit: (data: Partial<Product>) => Promise<void>;
  onClose: () => void;
}

export function ProductForm({ onSubmit, onClose }: ProductFormProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [minStock, setMinStock] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('units');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !sku.trim()) {
      setError('Name and SKU are required');
      return;
    }
    
    const minStockNum = parseInt(minStock, 10);
    if (isNaN(minStockNum) || minStockNum < 0) {
      setError('Min stock must be a positive number');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        sku: sku.trim(),
        minStock: minStockNum,
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        unit: unit.trim() || 'units',
      });
    } catch (err) {
      setError('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4">
      <div className="glass card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">Add Product</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Product name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">SKU *</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="input"
              placeholder="SKU code"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">Min Stock *</label>
            <input
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="input"
              placeholder="Minimum stock level"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">Unit</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input"
              placeholder="units, kg, liters, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
              placeholder="Category (optional)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="Description (optional)"
            />
          </div>
          
          {error && (
            <p className="text-sm text-critical">{error}</p>
          )}
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
