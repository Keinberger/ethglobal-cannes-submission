import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';

type Props = {
  trend: number[];
  title?: string;
};

export default function OpinionTimeline({ trend, title = 'Opinion Timeline' }: Props) {
  // Create base data points
  const baseData = trend.map((percentage, index) => ({
    time: `${trend.length - index}h ago`,
    timeIndex: index,
    percentage: percentage,
    greenLine: percentage >= 50 ? percentage : null,
    redLine: percentage < 50 ? percentage : null,
  }));

  // Add interpolated crossing points for smooth transitions
  const processedData: any[] = [];

  for (let i = 0; i < baseData.length; i++) {
    const current = baseData[i];
    const next = baseData[i + 1];

    // Add current point
    processedData.push(current);

    // Check if there's a crossing between current and next point
    if (
      next &&
      ((current.percentage < 50 && next.percentage >= 50) ||
        (current.percentage >= 50 && next.percentage < 50))
    ) {
      // Calculate interpolated crossing point
      const ratio = (50 - current.percentage) / (next.percentage - current.percentage);
      const crossingTimeIndex = current.timeIndex + ratio;
      const crossingHours = Math.round(trend.length - crossingTimeIndex);

      // Add crossing point with both colors to ensure continuity
      processedData.push({
        time: `${crossingHours}h ago`,
        timeIndex: crossingTimeIndex,
        percentage: 50,
        greenLine: 50, // Both lines meet at 50%
        redLine: 50, // Both lines meet at 50%
      });
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 flex-1">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              interval={Math.floor(trend.length / 4)} // Show ~4 labels
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `${value}%`}
              ticks={[0, 25, 50, 75, 100]}
            />

            {/* 50% Reference Line */}
            <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="8 8" strokeWidth={2} />

            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'greenLine' && value !== null) {
                  return [`${value}% Yes`, 'Opinion'];
                }
                if (name === 'redLine' && value !== null) {
                  return [`${value}% Yes`, 'Opinion'];
                }
                return null;
              }}
              labelFormatter={(label) => `Time: ${label}`}
              contentStyle={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />

            {/* Green Line (Above 50%) */}
            <Line
              type="monotone"
              dataKey="greenLine"
              stroke="#10b981"
              strokeWidth={3}
              dot={(props) => {
                const { payload } = props;
                if (payload.greenLine !== null) {
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill="#10b981"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  );
                }
                return null;
              }}
              activeDot={(props) => {
                const { payload } = props;
                if (payload.greenLine !== null) {
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={6}
                      fill="#10b981"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  );
                }
                return null;
              }}
              connectNulls={false}
            />

            {/* Red Line (Below 50%) */}
            <Line
              type="monotone"
              dataKey="redLine"
              stroke="#ef4444"
              strokeWidth={3}
              dot={(props) => {
                const { payload } = props;
                if (payload.redLine !== null) {
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill="#ef4444"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                  );
                }
                return null;
              }}
              activeDot={(props) => {
                const { payload } = props;
                if (payload.redLine !== null) {
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={6}
                      fill="#ef4444"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                  );
                }
                return null;
              }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
