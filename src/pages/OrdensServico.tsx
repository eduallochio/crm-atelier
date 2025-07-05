
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCRM } from '@/contexts/SupabaseCRMContext';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

const OrdensServico = () => {
  const { serviceOrders, clients, addServiceOrder, updateServiceOrder, deleteServiceOrder, loading } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    status: 'pendente',
    valor_total: '',
    data_prevista: '',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderData = {
        ...formData,
        valor_total: parseFloat(formData.valor_total)
      };

      if (editingOrder) {
        await updateServiceOrder(editingOrder.id, orderData);
      } else {
        await addServiceOrder(orderData);
      }
      setIsDialogOpen(false);
      setEditingOrder(null);
      setFormData({ client_id: '', status: 'pendente', valor_total: '', data_prevista: '', observacoes: '' });
    } catch (error) {
      console.error('Erro ao salvar ordem de serviço:', error);
    }
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setFormData({
      client_id: order.client_id || '',
      status: order.status || 'pendente',
      valor_total: order.valor_total?.toString() || '',
      data_prevista: order.data_prevista ? new Date(order.data_prevista).toISOString().split('T')[0] : '',
      observacoes: order.observacoes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      try {
        await deleteServiceOrder(id);
      } catch (error) {
        console.error('Erro ao excluir ordem de serviço:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pendente': { label: 'Pendente', variant: 'secondary' as const },
      'em_andamento': { label: 'Em Andamento', variant: 'default' as const },
      'concluida': { label: 'Concluída', variant: 'default' as const },
      'cancelada': { label: 'Cancelada', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const filteredOrders = serviceOrders.filter(order =>
    order.client?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerencie suas ordens de serviço</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingOrder(null);
              setFormData({ client_id: '', status: 'pendente', valor_total: '', data_prevista: '', observacoes: '' });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Ordem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingOrder ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
                </DialogTitle>
                <DialogDescription>
                  {editingOrder ? 'Edite as informações da ordem de serviço.' : 'Crie uma nova ordem de serviço.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="client_id">Cliente</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="valor_total">Valor Total (R$)</Label>
                  <Input
                    id="valor_total"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_total}
                    onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="data_prevista">Data Prevista</Label>
                  <Input
                    id="data_prevista"
                    type="date"
                    value={formData.data_prevista}
                    onChange={(e) => setFormData({ ...formData, data_prevista: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Observações sobre a ordem..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingOrder ? 'Salvar Alterações' : 'Criar Ordem'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens de Serviço</CardTitle>
          <CardDescription>
            {serviceOrders.length} ordens cadastradas
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ordens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Data Abertura</TableHead>
                <TableHead>Data Prevista</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.client?.nome || 'Cliente não encontrado'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status || 'pendente')}
                  </TableCell>
                  <TableCell>R$ {Number(order.valor_total).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(order.data_abertura).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {order.data_prevista ? new Date(order.data_prevista).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(order)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma ordem encontrada.' : 'Nenhuma ordem cadastrada ainda.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdensServico;
