'use client';

import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

interface DataPoint {
  date: string;
  rate: number;
}

interface Props {
  data: DataPoint[];
  color?: string;
}

export function SparklineChart({ data, color = '#10b981' }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-16 flex items-center justify-center bg-muted rounded-lg text-xs text-muted-foreground italic">
        No historical data available
      </div>
    );
  }

  // If only one data point, we can't draw a line, so we show a flat line or a note
  const displayData = data.length === 1 
    ? [data[0], { ...data[0], date: 'current' }] 
    : data;

  return (
    <div className="w-full h-64 min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
        <LineChart data={displayData}>
          <YAxis hide domain={['auto', 'auto']} />
          <Line 
            type="monotone" 
            dataKey="rate" 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
