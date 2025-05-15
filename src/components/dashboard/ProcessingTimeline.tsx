
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Mock data for processing times
const data = [
  { name: 'Lun', time: 22 },
  { name: 'Mar', time: 35 },
  { name: 'Mer', time: 18 },
  { name: 'Jeu', time: 42 },
  { name: 'Ven', time: 25 },
  { name: 'Sam', time: 15 },
  { name: 'Dim', time: 10 },
];

const ProcessingTimeline = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Temps de Traitement (dernier 7 jours)</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Secondes', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 12 } 
                }}
              />
              <Tooltip 
                formatter={(value) => [`${value} secondes`, 'Temps moyen']}
                contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="time" fill="#1E67AF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingTimeline;
