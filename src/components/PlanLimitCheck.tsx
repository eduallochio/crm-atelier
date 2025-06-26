
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseCRM } from '@/contexts/SupabaseCRMContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, AlertTriangle } from 'lucide-react';

interface PlanLimitCheckProps {
  resourceType: 'clients' | 'users';
  currentCount: number;
  children: React.ReactNode;
}

const PlanLimitCheck = ({ resourceType, currentCount, children }: PlanLimitCheckProps) => {
  const { organization } = useAuth();
  
  const getLimit = () => {
    if (organization?.plan === 'enterprise') return null; // Unlimited
    return resourceType === 'clients' ? 50 : 1;
  };

  const limit = getLimit();
  const isAtLimit = limit !== null && currentCount >= limit;
  const isNearLimit = limit !== null && currentCount >= limit * 0.8;

  if (isAtLimit) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Limite atingido! Você atingiu o limite de {limit} {resourceType === 'clients' ? 'clientes' : 'usuários'} do plano gratuito.
              </span>
              <Button size="sm" className="ml-4">
                <Crown className="h-4 w-4 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isNearLimit) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Você está próximo do limite ({currentCount}/{limit} {resourceType === 'clients' ? 'clientes' : 'usuários'}).
              </span>
              <Button size="sm" variant="outline">
                <Crown className="h-4 w-4 mr-2" />
                Ver Planos
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

export default PlanLimitCheck;
