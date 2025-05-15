
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Database, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type SidebarItem = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const SidebarItem = ({ label, icon, active = false }: SidebarItem) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 px-3 py-6 text-left h-auto",
        active 
          ? "bg-invoice-blue-light text-invoice-blue font-medium" 
          : "text-invoice-gray-dark"
      )}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <span className="ml-auto block h-6 w-1 rounded-l bg-invoice-blue"></span>
      )}
    </Button>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const isMobile = useIsMobile();
  
  // Auto-collapse on mobile
  React.useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  return (
    <aside 
      className={cn(
        "bg-white h-[calc(100vh-4rem)] border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex-1 py-4">
        <div className="px-3 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Réduire</span>}
          </Button>
        </div>
        
        <nav className="space-y-1 px-3">
          <SidebarItem 
            label="Tableau de bord" 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            active={true}
          />
          
          <SidebarItem 
            label="Téléverser" 
            icon={<Upload className="h-5 w-5" />} 
          />
          
          <SidebarItem 
            label="Documents" 
            icon={<FileText className="h-5 w-5" />} 
          />
          
          <SidebarItem 
            label="Intégration" 
            icon={<Database className="h-5 w-5" />} 
          />
        </nav>
      </div>
      
      <div className="px-3 py-4 border-t border-gray-200">
        <SidebarItem 
          label="Paramètres" 
          icon={<Settings className="h-5 w-5" />} 
        />
      </div>
    </aside>
  );
};

export default Sidebar;
