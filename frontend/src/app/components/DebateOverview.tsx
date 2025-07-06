import Image from 'next/image';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { debateType } from '../types';
import { usePrices } from '../hooks/usePrices';

type Props = {
  debate: debateType;
};

export default function DebateOverview({ debate }: Props) {
  const { historicalPrices, loading, error } = usePrices();

  // Create base data points from historical prices
  const baseData = historicalPrices.map((price, index) => {
    const percentage = price.upPriceUSD * 100; // Convert to percentage
    const hoursAgo = historicalPrices.length - index;
    return {
      time: `${hoursAgo}h ago`,
      timeIndex: index,
      percentage: percentage,
      greenLine: percentage >= 50 ? percentage : null,
      redLine: percentage < 50 ? percentage : null,
    };
  });

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
      const crossingHours = Math.round(baseData.length - crossingTimeIndex);

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

  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500">Loading price data...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      );
    }

    if (historicalPrices.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500">No price data available</div>
        </div>
      );
    }

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              interval={Math.floor(baseData.length / 4)} // Show ~4 labels
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
                      key={`green-dot-${payload.timeIndex}`}
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
                      key={`green-active-dot-${payload.timeIndex}`}
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
                      key={`red-dot-${payload.timeIndex}`}
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
                      key={`red-active-dot-${payload.timeIndex}`}
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
    );
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow p-6">
      {/* Header Section */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={debate.image}
            alt={debate.title}
            fill
            className="object-cover rounded"
            sizes="64px"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-6xl font-bold text-gray-900 mb-1">{debate.title}</h1>
          {/* Compact Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span className="text-green-600 font-medium">{debate.noPercent}% No</span>
              <span className="text-red-600 font-medium">{debate.yesPercent}% Yes</span>
            </div>
            <div className="w-full bg-green-500 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${debate.noPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div>
        {renderChart()}
      </div>
    </div>
  );
}