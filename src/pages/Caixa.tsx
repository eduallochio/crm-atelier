
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCRM, MovimentoCaixa } from '@/contexts/CRMContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const categorias = [
  'Recebimento',
  'Pagamento',
  'Compra Material',
  'Despesa Operacional',
  'Retirada',
  'Depósito',
  'Outros'
];

const Caixa = () => {
  const { movimentosCaixa, saldoCaixa, adicionarMovimentoCaixa } = useCRM();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo: 'entrada' as 'entrada' | 'saida',
    valor: '',
    descricao: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0]
  });

  // Calcular totais do período
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
  const movimentosHoje = movimentosCaixa.filter(m => {
    const dataMovimento = new Date(m.data).toDateString();
    return dataMovimento === hoje.toDateString();
  });
  
  const movimentosMes = movimentosCaixa.filter(m => {
    const dataMovimento = new Date(m.data);
    return dataMovimento >= inicioMes;
  });

  const entradasHoje = movimentosHoje.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.valor, 0);
  const saidasHoje = movimentosHoje.filter(m => m.tipo === 'saida').reduce((sum, m) => sum + m.valor, 0);
  const entradasMes = movimentosMes.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.valor, 0);
  const saidasMes = movimentosMes.filter(m => m.tipo === 'saida').reduce((sum, m) => sum + m.valor, 0);

  const movimentosFiltrados = movimentosCaixa.filter(movimento => {
    const matchSearch = movimento.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       movimento.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = tipoFiltro === 'todos' || movimento.tipo === tipoFiltro;
    const matchCategoria = categoriaFiltro === 'todas' || movimento.categoria === categoriaFiltro;
    
    return matchSearch && matchTipo && matchCategoria;
  }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const abrirDialog = () => {
    setFormData({
      tipo: 'entrada',
      valor: '',
      descricao: '',
      categoria: '',
      data: new Date().toISOString().split('T')[0]
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const movimentoData = {
      tipo: formData.tipo,
      valor: parseFloat(formData.valor.replace(',', '.')),
      descricao: formData.descricao,
      categoria: formData.categoria,
      data: new Date(formData.data).toISOString()
    };
    
    adicionarMovimentoCaixa(movimentoData);
    
    toast({
      title: "Movimento registrado",
      description: `${formData.tipo === 'entrada' ? 'Entrada' : 'Saída'} de R$ ${formData.valor} foi registrada no caixa.`
    });
    
    setDialogOpen(false);
  };

  const formatarValor = (valor: string) => {
    const numero = valor.replace(/\D/g, '');
    if (!numero) return '';
    const valorNumerico = parseFloat(numero) / 100;
    return valorNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controle de Caixa</h1>
          <p className="text-muted-foreground">Gerencie entradas e saídas do caixa</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={abrirDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Movimento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Movimento</DialogTitle>
              <DialogDescription>
                Registre uma entrada ou saída no caixa.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: 'entrada' | 'saida') => setFormData({ ...formData, tipo: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do movimento"
                  rows={3}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Registrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo do Caixa */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoCaixa >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {Math.abs(saldoCaixa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {saldoCaixa >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {entradasHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {movimentosHoje.filter(m => m.tipo === 'entrada').length} movimento(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas Hoje</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {saidasHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {movimentosHoje.filter(m => m.tipo === 'saida').length} movimento(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {entradasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {movimentosMes.filter(m => m.tipo === 'entrada').length} movimento(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {saidasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {movimentosMes.filter(m => m.tipo === 'saida').length} movimento(s)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentos do Caixa</CardTitle>
          <CardDescription>
            {movimentosCaixa.length} movimento(s) registrado(s)
          </CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar movimentos..."
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
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {movimentosFiltrados.map((movimento) => (
              <div key={movimento.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{movimento.descricao}</h3>
                    <Badge variant={movimento.tipo === 'entrada' ? 'default' : 'secondary'}>
                      {movimento.categoria}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(movimento.data).toLocaleDateString('pt-BR')} às {new Date(movimento.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {movimento.tipo === 'entrada' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <p className={`text-lg font-bold ${movimento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {movimento.tipo === 'entrada' ? '+' : '-'}R$ {movimento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {movimentosFiltrados.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm || tipoFiltro !== 'todos' || categoriaFiltro !== 'todas'
                    ? 'Nenhum movimento encontrado com os filtros aplicados.' 
                    : 'Nenhum movimento registrado ainda.'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Caixa;
