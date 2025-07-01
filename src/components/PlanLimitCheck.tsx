
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useCRM } from '@/contexts/SupabaseCRMContext';

interface PlanLimitCheckProps {
  resourceType: 'clients' | 'users';
  currentCount: number;
  children: React.ReactNode;
}

const PlanLimitCheck = ({ resourceType, currentCount, children }: PlanLimitCheckProps) => {
  // Para sistema single-tenant, não há limites
  // Simplesmente renderiza os children sem verificações
  return <>{children}</>;
};

export default PlanLimitCheck;
