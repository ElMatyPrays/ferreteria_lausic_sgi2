type TabsProps<T extends string> = {
  tabs: readonly T[];
  active: T;
  onChange: (t: T) => void;
};

export default function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <div className="mc-tabs">
      {tabs.map(t => (
        <button
          key={t}
          className={`mc-tab ${t === active ? "active" : ""}`}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
