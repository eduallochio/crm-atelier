
-- Create enum for subscription plans
CREATE TYPE subscription_plan AS ENUM ('free', 'enterprise');

-- Create organizations table (multi-tenant structure)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan subscription_plan NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  is_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create organization-specific clients table
CREATE TABLE public.org_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  endereco TEXT,
  data_cadastro TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create organization-specific services table
CREATE TABLE public.org_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create organization-specific service orders table
CREATE TABLE public.org_service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.org_clients(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pendente',
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  data_abertura TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_prevista TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription usage tracking
CREATE TABLE public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  clients_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  users_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update their org" ON public.organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND is_owner = true
    )
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their organization" ON public.profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- RLS Policies for org_clients
CREATE POLICY "Users can manage clients in their organization" ON public.org_clients
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- RLS Policies for org_services
CREATE POLICY "Users can manage services in their organization" ON public.org_services
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- RLS Policies for org_service_orders
CREATE POLICY "Users can manage orders in their organization" ON public.org_service_orders
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- RLS Policies for usage_metrics
CREATE POLICY "Users can view usage in their organization" ON public.usage_metrics
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Create organization for new user
  INSERT INTO public.organizations (name, slug)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'organization_name', 'Minha Empresa'),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'organization_name', 'empresa-' || NEW.id::text), ' ', '-'))
  )
  RETURNING id INTO org_id;
  
  -- Create profile for new user
  INSERT INTO public.profiles (id, organization_id, email, full_name, is_owner)
  VALUES (
    NEW.id,
    org_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    true
  );
  
  -- Initialize usage metrics
  INSERT INTO public.usage_metrics (organization_id)
  VALUES (org_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check plan limits
CREATE OR REPLACE FUNCTION public.check_plan_limits(org_id UUID, resource_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_plan subscription_plan;
  current_count INTEGER;
BEGIN
  -- Get organization plan
  SELECT plan INTO current_plan
  FROM public.organizations
  WHERE id = org_id;
  
  -- If enterprise plan, no limits
  IF current_plan = 'enterprise' THEN
    RETURN TRUE;
  END IF;
  
  -- Check limits for free plan
  IF resource_type = 'clients' THEN
    SELECT clients_count INTO current_count
    FROM public.usage_metrics
    WHERE organization_id = org_id;
    
    RETURN current_count < 50; -- Free plan limit
  END IF;
  
  IF resource_type = 'users' THEN
    SELECT COUNT(*) INTO current_count
    FROM public.profiles
    WHERE organization_id = org_id;
    
    RETURN current_count < 1; -- Free plan limit (only owner)
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
