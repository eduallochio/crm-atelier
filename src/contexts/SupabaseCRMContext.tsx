
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
  data_cadastro: string;
  organization_id: string;
}

export interface Servico {
  id: string;
  nome: string;
  tipo: string;
  valor: number;
  descricao?: string;
  organization_id: string;
}

export interface OrdemServico {
  id: string;
  client_id: string;
  cliente: Cliente;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  valor_total: number;
  data_abertura: string;
  data_prevista?: string;
  data_conclusao?: string;
  observacoes?: string;
  organization_id: string;
}

interface SupabaseCRMContextType {
  clientes: Cliente[];
  servicos: Servico[];
  ordensServico: OrdemServico[];
  loading: boolean;
  
  // Clientes
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'data_cadastro' | 'organization_id'>) => Promise<void>;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  excluirCliente: (id: string) => Promise<void>;
  
  // Serviços
  adicionarServico: (servico: Omit<Servico, 'id' | 'organization_id'>) => Promise<void>;
  atualizarServico: (id: string, servico: Partial<Servico>) => Promise<void>;
  excluirServico: (id: string) => Promise<void>;
  
  // Ordens de Serviço
  adicionarOrdemServico: (ordem: Omit<OrdemServico, 'id' | 'organization_id'>) => Promise<void>;
  atualizarOrdemServico: (id: string, ordem: Partial<OrdemServico>) => Promise<void>;
  excluirOrdemServico: (id: string) => Promise<void>;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

const SupabaseCRMContext = createContext<SupabaseCRMContextType | undefined>(undefined);

export const useSupabaseCRM = () => {
  const context = useContext(SupabaseCRMContext);
  if (context === undefined) {
    throw new Error('useSupabaseCRM must be used within a SupabaseCRMProvider');
  }
  return context;
};

export const SupabaseCRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { organization, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data when organization is available
  useEffect(() => {
    if (organization && isAuthenticated) {
      refreshData();
    }
  }, [organization, isAuthenticated]);

  const refreshData = async () => {
    if (!organization) return;
    
    setLoading(true);
    try {
      await Promise.all([loadClientes(), loadServicos(), loadOrdensServico()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    if (!organization) return;
    
    const { data, error } = await supabase
      .from('org_clients')
      .select('*')
      .eq('organization_id', organization.id)
      .order('nome');

    if (error) throw error;
    setClientes(data || []);
  };

  const loadServicos = async () => {
    if (!organization) return;
    
    const { data, error } = await supabase
      .from('org_services')
      .select('*')
      .eq('organization_id', organization.id)
      .order('nome');

    if (error) throw error;
    setServicos(data || []);
  };

  const loadOrdensServico = async () => {
    if (!organization) return;
    
    const { data, error } = await supabase
      .from('org_service_orders')
      .select(`
        *,
        cliente:org_clients(*)
      `)
      .eq('organization_id', organization.id)
      .order('data_abertura', { ascending: false });

    if (error) throw error;
    
    const ordensFormatted = data?.map(ordem => ({
      ...ordem,
      cliente: ordem.cliente as Cliente,
      status: (ordem.status || 'pendente') as 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'
    })) || [];
    
    setOrdensServico(ordensFormatted);
  };

  // CRUD Operations
  const adicionarCliente = async (clienteData: Omit<Cliente, 'id' | 'data_cadastro' | 'organization_id'>) => {
    if (!organization) throw new Error('Organization not found');
    
    const { error } = await supabase
      .from('org_clients')
      .insert({
        ...clienteData,
        organization_id: organization.id
      });

    if (error) throw error;
    
    await loadClientes();
    toast({
      title: "Sucesso",
      description: "Cliente adicionado com sucesso",
    });
  };

  const atualizarCliente = async (id: string, clienteData: Partial<Cliente>) => {
    const { error } = await supabase
      .from('org_clients')
      .update(clienteData)
      .eq('id', id);

    if (error) throw error;
    
    await loadClientes();
    toast({
      title: "Sucesso",
      description: "Cliente atualizado com sucesso",
    });
  };

  const excluirCliente = async (id: string) => {
    const { error } = await supabase
      .from('org_clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    await loadClientes();
    toast({
      title: "Sucesso",
      description: "Cliente excluído com sucesso",
    });
  };

  const adicionarServico = async (servicoData: Omit<Servico, 'id' | 'organization_id'>) => {
    if (!organization) throw new Error('Organization not found');
    
    const { error } = await supabase
      .from('org_services')
      .insert({
        ...servicoData,
        organization_id: organization.id
      });

    if (error) throw error;
    
    await loadServicos();
    toast({
      title: "Sucesso",
      description: "Serviço adicionado com sucesso",
    });
  };

  const atualizarServico = async (id: string, servicoData: Partial<Servico>) => {
    const { error } = await supabase
      .from('org_services')
      .update(servicoData)
      .eq('id', id);

    if (error) throw error;
    
    await loadServicos();
    toast({
      title: "Sucesso",
      description: "Serviço atualizado com sucesso",
    });
  };

  const excluirServico = async (id: string) => {
    const { error } = await supabase
      .from('org_services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    await loadServicos();
    toast({
      title: "Sucesso",
      description: "Serviço excluído com sucesso",
    });
  };

  const adicionarOrdemServico = async (ordemData: Omit<OrdemServico, 'id' | 'organization_id'>) => {
    if (!organization) throw new Error('Organization not found');
    
    const { error } = await supabase
      .from('org_service_orders')
      .insert({
        ...ordemData,
        organization_id: organization.id
      });

    if (error) throw error;
    
    await loadOrdensServico();
    toast({
      title: "Sucesso",
      description: "Ordem de serviço criada com sucesso",
    });
  };

  const atualizarOrdemServico = async (id: string, ordemData: Partial<OrdemServico>) => {
    const { error } = await supabase
      .from('org_service_orders')
      .update(ordemData)
      .eq('id', id);

    if (error) throw error;
    
    await loadOrdensServico();
    toast({
      title: "Sucesso",
      description: "Ordem de serviço atualizada com sucesso",
    });
  };

  const excluirOrdemServico = async (id: string) => {
    const { error } = await supabase
      .from('org_service_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    await loadOrdensServico();
    toast({
      title: "Sucesso",
      description: "Ordem de serviço excluída com sucesso",
    });
  };

  const value = {
    clientes,
    servicos,
    ordensServico,
    loading,
    adicionarCliente,
    atualizarCliente,
    excluirCliente,
    adicionarServico,
    atualizarServico,
    excluirServico,
    adicionarOrdemServico,
    atualizarOrdemServico,
    excluirOrdemServico,
    refreshData
  };

  return (
    <SupabaseCRMContext.Provider value={value}>
      {children}
    </SupabaseCRMContext.Provider>
  );
};
