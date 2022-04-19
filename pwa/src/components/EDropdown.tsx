function EDropdown({ className, items, selected, onChange, disabled }: {
  className?: string;
  selected: any;
  items: { key: any; value: any;}[];
  onChange: (key: any) => void;
  disabled?: boolean;}) {
  return (
    <select
      className={`exh-input ${className || ''}`}
      aria-labelledby="dropdownButton"
      value={selected}
      onChange={e => { onChange(e.target.value); }}
      disabled={disabled}>
      { items.map((i:any) => (<option key={i.key} value={i.key} className="block py-1 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">{ i.value } </option>)) }
    </select>
  );
}

export default EDropdown;
