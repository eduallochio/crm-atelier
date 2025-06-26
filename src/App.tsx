
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/SupabaseAuthContext";
import { SupabaseCRMProvider } from "./contexts/SupabaseCRMContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { NotificationProvider } from "./components/NotificationSystem";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Servicos from "./pages/Servicos";
import OrdensServico from "./pages/OrdensServico";
import Financeiro from "./pages/Financeiro";
import Caixa from "./pages/Caixa";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <SupabaseCRMProvider>
                    <NotificationProvider>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </NotificationProvider>
                  </SupabaseCRMProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/clientes" element={
                <ProtectedRoute>
                  <SupabaseCRMProvider>
                    <NotificationProvider>
                      <Layout>
                        <Clientes />
                      </Layout>
                    </NotificationProvider>
                  </SupabaseCRMProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/servicos" element={
                <ProtectedRoute>
                  <SupabaseCRMProvider>
                    <NotificationProvider>
                      <Layout>
                        <Servicos />
                      </Layout>
                    </NotificationProvider>
                  </SupabaseCRMProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/ordens-servico" element={
                <ProtectedRoute>
                  <SupabaseCRMProvider>
                    <NotificationProvider>
                      <Layout>
                        <OrdensServico />
                      </Layout>
                    </NotificationProvider>
                  </SupabaseCRMProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/financeiro" element={
                <ProtectedRoute>
                  <SupabaseCRMProvider>
                    <NotificationProvider>
                      <Layout>
                        <Financeiro />
                      </Layout>
                    </NotificationProvider>
                  </SupabaseCRMProvider>
                </ProtectedRoute>
              } />
              
              <Route path="/caixa" element={
                <ProtectedRoute>
                  <SupabaseCRMProvider>
                    <NotificationProvider>
                      <Layout>
                        <Caixa />
                      </Layout>
                    </NotificationProvider>
                  </SupabaseCRMProvider>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
