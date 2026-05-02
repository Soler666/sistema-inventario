import { useState, useEffect, useCallback } from 'react';
import { Alert, ApiResponse, DashboardAlerts } from '../types';

interface UseAlertsReturn {
  alerts: Alert[];
  dashboard: DashboardAlerts | null;
  loading: boolean;
  error: string | null;
  fetchAlerts: () => Promise<void>;
  resolveAlert: (id: string) => Promise<Alert | null>;
}

const API_BASE = '/api';

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dashboard, setDashboard] = useState<DashboardAlerts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/alerts`);
      const result: ApiResponse<Alert[]> = await response.json();
      if (result.success) {
        setAlerts(result.data);
      } else {
        setError(result.error || 'Failed to fetch alerts');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/alerts/dashboard`);
      const result: ApiResponse<DashboardAlerts> = await response.json();
      if (result.success) {
        setDashboard(result.data);
      } else {
        setError(result.error || 'Failed to fetch dashboard');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (id: string): Promise<Alert | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/alerts/${id}/resolve`, {
        method: 'PUT',
      });
      const result: ApiResponse<Alert> = await response.json();
      if (result.success) {
        await fetchAlerts();
        await fetchDashboard();
        return result.data;
      } else {
        setError(result.error || 'Failed to resolve alert');
        return null;
      }
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAlerts, fetchDashboard]);

  useEffect(() => {
    fetchAlerts();
    fetchDashboard();
  }, [fetchAlerts, fetchDashboard]);

  return {
    alerts,
    dashboard,
    loading,
    error,
    fetchAlerts,
    resolveAlert,
  };
}
