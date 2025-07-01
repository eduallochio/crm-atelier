
-- Criar tabela para configurações de customização
CREATE TABLE public.customization_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  atelier_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Habilitar RLS
ALTER TABLE public.customization_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para customization_settings
CREATE POLICY "Users can view own organization customization" 
  ON public.customization_settings 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own organization customization" 
  ON public.customization_settings 
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own organization customization" 
  ON public.customization_settings 
  FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Criar bucket de storage para assets da organização
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-assets', 'organization-assets', true);

-- Política para o storage bucket
CREATE POLICY "Organization members can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-assets' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view organization assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-assets');

CREATE POLICY "Organization members can update their assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'organization-assets' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Organization members can delete their assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-assets' 
  AND auth.uid() IS NOT NULL
);
