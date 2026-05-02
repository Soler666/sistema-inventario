import { Product } from '../types';
import { getStockLevel } from '../hooks/useProducts';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const stockLevel = getStockLevel(product);
  
  const levelStyles = {
    critical: 'stock-critical',
    warning: 'stock-warning',
    healthy: 'stock-healthy',
  };
  
  const levelLabels = {
    critical: 'Critical',
    warning: 'Low',
    healthy: 'OK',
  };

  return (
    <div 
      className="card p-4 cursor-pointer fade-in"
      onClick={() => onSelect(product)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-primary">{product.name}</h3>
          <p className="text-sm text-secondary mt-1">SKU: {product.sku}</p>
          {product.category && (
            <p className="text-xs text-secondary mt-1">{product.category}</p>
          )}
        </div>
        
        <div className="text-right">
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${levelStyles[stockLevel]}`}>
            {levelLabels[stockLevel]}
          </div>
          <p className="text-lg font-semibold text-primary mt-2">
            {product.currentStock}
            <span className="text-sm font-normal text-secondary">/{product.minStock}</span>
          </p>
          <p className="text-xs text-secondary">{product.unit}</p>
        </div>
      </div>
    </div>
  );
}
