
import { 
  Users, 
  FileText, 
  Scissors, 
  CreditCard, 
  Wallet, 
  Home,
  User
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Serviços", url: "/servicos", icon: Scissors },
  { title: "Ordens de Serviço", url: "/ordens-servico", icon: FileText },
  { title: "Financeiro", url: "/financeiro", icon: CreditCard },
  { title: "Caixa", url: "/caixa", icon: Wallet },
  { title: "Perfil", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground shadow-sm" 
      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b bg-white/50 dark:bg-slate-900/50 p-6">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Scissors className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                Atelier CRM
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sistema de Gestão</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Scissors className="h-6 w-6 text-primary" />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent className="bg-white/30 dark:bg-slate-900/30">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 dark:text-slate-400 font-medium">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                        ${getNavCls({ isActive })}
                      `}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
