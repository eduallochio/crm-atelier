
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

interface CustomizationSettings {
  id: string;
  organization_id: string;
  atelier_name: string;
  logo_url?: string;
  primary_color?: string;
  created_at: string;
  updated_at: string;
}

interface CustomizationContextType {
  settings: CustomizationSettings | null;
  loading: boolean;
  updateSettings: (data: Partial<CustomizationSettings>) => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (context === undefined) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};

export const CustomizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { organization, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<CustomizationSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organization && isAuthenticated) {
      loadSettings();
    }
  }, [organization, isAuthenticated]);

  const loadSettings = async () => {
    if (!organization) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customization_settings')
        .select('*')
        .eq('organization_id', organization.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings
        const defaultSettings = {
          organization_id: organization.id,
          atelier_name: organization.name || 'Meu Atelier',
          primary_color: '#3b82f6',
        };

        const { data: newSettings, error: createError } = await supabase
          .from('customization_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error loading customization settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações de customização",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (data: Partial<CustomizationSettings>) => {
    if (!organization || !settings) return;

    try {
      const { error } = await supabase
        .from('customization_settings')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', organization.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...data } : null);
      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações",
        variant: "destructive",
      });
    }
  };

  const uploadLogo = async (file: File) => {
    if (!organization) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organization.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-assets')
        .getPublicUrl(fileName);

      await updateSettings({ logo_url: publicUrl });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da logo",
        variant: "destructive",
      });
    }
  };

  const value = {
    settings,
    loading,
    updateSettings,
    uploadLogo,
  };

  return (
    <CustomizationContext.Provider value={value}>
      {children}
    </CustomizationContext.Provider>
  );
};
