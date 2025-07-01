
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './SupabaseAuthContext';

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
  data_cadastro: string;
}

interface Service {
  id: string;
  nome: string;
  tipo: string;
  valor: number;
  descricao?: string;
}

interface ServiceOrder {
  id: string;
  client_id: string;
  status: string;
  valor_total: number;
  data_abertura: string;
  data_prevista?: string;
  data_conclusao?: string;
  observacoes?: string;
  client?: Client;
}

interface CRMContextType {
  clients: Client[];
  services: Service[];
  serviceOrders: ServiceOrder[];
  loading: boolean;
  addClient: (client: Omit<Client, 'id' | 'data_cadastro'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addServiceOrder: (order: Omit<ServiceOrder, 'id' | 'data_abertura'>) => Promise<void>;
  updateServiceOrder: (id: string, order: Partial<ServiceOrder>) => Promise<void>;
  deleteServiceOrder: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

interface CRMProviderProps {
  children: ReactNode;
}

export const SupabaseCRMProvider: React.FC<CRMProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchClients(),
        fetchServices(),
        fetchServiceOrders()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('org_clients')
      .select('*')
      .order('data_cadastro', { ascending: false });

    if (error) throw error;
    setClients(data || []);
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('org_services')
      .select('*')
      .order('nome');

    if (error) throw error;
    setServices(data || []);
  };

  const fetchServiceOrders = async () => {
    const { data, error } = await supabase
      .from('org_service_orders')
      .select(`
        *,
        client:org_clients(*)
      `)
      .order('data_abertura', { ascending: false });

    if (error) throw error;
    setServiceOrders(data || []);
  };

  const addClient = async (client: Omit<Client, 'id' | 'data_cadastro'>) => {
    const { error } = await supabase
      .from('org_clients')
      .insert([client]);

    if (error) throw error;
    await fetchClients();
  };

  const updateClient = async (id: string, client: Partial<Client>) => {
    const { error } = await supabase
      .from('org_clients')
      .update(client)
      .eq('id', id);

    if (error) throw error;
    await fetchClients();
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('org_clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchClients();
  };

  const addService = async (service: Omit<Service, 'id'>) => {
    const { error } = await supabase
      .from('org_services')
      .insert([service]);

    if (error) throw error;
    await fetchServices();
  };

  const updateService = async (id: string, service: Partial<Service>) => {
    const { error } = await supabase
      .from('org_services')
      .update(service)
      .eq('id', id);

    if (error) throw error;
    await fetchServices();
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase
      .from('org_services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchServices();
  };

  const addServiceOrder = async (order: Omit<ServiceOrder, 'id' | 'data_abertura'>) => {
    const { error } = await supabase
      .from('org_service_orders')
      .insert([order]);

    if (error) throw error;
    await fetchServiceOrders();
  };

  const updateServiceOrder = async (id: string, order: Partial<ServiceOrder>) => {
    const { error } = await supabase
      .from('org_service_orders')
      .update(order)
      .eq('id', id);

    if (error) throw error;
    await fetchServiceOrders();
  };

  const deleteServiceOrder = async (id: string) => {
    const { error } = await supabase
      .from('org_service_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchServiceOrders();
  };

  const value = {
    clients,
    services,
    serviceOrders,
    loading,
    addClient,
    updateClient,
    deleteClient,
    addService,
    updateService,
    deleteService,
    addServiceOrder,
    updateServiceOrder,
    deleteServiceOrder,
    refreshData
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};
