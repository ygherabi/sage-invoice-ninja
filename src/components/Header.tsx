
import React from 'react';
import { Bell, HelpCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const Header = () => {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-invoice-blue">InvoiceScan</h1>
          <span className="rounded-md bg-invoice-blue px-1.5 py-0.5 text-xs font-semibold text-white">
            BETA
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5 text-invoice-gray-dark" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-invoice-gray-dark" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 rounded-full h-8 w-8"
              >
                <User className="h-5 w-5 text-invoice-gray-dark" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>Mon profil</DropdownMenuItem>
              <DropdownMenuItem>Paramètres</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
