
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useCustomization } from "@/contexts/CustomizationContext";
import { User, Settings, CreditCard, Upload, Crown, Calendar } from "lucide-react";

const Profile = () => {
  const { profile, organization } = useAuth();
  const { settings, updateSettings, uploadLogo } = useCustomization();
  const [atelierName, setAtelierName] = useState(settings?.atelier_name || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleSaveCustomization = async () => {
    if (atelierName !== settings?.atelier_name) {
      await updateSettings({ atelier_name: atelierName });
    }

    if (logoFile) {
      await uploadLogo(logoFile);
      setLogoFile(null);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleUpgradeClick = () => {
    // TODO: Implementar sistema de pagamento
    console.log('Upgrade clicked');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil e Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações do sistema</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="customization">
            <Settings className="h-4 w-4 mr-2" />
            Customização
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Assinatura
          </TabsTrigger>
          <TabsTrigger value="history">
            <Calendar className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Suas informações de perfil e da organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={profile?.full_name || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Organização</Label>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{organization?.name}</span>
                  <Badge 
                    variant={organization?.plan === 'enterprise' ? 'default' : 'secondary'}
                    className={organization?.plan === 'enterprise' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}
                  >
                    {organization?.plan === 'enterprise' && <Crown className="h-3 w-3 mr-1" />}
                    {organization?.plan === 'enterprise' ? 'Enterprise' : 'Gratuito'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customization">
          <Card>
            <CardHeader>
              <CardTitle>Customização do Atelier</CardTitle>
              <CardDescription>
                Personalize a aparência do seu sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="atelier-name">Nome do Atelier</Label>
                <Input
                  id="atelier-name"
                  value={atelierName}
                  onChange={(e) => setAtelierName(e.target.value)}
                  placeholder="Digite o nome do seu atelier"
                />
              </div>

              <div>
                <Label htmlFor="logo-upload">Logo do Atelier</Label>
                <div className="space-y-2">
                  {settings?.logo_url && (
                    <div className="w-32 h-32 border rounded-lg overflow-hidden">
                      <img 
                        src={settings.logo_url} 
                        alt="Logo atual" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Formatos aceitos: PNG, JPG, SVG (máx. 2MB)
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveCustomization}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Plano e Assinatura</CardTitle>
              <CardDescription>
                Gerencie seu plano e informações de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plano Gratuito</CardTitle>
                    <CardDescription>Plano atual</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Clientes</span>
                        <span>50 máx.</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usuários</span>
                        <span>1 usuário</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Suporte</span>
                        <span>Email</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Crown className="h-5 w-5 text-primary" />
                      Plano Enterprise
                    </CardTitle>
                    <CardDescription>Recomendado para negócios</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Clientes</span>
                        <span>Ilimitado</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usuários</span>
                        <span>Ilimitado</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Suporte</span>
                        <span>Prioritário</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        R$ 49,90/mês
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      onClick={handleUpgradeClick}
                    >
                      Fazer Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Histórico de pagamentos e transações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma transação encontrada
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Quando você realizar pagamentos, eles aparecerão aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
