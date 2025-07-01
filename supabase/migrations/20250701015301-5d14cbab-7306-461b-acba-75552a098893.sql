
-- Drop RLS policies that depend on organization_id
DROP POLICY IF EXISTS "Users can view own organization customization" ON public.customization_settings;
DROP POLICY IF EXISTS "Users can update own organization customization" ON public.customization_settings;
DROP POLICY IF EXISTS "Users can insert own organization customization" ON public.customization_settings;

DROP POLICY IF EXISTS "Users can manage clients in their organization" ON public.org_clients;
DROP POLICY IF EXISTS "Users can manage services in their organization" ON public.org_services;
DROP POLICY IF EXISTS "Users can manage orders in their organization" ON public.org_service_orders;

-- Remove organization_id from customization_settings table
ALTER TABLE public.customization_settings DROP COLUMN organization_id;

-- Remove organization_id from org_clients table
ALTER TABLE public.org_clients DROP COLUMN organization_id;

-- Remove organization_id from org_services table
ALTER TABLE public.org_services DROP COLUMN organization_id;

-- Remove organization_id from org_service_orders table
ALTER TABLE public.org_service_orders DROP COLUMN organization_id;

-- Create simpler RLS policies for single-tenant system
CREATE POLICY "Authenticated users can view customization" 
  ON public.customization_settings 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update customization" 
  ON public.customization_settings 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert customization" 
  ON public.customization_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage clients" 
  ON public.org_clients 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage services" 
  ON public.org_services 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage orders" 
  ON public.org_service_orders 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);
