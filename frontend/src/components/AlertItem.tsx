import { Alert } from '../types';

interface AlertItemProps {
  alert: Alert;
  onResolve: (id: string) => void;
}

export function AlertItem({ alert, onResolve }: AlertItemProps) {
  const isOutOfStock = alert.type === 'OUT_OF_STOCK';

  return (
    <div className="card p-4 fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-2 h-2 rounded-full mt-2 ${isOutOfStock ? 'bg-critical' : 'bg-warning'}`} />
          <div>
            <p className="text-sm font-medium text-primary">{alert.message}</p>
            <p className="text-xs text-secondary mt-1">
              {new Date(alert.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onResolve(alert.id)}
          className="btn btn-secondary text-xs"
        >
          Resolve
        </button>
      </div>
    </div>
  );
}
