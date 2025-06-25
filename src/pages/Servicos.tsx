
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCRM, Servico } from '@/contexts/CRMContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Edit, Trash2, Scissors } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const tiposServico = [
  'Ajuste',
  'Confecção',
  'Conserto',
  'Reforma',
  'Customização',
  'Outros'
];

const Servicos = () => {
  const { servicos, adicionarServico, atualizarServico, excluirServico } = useCRM();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    valor: '',
    descricao: ''
  });

  const servicosFiltrados = servicos.filter(servico => {
    const matchSearch = servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servico.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servico.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTipo = tipoFiltro === 'todos' || servico.tipo === tipoFiltro;
    
    return matchSearch && matchTipo;
  });

  const abrirDialog = (servico?: Servico) => {
    if (servico) {
      setEditingServico(servico);
      setFormData({
        nome: servico.nome,
        tipo: servico.tipo,
        valor: servico.valor.toString(),
        descricao: servico.descricao || ''
      });
    } else {
      setEditingServico(null);
      setFormData({ nome: '', tipo: '', valor: '', descricao: '' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const servicoData = {
      nome: formData.nome,
      tipo: formData.tipo,
      valor: parseFloat(formData.valor.replace(',', '.')),
      descricao: formData.descricao
    };
    
    if (editingServico) {
      atualizarServico(editingServico.id, servicoData);
      toast({
        title: "Serviço atualizado",
        description: `${formData.nome} foi atualizado com sucesso.`
      });
    } else {
      adicionarServico(servicoData);
      toast({
        title: "Serviço cadastrado",
        description: `${formData.nome} foi cadastrado com sucesso.`
      });
    }
    
    setDialogOpen(false);
    setFormData({ nome: '', tipo: '', valor: '', descricao: '' });
  };

  const handleDelete = (servico: Servico) => {
    if (confirm(`Tem certeza que deseja excluir ${servico.nome}?`)) {
      excluirServico(servico.id);
      toast({
        title: "Serviço excluído",
        description: `${servico.nome} foi excluído com sucesso.`
      });
    }
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
          <h1 className="text-3xl font-bold">Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => abrirDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
              <DialogDescription>
                {editingServico 
                  ? 'Atualize as informações do serviço.' 
                  : 'Cadastre um novo serviço no sistema.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Serviço *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Bainha simples"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Serviço *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposServico.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
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
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição detalhada do serviço"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingServico ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>
            {servicos.length} serviço(s) cadastrado(s)
          </CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {tiposServico.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servicosFiltrados.map((servico) => (
              <Card key={servico.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Scissors className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{servico.nome}</CardTitle>
                    </div>
                    <Badge variant="secondary">{servico.tipo}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold text-primary">
                    R$ {servico.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  
                  {servico.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {servico.descricao}
                    </p>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => abrirDialog(servico)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(servico)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {servicosFiltrados.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm || tipoFiltro !== 'todos' 
                    ? 'Nenhum serviço encontrado com os filtros aplicados.' 
                    : 'Nenhum serviço cadastrado ainda.'
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

export default Servicos;
