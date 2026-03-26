import { Button } from "@/components/ui/button";

export type QuickPreset = "hoje" | "7dias" | "30dias" | "tudo";

export type FilterState =
  | { mode: "quick"; preset: QuickPreset };

export interface DateFilterProps {
  value: FilterState;
  onChange: (state: FilterState) => void;
}

const QUICK_FILTERS: { preset: QuickPreset; label: string }[] = [
  { preset: "hoje", label: "Hoje" },
  { preset: "7dias", label: "7 dias" },
  { preset: "30dias", label: "30 dias" },
  { preset: "tudo", label: "Tudo" },
];

export function DateFilter({ value, onChange }: DateFilterProps) {
  const activePreset = value.preset;

  const handlePreset = (preset: QuickPreset) => {
    onChange({ mode: "quick", preset });
  };

  return (
    <div className="flex items-center gap-2">
      {QUICK_FILTERS.map(({ preset, label }) => (
        <Button
          key={preset}
          variant={activePreset === preset ? "default" : "outline"}
          size="sm"
          className="h-11"
          onClick={() => handlePreset(preset)}
          aria-pressed={activePreset === preset}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
