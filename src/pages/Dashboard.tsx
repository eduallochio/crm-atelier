
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCRM } from "@/contexts/CRMContext";
import { useNotifications } from "@/components/NotificationSystem";
import { Users, FileText, DollarSign, TrendingUp, Clock, CheckCircle, Package, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import MetricCard from "@/components/MetricCard";
import DashboardChart from "@/components/DashboardChart";

const Dashboard = () => {
  const { clientes, ordensServico, contasFinanceiras, saldoCaixa } = useCRM();
  const { addNotification } = useNotifications();

  // Estatísticas básicas
  const totalClientes = clientes.length;
  const ordensAbertas = ordensServico.filter(os => os.status !== 'concluida' && os.status !== 'cancelada').length;
  const ordensHoje = ordensServico.filter(os => {
    const hoje = new Date().toDateString();
    return new Date(os.dataAbertura).toDateString() === hoje;
  }).length;
  
  const contasVencidas = contasFinanceiras.filter(conta => {
    if (conta.status === 'paga') return false;
    return new Date(conta.dataVencimento) < new Date();
  }).length;

  const totalReceber = contasFinanceiras
    .filter(conta => conta.tipo === 'receber' && conta.status === 'pendente')
    .reduce((total, conta) => total + conta.valor, 0);

  const totalPagar = contasFinanceiras
    .filter(conta => conta.tipo === 'pagar' && conta.status === 'pendente')
    .reduce((total, conta) => total + conta.valor, 0);

  // Dados para gráficos
  const faturamentoMensal = [
    { name: 'Jan', value: 4500 },
    { name: 'Fev', value: 5200 },
    { name: 'Mar', value: 4800 },
    { name: 'Abr', value: 6100 },
    { name: 'Mai', value: 5900 },
    { name: 'Jun', value: 7200 },
  ];

  const servicosPorTipo = [
    { name: 'Ajustes', value: 35 },
    { name: 'Confecção', value: 28 },
    { name: 'Consertos', value: 20 },
    { name: 'Outros', value: 17 },
  ];

  const statusOrdens = [
    { name: 'Pendente', value: ordensServico.filter(o => o.status === 'pendente').length },
    { name: 'Em Andamento', value: ordensServico.filter(o => o.status === 'em_andamento').length },
    { name: 'Concluída', value: ordensServico.filter(o => o.status === 'concluida').length },
  ];

  // Notificações automáticas
  useEffect(() => {
    if (contasVencidas > 0) {
      addNotification({
        type: 'warning',
        title: 'Contas Vencidas',
        message: `Você tem ${contasVencidas} conta(s) vencida(s) que precisam de atenção.`,
        actions: [{
          label: 'Ver Contas',
          onClick: () => window.location.href = '/financeiro'
        }]
      });
    }

    if (ordensHoje > 0) {
      addNotification({
        type: 'info',
        title: 'Ordens de Hoje',
        message: `${ordensHoje} nova(s) ordem(ns) de serviço foram criadas hoje.`,
      });
    }
  }, [contasVencidas, ordensHoje, addNotification]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu atelier</p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Clientes"
          value={totalClientes}
          description="Clientes cadastrados"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        
        <MetricCard
          title="Ordens Abertas"
          value={ordensAbertas}
          description="Em andamento"
          icon={Clock}
          trend={{ value: 8, isPositive: false }}
        />
        
        <MetricCard
          title="Saldo em Caixa"
          value={`R$ ${saldoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Saldo atual"
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
        
        <MetricCard
          title="Contas Vencidas"
          value={contasVencidas}
          description="Necessitam atenção"
          icon={TrendingUp}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardChart
          type="bar"
          data={faturamentoMensal}
          title="Faturamento Mensal"
          description="Receita dos últimos 6 meses"
          dataKey="value"
          xAxisKey="name"
        />
        
        <DashboardChart
          type="pie"
          data={servicosPorTipo}
          title="Serviços por Tipo"
          description="Distribuição dos tipos de serviço"
          dataKey="value"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>Contas a pagar e receber</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">A Receber</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">A Pagar</p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                  R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
            
            <Button asChild className="w-full">
              <Link to="/financeiro">Ver Detalhes</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Status das Ordens */}
        <DashboardChart
          type="pie"
          data={statusOrdens}
          title="Status das Ordens"
          description="Distribuição por status"
          dataKey="value"
        />
      </div>

      {/* Ordens de Serviço Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens Recentes</CardTitle>
          <CardDescription>Últimas ordens de serviço</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ordensServico.slice(0, 5).map((ordem) => (
              <div key={ordem.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{ordem.cliente.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    OS #{ordem.id.slice(-4)} • {ordem.servicos.length} serviços
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      ordem.status === 'concluida' ? 'default' :
                      ordem.status === 'em_andamento' ? 'secondary' :
                      ordem.status === 'cancelada' ? 'destructive' : 'outline'
                    }
                  >
                    {ordem.status.replace('_', ' ')}
                  </Badge>
                  <p className="text-sm font-medium mt-1">
                    R$ {ordem.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
            {ordensServico.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma ordem de serviço cadastrada
              </p>
            )}
          </div>
          
          <Button asChild className="w-full mt-4" variant="outline">
            <Link to="/ordens-servico">Ver Todas</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button asChild size="lg">
              <Link to="/clientes" className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Novo Cliente
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline">
              <Link to="/ordens-servico" className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nova Ordem
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline">
              <Link to="/caixa" className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Lançar Caixa
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link to="/servicos" className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gerenciar Serviços
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
