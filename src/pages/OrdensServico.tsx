
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCRM, OrdemServico } from '@/contexts/CRMContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, MessageCircle, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import ImpressaoOS from '@/components/ImpressaoOS';

const statusOptions = [
  { value: 'pendente', label: 'Pendente', color: 'secondary' },
  { value: 'em_andamento', label: 'Em Andamento', color: 'default' },
  { value: 'concluida', label: 'Concluída', color: 'success' },
  { value: 'cancelada', label: 'Cancelada', color: 'destructive' }
];

const OrdensServico = () => {
  const { 
    ordensServico, 
    clientes, 
    servicos, 
    adicionarOrdemServico, 
    atualizarOrdemServico, 
    excluirOrdemServico 
  } = useCRM();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState<OrdemServico | null>(null);
  const [ordemDetalhes, setOrdemDetalhes] = useState<OrdemServico | null>(null);
  
  const [formData, setFormData] = useState({
    clienteId: '',
    servicos: [] as Array<{
      servicoId: string;
      quantidade: number;
    }>,
    status: 'pendente' as OrdemServico['status'],
    dataPrevista: '',
    observacoes: ''
  });

  const ordensFiltradas = ordensServico.filter(ordem => {
    const matchSearch = ordem.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ordem.id.includes(searchTerm);
    
    const matchStatus = statusFiltro === 'todos' || ordem.status === statusFiltro;
    
    return matchSearch && matchStatus;
  });

  const abrirDialog = (ordem?: OrdemServico) => {
    if (ordem) {
      setEditingOrdem(ordem);
      setFormData({
        clienteId: ordem.clienteId,
        servicos: ordem.servicos.map(s => ({
          servicoId: s.servicoId,
          quantidade: s.quantidade
        })),
        status: ordem.status,
        dataPrevista: ordem.dataPrevista ? ordem.dataPrevista.split('T')[0] : '',
        observacoes: ordem.observacoes || ''
      });
    } else {
      setEditingOrdem(null);
      setFormData({
        clienteId: '',
        servicos: [],
        status: 'pendente',
        dataPrevista: '',
        observacoes: ''
      });
    }
    setDialogOpen(true);
  };

  const adicionarServico = () => {
    setFormData({
      ...formData,
      servicos: [...formData.servicos, { servicoId: '', quantidade: 1 }]
    });
  };

  const removerServico = (index: number) => {
    setFormData({
      ...formData,
      servicos: formData.servicos.filter((_, i) => i !== index)
    });
  };

  const atualizarServico = (index: number, field: string, value: any) => {
    const novosServicos = [...formData.servicos];
    novosServicos[index] = { ...novosServicos[index], [field]: value };
    setFormData({ ...formData, servicos: novosServicos });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cliente = clientes.find(c => c.id === formData.clienteId);
    if (!cliente) {
      toast({
        title: "Erro",
        description: "Cliente não encontrado",
        variant: "destructive"
      });
      return;
    }

    const servicosCompletos = formData.servicos.map(s => {
      const servico = servicos.find(srv => srv.id === s.servicoId);
      if (!servico) throw new Error('Serviço não encontrado');
      
      return {
        servicoId: s.servicoId,
        servico,
        quantidade: s.quantidade,
        valorUnitario: servico.valor,
        valorTotal: servico.valor * s.quantidade
      };
    });

    const ordemData = {
      clienteId: formData.clienteId,
      cliente,
      servicos: servicosCompletos,
      status: formData.status,
      dataAbertura: editingOrdem ? editingOrdem.dataAbertura : new Date().toISOString(),
      dataPrevista: formData.dataPrevista ? new Date(formData.dataPrevista).toISOString() : undefined,
      observacoes: formData.observacoes
    };
    
    if (editingOrdem) {
      atualizarOrdemServico(editingOrdem.id, ordemData);
      toast({
        title: "Ordem atualizada",
        description: `Ordem #${editingOrdem.id.slice(-4)} foi atualizada com sucesso.`
      });
    } else {
      adicionarOrdemServico(ordemData);
      toast({
        title: "Ordem criada",
        description: "Nova ordem de serviço foi criada com sucesso."
      });
    }
    
    setDialogOpen(false);
  };

  const handleDelete = (ordem: OrdemServico) => {
    if (confirm(`Tem certeza que deseja excluir a OS #${ordem.id.slice(-4)}?`)) {
      excluirOrdemServico(ordem.id);
      toast({
        title: "Ordem excluída",
        description: `OS #${ordem.id.slice(-4)} foi excluída com sucesso.`
      });
    }
  };

  const abrirWhatsApp = (telefone: string, nome: string, ordem: OrdemServico) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    const mensagem = encodeURIComponent(
      `Olá ${nome}! Temos novidades sobre sua ordem de serviço #${ordem.id.slice(-4)}. ` +
      `Status atual: ${ordem.status.replace('_', ' ')}. ` +
      `Total: R$ ${ordem.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    );
    const url = `https://wa.me/55${numeroLimpo}?text=${mensagem}`;
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption ? statusOption : { label: status, color: 'secondary' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerencie as ordens de serviço</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Ordem
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrdem ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
              </DialogTitle>
              <DialogDescription>
                {editingOrdem 
                  ? 'Atualize as informações da ordem de serviço.' 
                  : 'Crie uma nova ordem de serviço.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Select
                  value={formData.clienteId}
                  onValueChange={(value) => setFormData({ ...formData, clienteId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.telefone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Serviços *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={adicionarServico}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                
                {formData.servicos.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end border p-3 rounded">
                    <div className="flex-1">
                      <Label>Serviço</Label>
                      <Select
                        value={item.servicoId}
                        onValueChange={(value) => atualizarServico(index, 'servicoId', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {servicos.map((servico) => (
                            <SelectItem key={servico.id} value={servico.id}>
                              {servico.nome} - R$ {servico.valor.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-20">
                      <Label>Qtd</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => atualizarServico(index, 'quantidade', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removerServico(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {formData.servicos.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Clique em "Adicionar" para incluir serviços à ordem.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: OrdemServico['status']) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataPrevista">Data Prevista</Label>
                  <Input
                    id="dataPrevista"
                    type="date"
                    value={formData.dataPrevista}
                    onChange={(e) => setFormData({ ...formData, dataPrevista: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais sobre a ordem..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingOrdem ? 'Atualizar' : 'Criar Ordem'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens de Serviço</CardTitle>
          <CardDescription>
            {ordensServico.length} ordem(ns) cadastrada(s)
          </CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ordens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ordensFiltradas.map((ordem) => {
              const statusConfig = getStatusBadge(ordem.status);
              return (
                <div key={ordem.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">OS #{ordem.id.slice(-4)}</h3>
                        <Badge variant={statusConfig.color as any}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cliente: <strong>{ordem.cliente.nome}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Abertura: {new Date(ordem.dataAbertura).toLocaleDateString('pt-BR')}
                        {ordem.dataPrevista && (
                          <> • Previsão: {new Date(ordem.dataPrevista).toLocaleDateString('pt-BR')}</>
                        )}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        R$ {ordem.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ordem.servicos.length} serviço(s)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {ordem.servicos.slice(0, 2).map((item, index) => (
                        <span key={index}>
                          {item.servico.nome}
                          {item.quantidade > 1 && ` (${item.quantidade}x)`}
                          {index < Math.min(ordem.servicos.length, 2) - 1 && ', '}
                        </span>
                      ))}
                      {ordem.servicos.length > 2 && <span>...</span>}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setOrdemDetalhes(ordem);
                          setDetalhesOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirWhatsApp(ordem.cliente.telefone, ordem.cliente.nome, ordem)}
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      
                      <ImpressaoOS ordem={ordem} />
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirDialog(ordem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(ordem)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {ordensFiltradas.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm || statusFiltro !== 'todos' 
                    ? 'Nenhuma ordem encontrada com os filtros aplicados.' 
                    : 'Nenhuma ordem de serviço cadastrada ainda.'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={detalhesOpen} onOpenChange={setDetalhesOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {ordemDetalhes && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da OS #{ordemDetalhes.id.slice(-4)}</DialogTitle>
                <DialogDescription>
                  Informações completas da ordem de serviço
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Cliente</h4>
                  <p><strong>{ordemDetalhes.cliente.nome}</strong></p>
                  <p className="text-sm text-muted-foreground">{ordemDetalhes.cliente.telefone}</p>
                  {ordemDetalhes.cliente.email && (
                    <p className="text-sm text-muted-foreground">{ordemDetalhes.cliente.email}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Serviços</h4>
                  <div className="space-y-2">
                    {ordemDetalhes.servicos.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium">{item.servico.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantidade}x R$ {item.valorUnitario.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">
                          R$ {item.valorTotal.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total:</span>
                      <span>R$ {ordemDetalhes.valorTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">Status</h4>
                    <Badge variant={getStatusBadge(ordemDetalhes.status).color as any}>
                      {getStatusBadge(ordemDetalhes.status).label}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Data de Abertura</h4>
                    <p className="text-sm">{new Date(ordemDetalhes.dataAbertura).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                {ordemDetalhes.dataPrevista && (
                  <div>
                    <h4 className="font-semibold mb-1">Data Prevista</h4>
                    <p className="text-sm">{new Date(ordemDetalhes.dataPrevista).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                
                {ordemDetalhes.observacoes && (
                  <div>
                    <h4 className="font-semibold mb-1">Observações</h4>
                    <p className="text-sm text-muted-foreground">{ordemDetalhes.observacoes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdensServico;
