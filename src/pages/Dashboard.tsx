
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MetricCard from '@/components/MetricCard';
import DashboardChart from '@/components/DashboardChart';
import { useCRM } from '@/contexts/SupabaseCRMContext';
import { Users, ShoppingBag, ClipboardList, DollarSign, TrendingUp, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { clients, services, serviceOrders, loading } = useCRM();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingOrders = serviceOrders.filter(order => order.status === 'pendente').length;
  const completedOrders = serviceOrders.filter(order => order.status === 'concluida').length;
  const totalRevenue = serviceOrders
    .filter(order => order.status === 'concluida')
    .reduce((sum, order) => sum + Number(order.valor_total), 0);

  // Prepare chart data for orders by status
  const chartData = [
    { name: 'Pendentes', value: pendingOrders, color: '#f59e0b' },
    { name: 'Concluídas', value: completedOrders, color: '#10b981' },
  ];

  // Recent orders for display
  const recentOrders = serviceOrders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Visão geral do seu atelier - {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Clientes"
          value={clients.length.toString()}
          icon={Users}
          description="Clientes cadastrados"
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
        />
        <MetricCard
          title="Serviços"
          value={services.length.toString()}
          icon={ShoppingBag}
          description="Serviços disponíveis"
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
        />
        <MetricCard
          title="Ordens Pendentes"
          value={pendingOrders.toString()}
          icon={ClipboardList}
          description="Aguardando conclusão"
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800"
        />
        <MetricCard
          title="Receita Total"
          value={`R$ ${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          description="Ordens concluídas"
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800"
        />
      </div>

      {/* Charts and Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Ordens de Serviço Recentes</CardTitle>
              </div>
              <CardDescription>
                Últimas {recentOrders.length} ordens cadastradas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {order.client?.nome || 'Cliente não encontrado'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.data_abertura).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-slate-900 dark:text-white">
                          R$ {Number(order.valor_total).toFixed(2)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          order.status === 'concluida' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : order.status === 'pendente'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {order.status === 'concluida' ? 'Concluída' : 
                           order.status === 'pendente' ? 'Pendente' : 
                           'Em Andamento'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma ordem de serviço cadastrada ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Chart */}
        <div>
          <DashboardChart
            type="pie"
            data={chartData}
            title="Status das Ordens"
            description="Distribuição das ordens por status"
            className="shadow-lg border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
