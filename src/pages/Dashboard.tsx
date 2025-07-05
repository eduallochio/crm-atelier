
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MetricCard from '@/components/MetricCard';
import DashboardChart from '@/components/DashboardChart';
import { useCRM } from '@/contexts/SupabaseCRMContext';
import { Users, ShoppingBag, ClipboardList, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const { clients, services, serviceOrders, loading } = useCRM();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
    { name: 'Pendentes', value: pendingOrders },
    { name: 'Concluídas', value: completedOrders },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu atelier
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Clientes"
          value={clients.length.toString()}
          icon={Users}
          description="Clientes cadastrados"
        />
        <MetricCard
          title="Serviços"
          value={services.length.toString()}
          icon={ShoppingBag}
          description="Serviços disponíveis"
        />
        <MetricCard
          title="Ordens Pendentes"
          value={pendingOrders.toString()}
          icon={ClipboardList}
          description="Aguardando conclusão"
        />
        <MetricCard
          title="Receita Total"
          value={`R$ ${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          description="Ordens concluídas"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ordens de Serviço Recentes</CardTitle>
            <CardDescription>
              Últimas ordens cadastradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.client?.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.data_abertura).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {Number(order.valor_total).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <DashboardChart
          type="pie"
          data={chartData}
          title="Status das Ordens"
          description="Distribuição das ordens por status"
        />
      </div>
    </div>
  );
};

export default Dashboard;
