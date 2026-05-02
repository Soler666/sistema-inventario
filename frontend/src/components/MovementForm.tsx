import { useState } from 'react';
import { Product } from '../types';

interface MovementFormProps {
  product: Product;
  onSubmit: (productId: string, type: 'ENTRY' | 'EXIT', quantity: number, reason?: string) => Promise<void>;
  onClose: () => void;
}

export function MovementForm({ product, onSubmit, onClose }: MovementFormProps) {
  const [type, setType] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(product.id, type, qty, reason || undefined);
    } catch (err) {
      setError('Failed to register movement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4">
      <div className="glass card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">Register Movement</h2>
          <button onClick={onClose} className="text-secondary hover:text-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4 p-3 rounded-lg bg-surface">
          <p className="text-sm font-medium text-primary">{product.name}</p>
          <p className="text-xs text-secondary">Current Stock: {product.currentStock} {product.unit}</p>
          <p className="text-xs text-secondary">Min Stock: {product.minStock} {product.unit}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('ENTRY')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                type === 'ENTRY'
                  ? 'bg-success text-white'
                  : 'bg-surface text-secondary'
              }`}
            >
              Entry (+)
            </button>
            <button
              type="button"
              onClick={() => setType('EXIT')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                type === 'EXIT'
                  ? 'bg-critical text-white'
                  : 'bg-surface text-secondary'
              }`}
            >
              Exit (-)
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input"
              placeholder="Enter quantity"
              min="1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-1.5">Reason (optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input"
              placeholder="Enter reason"
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
              {loading ? 'Processing...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
