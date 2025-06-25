
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCRM, ContaFinanceira } from '@/contexts/CRMContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, DollarSign, TrendingUp, TrendingDown, CheckCircle, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const Financeiro = () => {
  const { 
    contasFinanceiras, 
    ordensServico,
    adicionarContaFinanceira, 
    atualizarContaFinanceira, 
    excluirContaFinanceira,
    adicionarMovimentoCaixa
  } = useCRM();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaFinanceira | null>(null);
  
  const [formData, setFormData] = useState({
    tipo: 'receber' as 'pagar' | 'receber',
    descricao: '',
    valor: '',
    dataVencimento: '',
    ordemServicoId: ''
  });

  // Calcular resumos
  const contasReceber = contasFinanceiras.filter(c => c.tipo === 'receber');
  const contasPagar = contasFinanceiras.filter(c => c.tipo === 'pagar');
  
  const totalReceber = contasReceber.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.valor, 0);
  const totalPagar = contasPagar.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.valor, 0);
  const totalReceberVencido = contasReceber.filter(c => 
    c.status === 'pendente' && new Date(c.dataVencimento) < new Date()
  ).reduce((sum, c) => sum + c.valor, 0);
  const totalPagarVencido = contasPagar.filter(c => 
    c.status === 'pendente' && new Date(c.dataVencimento) < new Date()
  ).reduce((sum, c) => sum + c.valor, 0);

  const contasFiltradas = contasFinanceiras.filter(conta => {
    const matchSearch = conta.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = tipoFiltro === 'todos' || conta.tipo === tipoFiltro;
    const matchStatus = statusFiltro === 'todos' || conta.status === statusFiltro;
    
    return matchSearch && matchTipo && matchStatus;
  });

  const abrirDialog = (conta?: ContaFinanceira) => {
    if (conta) {
      setEditingConta(conta);
      setFormData({
        tipo: conta.tipo,
        descricao: conta.descricao,
        valor: conta.valor.toString(),
        dataVencimento: conta.dataVencimento.split('T')[0],
        ordemServicoId: conta.ordemServicoId || ''
      });
    } else {
      setEditingConta(null);
      setFormData({
        tipo: 'receber',
        descricao: '',
        valor: '',
        dataVencimento: '',
        ordemServicoId: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contaData = {
      tipo: formData.tipo,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor.replace(',', '.')),
      dataVencimento: new Date(formData.dataVencimento).toISOString(),
      status: 'pendente' as const,
      ordemServicoId: formData.ordemServicoId || undefined
    };
    
    if (editingConta) {
      atualizarContaFinanceira(editingConta.id, contaData);
      toast({
        title: "Conta atualizada",
        description: "A conta foi atualizada com sucesso."
      });
    } else {
      adicionarContaFinanceira(contaData);
      toast({
        title: "Conta cadastrada",
        description: "A conta foi cadastrada com sucesso."
      });
    }
    
    setDialogOpen(false);
  };

  const marcarComoPaga = (conta: ContaFinanceira) => {
    const agora = new Date().toISOString();
    atualizarContaFinanceira(conta.id, {
      status: 'paga',
      dataPagamento: agora
    });
    
    // Adicionar movimento no caixa
    adicionarMovimentoCaixa({
      tipo: conta.tipo === 'receber' ? 'entrada' : 'saida',
      valor: conta.valor,
      descricao: `Pagamento: ${conta.descricao}`,
      data: agora,
      categoria: conta.tipo === 'receber' ? 'Recebimento' : 'Pagamento'
    });
    
    toast({
      title: "Conta marcada como paga",
      description: `${conta.descricao} foi marcada como paga e lançada no caixa.`
    });
  };

  const handleDelete = (conta: ContaFinanceira) => {
    if (confirm(`Tem certeza que deseja excluir "${conta.descricao}"?`)) {
      excluirContaFinanceira(conta.id);
      toast({
        title: "Conta excluída",
        description: "A conta foi excluída com sucesso."
      });
    }
  };

  const formatarValor = (valor: string) => {
    const numero = valor.replace(/\D/g, '');
    if (!numero) return '';
    const valorNumerico = parseFloat(numero) / 100;
    return valorNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const isVencida = (dataVencimento: string) => {
    return new Date(dataVencimento) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Controle de contas a pagar e receber</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingConta ? 'Editar Conta' : 'Nova Conta'}
              </DialogTitle>
              <DialogDescription>
                {editingConta 
                  ? 'Atualize as informações da conta.' 
                  : 'Cadastre uma nova conta a pagar ou receber.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: 'pagar' | 'receber') => setFormData({ ...formData, tipo: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receber">Conta a Receber</SelectItem>
                    <SelectItem value="pagar">Conta a Pagar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da conta"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  id="valor"
                  value={formData.valor}
                  onChange={(e) => {
                    const valorFormatado = formatarValor(e.target.value);
                    setFormData({ ...formData, valor: valorFormatado });
                  }}
                  placeholder="0,00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={formData.dataVencimento}
                  onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ordemServico">Ordem de Serviço (Opcional)</Label>
                <Select
                  value={formData.ordemServicoId}
                  onValueChange={(value) => setFormData({ ...formData, ordemServicoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vincular a uma OS (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma OS</SelectItem>
                    {ordensServico.map((os) => (
                      <SelectItem key={os.id} value={os.id}>
                        OS #{os.id.slice(-4)} - {os.cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingConta ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {contasReceber.filter(c => c.status === 'pendente').length} conta(s) pendente(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {contasPagar.filter(c => c.status === 'pendente').length} conta(s) pendente(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receber Vencido</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              R$ {totalReceberVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Necessita atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagar Vencido</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalPagarVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Necessita atenção
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="todas">Todas as Contas</TabsTrigger>
          <TabsTrigger value="receber">A Receber</TabsTrigger>
          <TabsTrigger value="pagar">A Pagar</TabsTrigger>
          <TabsTrigger value="vencidas">Vencidas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Contas</CardTitle>
              <CardDescription>
                {contasFinanceiras.length} conta(s) cadastrada(s)
              </CardDescription>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar contas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="receber">A Receber</SelectItem>
                    <SelectItem value="pagar">A Pagar</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="paga">Paga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contasFiltradas.map((conta) => (
                  <div key={conta.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{conta.descricao}</h3>
                        <Badge variant={conta.tipo === 'receber' ? 'default' : 'secondary'}>
                          {conta.tipo === 'receber' ? 'A Receber' : 'A Pagar'}
                        </Badge>
                        <Badge 
                          variant={conta.status === 'paga' ? 'default' : isVencida(conta.dataVencimento) ? 'destructive' : 'outline'}
                        >
                          {conta.status === 'paga' ? 'Paga' : isVencida(conta.dataVencimento) ? 'Vencida' : 'Pendente'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Vencimento: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</p>
                        {conta.dataPagamento && (
                          <p>Pagamento: {new Date(conta.dataPagamento).toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-bold ${conta.tipo === 'receber' ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {conta.status === 'pendente' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => marcarComoPaga(conta)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirDialog(conta)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(conta)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {contasFiltradas.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhuma conta encontrada.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receber">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Receber</CardTitle>
              <CardDescription>
                {contasReceber.length} conta(s) a receber
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contasReceber.map((conta) => (
                  <div key={conta.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{conta.descricao}</h3>
                        <Badge 
                          variant={conta.status === 'paga' ? 'default' : isVencida(conta.dataVencimento) ? 'destructive' : 'outline'}
                        >
                          {conta.status === 'paga' ? 'Recebida' : isVencida(conta.dataVencimento) ? 'Vencida' : 'Pendente'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Vencimento: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</p>
                        {conta.dataPagamento && (
                          <p>Recebimento: {new Date(conta.dataPagamento).toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {conta.status === 'pendente' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => marcarComoPaga(conta)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirDialog(conta)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(conta)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {contasReceber.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhuma conta a receber cadastrada.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagar">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Pagar</CardTitle>
              <CardDescription>
                {contasPagar.length} conta(s) a pagar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contasPagar.map((conta) => (
                  <div key={conta.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{conta.descricao}</h3>
                        <Badge 
                          variant={conta.status === 'paga' ? 'default' : isVencida(conta.dataVencimento) ? 'destructive' : 'outline'}
                        >
                          {conta.status === 'paga' ? 'Paga' : isVencida(conta.dataVencimento) ? 'Vencida' : 'Pendente'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Vencimento: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</p>
                        {conta.dataPagamento && (
                          <p>Pagamento: {new Date(conta.dataPagamento).toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {conta.status === 'pendente' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => marcarComoPaga(conta)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirDialog(conta)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(conta)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {contasPagar.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhuma conta a pagar cadastrada.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vencidas">
          <Card>
            <CardHeader>
              <CardTitle>Contas Vencidas</CardTitle>
              <CardDescription>
                Contas que passaram do vencimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contasFinanceiras.filter(c => c.status === 'pendente' && isVencida(c.dataVencimento)).map((conta) => (
                  <div key={conta.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{conta.descricao}</h3>
                        <Badge variant={conta.tipo === 'receber' ? 'default' : 'secondary'}>
                          {conta.tipo === 'receber' ? 'A Receber' : 'A Pagar'}
                        </Badge>
                        <Badge variant="destructive">Vencida</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Vencimento: {new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-bold ${conta.tipo === 'receber' ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => marcarComoPaga(conta)}
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirDialog(conta)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {contasFinanceiras.filter(c => c.status === 'pendente' && isVencida(c.dataVencimento)).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhuma conta vencida. Parabéns!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financeiro;
