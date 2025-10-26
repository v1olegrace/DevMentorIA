import { useState, useEffect } from 'react';
import { supabaseConfig } from '../../supabase-config';

// Hook para integração com Supabase do Loveable
export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se as configurações do Supabase estão disponíveis
    if (supabaseConfig.url && supabaseConfig.publishableKey) {
      setIsConnected(true);
    } else {
      setError('Configurações do Supabase não encontradas');
    }
  }, []);

  const getConfig = () => ({
    url: supabaseConfig.url,
    key: supabaseConfig.publishableKey,
    projectId: supabaseConfig.projectId
  });

  return {
    isConnected,
    error,
    config: getConfig()
  };
};

export default useSupabase;
