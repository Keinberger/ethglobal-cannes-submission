export default function StatCard({ label, value, color = 'text-gray-900' }) {
    return (
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <span className={`font-bold text-xl ${color}`}>{value}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    )
  }