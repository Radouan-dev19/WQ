import { Check } from "lucide-react";

type Props = {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  max?: number;
  exact?: number;
  columns?: 1 | 2;
};

export function SelectionGrid({ options, selected, onChange, max = 1, exact, columns = 1 }: Props) {
  const toggle = (option: string) => {
    if (selected.includes(option)) onChange(selected.filter((value) => value !== option));
    else if (max === 1) onChange([option]);
    else if (selected.length < max) onChange([...selected, option]);
  };
  return (
    <div className={`selection-grid columns-${columns}`} role="group" aria-label="Choix proposés">
      {options.map((option) => {
        const active = selected.includes(option);
        const disabled = max > 1 && !active && selected.length >= max;
        return (
          <button key={option} type="button" className="selection-card" aria-pressed={active} disabled={disabled} onClick={() => toggle(option)}>
            <span>{option}</span><span className="selection-check" aria-hidden="true">{active ? <Check size={16} strokeWidth={3} /> : null}</span>
          </button>
        );
      })}
      {(max > 1 || exact) && <p className="selection-count" aria-live="polite">{selected.length} / {exact ?? max} sélection{selected.length > 1 ? "s" : ""}</p>}
    </div>
  );
}
