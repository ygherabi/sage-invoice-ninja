
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Check, XCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActivityStatus = 'success' | 'error' | 'warning' | 'pending';

type ActivityItem = {
  id: string;
  title: string;
  timestamp: string;
  status: ActivityStatus;
}

const statusIcons = {
  success: <Check className="h-4 w-4 text-green-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
  warning: <AlertCircle className="h-4 w-4 text-amber-500" />,
  pending: <Clock className="h-4 w-4 text-blue-500" />
};

const mockActivities: ActivityItem[] = [
  { 
    id: '1', 
    title: 'Facture EDF_2023-05.pdf traitée',
    timestamp: 'Il y a 5 minutes',
    status: 'success'
  },
  { 
    id: '2', 
    title: 'Facture Orange_042023.pdf en échec', 
    timestamp: 'Il y a 15 minutes',
    status: 'error'
  },
  { 
    id: '3', 
    title: 'Facture Fournisseur_XYZ.pdf validée manuellement',
    timestamp: 'Il y a 32 minutes',
    status: 'warning'
  },
  { 
    id: '4', 
    title: 'Lot #2568 (5 factures) en traitement',
    timestamp: 'Il y a 1 heure',
    status: 'pending'
  },
  { 
    id: '5', 
    title: 'Facture Microsoft_Cloud_042023.pdf intégrée',
    timestamp: 'Il y a 2 heures',
    status: 'success'
  }
];

const RecentActivity = () => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Activité Récente</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="space-y-1">
          {mockActivities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200">
                {statusIcons[activity.status]}
              </div>
              
              <div className="grid gap-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
