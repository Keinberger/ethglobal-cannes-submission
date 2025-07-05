export default function ToggleButton({ label, active, onClick, color }) {
  const base = 'flex-1 px-4 py-2 rounded text-sm font-medium';
  const activeClass = color === 'green' ? 'bg-green-600 text-white' : 'bg-red-600 text-white';
  const inactiveClass = 'bg-gray-100 text-gray-700 hover:bg-gray-200 transition';
  return (
    <button className={`${base} ${active ? activeClass : inactiveClass}`} onClick={onClick}>
      {label}
    </button>
  );
}
