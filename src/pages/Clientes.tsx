
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useCRM, Cliente } from '@/contexts/CRMContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/components/NotificationSystem';
import { Plus, MessageCircle, Edit, Trash2, Phone, Mail, MapPin, Users } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import SearchFilter from '@/components/SearchFilter';

const Clientes = () => {
  const { clientes, adicionarCliente, atualizarCliente, excluirCliente } = useCRM();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: ''
  });

  const filterOptions = [
    {
      key: 'periodo',
      label: 'Período de Cadastro',
      options: [
        { value: 'hoje', label: 'Hoje' },
        { value: 'semana', label: 'Esta Semana' },
        { value: 'mes', label: 'Este Mês' },
        { value: 'ano', label: 'Este Ano' },
      ]
    },
  ];

  const clientesFiltrados = clientes.filter(cliente => {
    // Filtro de busca
    const matchSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.includes(searchTerm) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    // Filtro de período
    if (filters.periodo) {
      const cadastro = new Date(cliente.dataCadastro);
      const hoje = new Date();
      
      switch (filters.periodo) {
        case 'hoje':
          if (cadastro.toDateString() !== hoje.toDateString()) return false;
          break;
        case 'semana':
          const semanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (cadastro < semanaAtras) return false;
          break;
        case 'mes':
          if (cadastro.getMonth() !== hoje.getMonth() || cadastro.getFullYear() !== hoje.getFullYear()) return false;
          break;
        case 'ano':
          if (cadastro.getFullYear() !== hoje.getFullYear()) return false;
          break;
      }
    }

    return true;
  });

  const abrirDialog = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nome: cliente.nome,
        telefone: cliente.telefone,
        email: cliente.email || '',
        endereco: cliente.endereco || ''
      });
    } else {
      setEditingCliente(null);
      setFormData({ nome: '', telefone: '', email: '', endereco: '' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCliente) {
      atualizarCliente(editingCliente.id, formData);
      toast({
        title: "Cliente atualizado",
        description: `${formData.nome} foi atualizado com sucesso.`
      });
      addNotification({
        type: 'success',
        title: 'Cliente Atualizado',
        message: `${formData.nome} foi atualizado com sucesso.`
      });
    } else {
      adicionarCliente(formData);
      toast({
        title: "Cliente cadastrado",
        description: `${formData.nome} foi cadastrado com sucesso.`
      });
      addNotification({
        type: 'success',
        title: 'Novo Cliente',
        message: `${formData.nome} foi cadastrado com sucesso.`
      });
    }
    
    setDialogOpen(false);
    setFormData({ nome: '', telefone: '', email: '', endereco: '' });
  };

  const handleDelete = (cliente: Cliente) => {
    if (confirm(`Tem certeza que deseja excluir ${cliente.nome}?`)) {
      excluirCliente(cliente.id);
      toast({
        title: "Cliente excluído",
        description: `${cliente.nome} foi excluído com sucesso.`
      });
      addNotification({
        type: 'info',
        title: 'Cliente Excluído',
        message: `${cliente.nome} foi removido do sistema.`
      });
    }
  };

  const abrirWhatsApp = (telefone: string, nome: string) => {
    const numeroLimpo = telefone.replace(/\D/g, '');
    const mensagem = encodeURIComponent(`Olá ${nome}! Como posso ajudá-la hoje?`);
    const url = `https://wa.me/55${numeroLimpo}?text=${mensagem}`;
    window.open(url, '_blank');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
              <DialogDescription>
                {editingCliente 
                  ? 'Atualize as informações do cliente.' 
                  : 'Cadastre um novo cliente no sistema.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Endereço completo"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCliente ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {clientesFiltrados.length} de {clientes.length} cliente(s)
          </CardDescription>
          
          <SearchFilter
            searchPlaceholder="Buscar clientes por nome, telefone ou email..."
            filters={filterOptions}
            onSearch={setSearchTerm}
            onFilter={setFilters}
            onClear={clearFilters}
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientesFiltrados.map((cliente) => (
              <div key={cliente.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                    <Badge variant="outline" className="text-xs">
                      Cliente desde {new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {cliente.telefone}
                    </div>
                    {cliente.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {cliente.email}
                      </div>
                    )}
                    {cliente.endereco && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {cliente.endereco.substring(0, 30)}...
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => abrirWhatsApp(cliente.telefone, cliente.nome)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => abrirDialog(cliente)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(cliente)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {clientesFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  {searchTerm || Object.keys(filters).length > 0 ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </p>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || Object.keys(filters).length > 0 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Comece cadastrando seu primeiro cliente.'
                  }
                </p>
                {!searchTerm && Object.keys(filters).length === 0 && (
                  <Button onClick={() => abrirDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Primeiro Cliente
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clientes;
