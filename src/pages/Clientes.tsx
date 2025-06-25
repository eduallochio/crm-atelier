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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gerencie seus clientes</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Novo Cliente</span>
              <span className="xs:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto">
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
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {editingCliente ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Lista de Clientes</CardTitle>
          <CardDescription className="text-sm">
            {clientesFiltrados.length} de {clientes.length} cliente(s)
          </CardDescription>
          
          <SearchFilter
            searchPlaceholder="Buscar clientes..."
            filters={filterOptions}
            onSearch={setSearchTerm}
            onFilter={setFilters}
            onClear={clearFilters}
          />
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {clientesFiltrados.map((cliente) => (
              <div key={cliente.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="font-semibold text-base sm:text-lg truncate">{cliente.nome}</h3>
                    <Badge variant="outline" className="text-xs w-fit">
                      Cliente desde {new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 sm:gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 truncate">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{cliente.telefone}</span>
                    </div>
                    {cliente.email && (
                      <div className="flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{cliente.email}</span>
                      </div>
                    )}
                    {cliente.endereco && (
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{cliente.endereco.substring(0, 30)}...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 justify-end sm:justify-start">
                  <Button
                    size="sm"
                    onClick={() => abrirWhatsApp(cliente.telefone, cliente.nome)}
                    className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline ml-2">WhatsApp</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => abrirDialog(cliente)}
                    className="flex-shrink-0"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline ml-2">Editar</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(cliente)}
                    className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline ml-2">Excluir</span>
                  </Button>
                </div>
              </div>
            ))}
            
            {clientesFiltrados.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-base sm:text-lg font-medium mb-2">
                  {searchTerm || Object.keys(filters).length > 0 ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </p>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base px-4">
                  {searchTerm || Object.keys(filters).length > 0 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Comece cadastrando seu primeiro cliente.'
                  }
                </p>
                {!searchTerm && Object.keys(filters).length === 0 && (
                  <Button onClick={() => abrirDialog()} className="w-full sm:w-auto">
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
