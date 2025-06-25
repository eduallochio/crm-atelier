
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  endereco?: string;
  dataCadastro: string;
}

export interface Servico {
  id: string;
  nome: string;
  tipo: string;
  valor: number;
  descricao?: string;
}

export interface OrdemServico {
  id: string;
  clienteId: string;
  cliente: Cliente;
  servicos: Array<{
    servicoId: string;
    servico: Servico;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
  valorTotal: number;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  dataAbertura: string;
  dataPrevista?: string;
  dataConclusao?: string;
  observacoes?: string;
}

export interface ContaFinanceira {
  id: string;
  tipo: 'pagar' | 'receber';
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: 'pendente' | 'paga';
  ordemServicoId?: string;
}

export interface MovimentoCaixa {
  id: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string;
  data: string;
  categoria: string;
}

interface CRMContextType {
  clientes: Cliente[];
  servicos: Servico[];
  ordensServico: OrdemServico[];
  contasFinanceiras: ContaFinanceira[];
  movimentosCaixa: MovimentoCaixa[];
  saldoCaixa: number;
  
  // Clientes
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'dataCadastro'>) => void;
  atualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  excluirCliente: (id: string) => void;
  
  // Serviços
  adicionarServico: (servico: Omit<Servico, 'id'>) => void;
  atualizarServico: (id: string, servico: Partial<Servico>) => void;
  excluirServico: (id: string) => void;
  
  // Ordens de Serviço
  adicionarOrdemServico: (ordem: Omit<OrdemServico, 'id' | 'valorTotal'>) => void;
  atualizarOrdemServico: (id: string, ordem: Partial<OrdemServico>) => void;
  excluirOrdemServico: (id: string) => void;
  
  // Contas Financeiras
  adicionarContaFinanceira: (conta: Omit<ContaFinanceira, 'id'>) => void;
  atualizarContaFinanceira: (id: string, conta: Partial<ContaFinanceira>) => void;
  excluirContaFinanceira: (id: string) => void;
  
  // Movimentos de Caixa
  adicionarMovimentoCaixa: (movimento: Omit<MovimentoCaixa, 'id'>) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [contasFinanceiras, setContasFinanceiras] = useState<ContaFinanceira[]>([]);
  const [movimentosCaixa, setMovimentosCaixa] = useState<MovimentoCaixa[]>([]);

  // Calcular saldo do caixa
  const saldoCaixa = movimentosCaixa.reduce((saldo, movimento) => {
    return movimento.tipo === 'entrada' ? saldo + movimento.valor : saldo - movimento.valor;
  }, 0);

  // Carregar dados do localStorage
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('crmData');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      setClientes(dados.clientes || []);
      setServicos(dados.servicos || []);
      setOrdensServico(dados.ordensServico || []);
      setContasFinanceiras(dados.contasFinanceiras || []);
      setMovimentosCaixa(dados.movimentosCaixa || []);
    } else {
      // Dados iniciais de exemplo
      const servicosIniciais: Servico[] = [
        { id: '1', nome: 'Bainha Simples', tipo: 'Ajuste', valor: 15.00, descricao: 'Bainha simples em calça ou saia' },
        { id: '2', nome: 'Bainha Invisível', tipo: 'Ajuste', valor: 25.00, descricao: 'Bainha invisível em peças delicadas' },
        { id: '3', nome: 'Ajuste na Cintura', tipo: 'Ajuste', valor: 30.00, descricao: 'Apertar ou alargar cintura' },
        { id: '4', nome: 'Costura de Vestido', tipo: 'Confecção', valor: 150.00, descricao: 'Confecção completa de vestido' },
        { id: '5', nome: 'Aplicação de Zíper', tipo: 'Conserto', valor: 20.00, descricao: 'Troca ou aplicação de zíper' }
      ];
      setServicos(servicosIniciais);
    }
  }, []);

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    const dados = {
      clientes,
      servicos,
      ordensServico,
      contasFinanceiras,
      movimentosCaixa
    };
    localStorage.setItem('crmData', JSON.stringify(dados));
  }, [clientes, servicos, ordensServico, contasFinanceiras, movimentosCaixa]);

  // Funções CRUD para Clientes
  const adicionarCliente = (clienteData: Omit<Cliente, 'id' | 'dataCadastro'>) => {
    const novoCliente: Cliente = {
      ...clienteData,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString()
    };
    setClientes(prev => [...prev, novoCliente]);
  };

  const atualizarCliente = (id: string, clienteData: Partial<Cliente>) => {
    setClientes(prev => prev.map(cliente => 
      cliente.id === id ? { ...cliente, ...clienteData } : cliente
    ));
  };

  const excluirCliente = (id: string) => {
    setClientes(prev => prev.filter(cliente => cliente.id !== id));
  };

  // Funções CRUD para Serviços
  const adicionarServico = (servicoData: Omit<Servico, 'id'>) => {
    const novoServico: Servico = {
      ...servicoData,
      id: Date.now().toString()
    };
    setServicos(prev => [...prev, novoServico]);
  };

  const atualizarServico = (id: string, servicoData: Partial<Servico>) => {
    setServicos(prev => prev.map(servico => 
      servico.id === id ? { ...servico, ...servicoData } : servico
    ));
  };

  const excluirServico = (id: string) => {
    setServicos(prev => prev.filter(servico => servico.id !== id));
  };

  // Funções CRUD para Ordens de Serviço
  const adicionarOrdemServico = (ordemData: Omit<OrdemServico, 'id' | 'valorTotal'>) => {
    const valorTotal = ordemData.servicos.reduce((total, item) => total + item.valorTotal, 0);
    const novaOrdem: OrdemServico = {
      ...ordemData,
      id: Date.now().toString(),
      valorTotal
    };
    setOrdensServico(prev => [...prev, novaOrdem]);
  };

  const atualizarOrdemServico = (id: string, ordemData: Partial<OrdemServico>) => {
    setOrdensServico(prev => prev.map(ordem => {
      if (ordem.id === id) {
        const ordemAtualizada = { ...ordem, ...ordemData };
        if (ordemAtualizada.servicos) {
          ordemAtualizada.valorTotal = ordemAtualizada.servicos.reduce((total, item) => total + item.valorTotal, 0);
        }
        return ordemAtualizada;
      }
      return ordem;
    }));
  };

  const excluirOrdemServico = (id: string) => {
    setOrdensServico(prev => prev.filter(ordem => ordem.id !== id));
  };

  // Funções para Contas Financeiras
  const adicionarContaFinanceira = (contaData: Omit<ContaFinanceira, 'id'>) => {
    const novaConta: ContaFinanceira = {
      ...contaData,
      id: Date.now().toString()
    };
    setContasFinanceiras(prev => [...prev, novaConta]);
  };

  const atualizarContaFinanceira = (id: string, contaData: Partial<ContaFinanceira>) => {
    setContasFinanceiras(prev => prev.map(conta => 
      conta.id === id ? { ...conta, ...contaData } : conta
    ));
  };

  const excluirContaFinanceira = (id: string) => {
    setContasFinanceiras(prev => prev.filter(conta => conta.id !== id));
  };

  // Função para Movimentos de Caixa
  const adicionarMovimentoCaixa = (movimentoData: Omit<MovimentoCaixa, 'id'>) => {
    const novoMovimento: MovimentoCaixa = {
      ...movimentoData,
      id: Date.now().toString()
    };
    setMovimentosCaixa(prev => [...prev, novoMovimento]);
  };

  const value = {
    clientes,
    servicos,
    ordensServico,
    contasFinanceiras,
    movimentosCaixa,
    saldoCaixa,
    adicionarCliente,
    atualizarCliente,
    excluirCliente,
    adicionarServico,
    atualizarServico,
    excluirServico,
    adicionarOrdemServico,
    atualizarOrdemServico,
    excluirOrdemServico,
    adicionarContaFinanceira,
    atualizarContaFinanceira,
    excluirContaFinanceira,
    adicionarMovimentoCaixa
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};
