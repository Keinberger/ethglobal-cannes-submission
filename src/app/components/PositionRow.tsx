export default function PositionRow({ label, value, color = 'text-gray-900' }) {
    return (
      <div className="flex justify-between">
        <span>{label}</span>
        <span className={color}>{value}</span>
      </div>
    )
  }