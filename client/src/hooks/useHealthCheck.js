import { useState, useEffect } from 'react';
import { checkHealth } from '../services/api';

export const useHealthCheck = () => {
  const [loading, setLoading] = useState(true);
  const [isHealthy, setIsHealthy] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await checkHealth();
      setHealthData(data);
      setIsHealthy(data.status === 'healthy');
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to connect to CommercePilot backend API');
      setIsHealthy(false);
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return {
    loading,
    isHealthy,
    healthData,
    error,
    refetch: fetchHealth
  };
};
