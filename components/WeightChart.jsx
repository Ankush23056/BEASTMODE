import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Mon', value: 100 },
  { name: 'Tue', value: 100 },
  { name: 'Wed', value: 100 },
  { name: 'Thu', value: 0 },
  { name: 'Fri', value: 100 },
  { name: 'Sat', value: 0 },
  { name: 'Sun', value: 50 },
];
const todayIndex = new Date().getDay() - 1;

const WeeklyActivityChart = () => {
  return (
    <div style={{ width: '100%', height: 250, minWidth: 0 }}>
        <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--color-content-200)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide={true} domain={[0, 100]} />
                <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                    {data.map((entry, index) => {
                        const isToday = index === todayIndex;
                        return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={isToday ? 'var(--color-brand-primary)' : 'var(--color-content-200)'} 
                              opacity={isToday ? 1 : 0.25}
                            />
                        );
                    })}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default WeeklyActivityChart;
