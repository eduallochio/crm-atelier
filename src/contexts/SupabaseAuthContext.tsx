
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  organization_id?: string;
  is_owner?: boolean;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    console.log('Fetching user data for:', userId);
    try {
      // Tentar buscar o perfil do usuário de forma mais simples para evitar recursão
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user data:', error);
        // Se houver erro de RLS, criar um perfil temporário baseado nos dados do usuário
        if (error.code === '42P17') {
          console.log('RLS recursion detected, creating temporary profile from user metadata');
          const tempProfile: Profile = {
            id: userId,
            email: user?.email || '',
            full_name: user?.user_metadata?.full_name || user?.email || '',
            organization_id: undefined,
            is_owner: false,
            role: 'user'
          };
          setProfile(tempProfile);
          return;
        }
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        console.log('No profile found, user may need to complete setup');
        // Criar perfil temporário se não existir
        const tempProfile: Profile = {
          id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || user?.email || '',
          organization_id: undefined,
          is_owner: false,
          role: 'user'
        };
        setProfile(tempProfile);
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      // Fallback para perfil temporário em caso de erro
      const fallbackProfile: Profile = {
        id: userId,
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || user?.email || '',
        organization_id: undefined,
        is_owner: false,
        role: 'user'
      };
      setProfile(fallbackProfile);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      
      try {
        // Obter sessão atual
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchUserData(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
