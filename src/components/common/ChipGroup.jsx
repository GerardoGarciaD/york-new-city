/**
 * Row of pill buttons where one option is selected.
 * options: [{ value, label }] — label can be text or JSX.
 */
export function ChipGroup({ options, selectedValue, onSelect, ariaLabel }) {
  return (
    <div className="chips" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === selectedValue ? "true" : "false"}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
