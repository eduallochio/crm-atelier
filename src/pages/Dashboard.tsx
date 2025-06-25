
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCRM } from "@/contexts/CRMContext";
import { Users, FileText, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { clientes, ordensServico, contasFinanceiras, saldoCaixa } = useCRM();

  // Estatísticas
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu atelier</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordens Abertas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordensAbertas}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {saldoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Vencidas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{contasVencidas}</div>
            <p className="text-xs text-muted-foreground">
              Necessitam atenção
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>Contas a pagar e receber</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-700">A Receber</p>
                <p className="text-2xl font-bold text-green-800">
                  R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-700">A Pagar</p>
                <p className="text-2xl font-bold text-red-800">
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
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
