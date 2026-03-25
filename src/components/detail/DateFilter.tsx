import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Re-exported for Plan 03 (ProjectDetailPage) to import
export type QuickPreset = "hoje" | "7dias" | "30dias" | "tudo";

export type FilterState =
  | { mode: "quick"; preset: QuickPreset }
  | { mode: "range"; from: Date; to: Date };

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
  const activePreset = value.mode === "quick" ? value.preset : null;

  // Convert Date to YYYY-MM-DD string for input value
  const toInputValue = (d: Date): string => d.toISOString().slice(0, 10);

  const fromValue = value.mode === "range" ? toInputValue(value.from) : "";
  const toValue = value.mode === "range" ? toInputValue(value.to) : "";

  const handlePreset = (preset: QuickPreset) => {
    onChange({ mode: "quick", preset });
  };

  const handleDateChange = (field: "from" | "to", raw: string) => {
    if (!raw) {
      // Revert to "Tudo" when a date field is cleared
      onChange({ mode: "quick", preset: "tudo" });
      return;
    }
    const date = new Date(raw + "T00:00:00");
    const otherRaw = field === "from" ? toValue : fromValue;
    if (!otherRaw) return; // wait until both fields are filled
    const other = new Date(otherRaw + "T00:00:00");
    const [from, to] = field === "from" ? [date, other] : [other, date];
    onChange({ mode: "range", from, to });
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Quick filter buttons */}
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

        {/* Date range inputs */}
        <div className="flex items-center gap-2">
          <label htmlFor="date-from" className="text-sm text-muted-foreground">
            De
          </label>
          <Input
            id="date-from"
            type="date"
            value={fromValue}
            onChange={(e) => handleDateChange("from", e.target.value)}
            className="w-36"
            aria-label="Data inicial"
          />
          <label htmlFor="date-to" className="text-sm text-muted-foreground">
            Ate
          </label>
          <Input
            id="date-to"
            type="date"
            value={toValue}
            onChange={(e) => handleDateChange("to", e.target.value)}
            className="w-36"
            aria-label="Data final"
          />
        </div>
      </div>
    </div>
  );
}
