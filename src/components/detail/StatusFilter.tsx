import { Button } from "@/components/ui/button";

export type StatusFilterValue = "todos" | "falhas" | "sucessos";

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={value === "falhas" ? "default" : "outline"}
        size="sm"
        className="h-11"
        onClick={() => onChange(value === "falhas" ? "todos" : "falhas")}
        aria-pressed={value === "falhas"}
      >
        Falhas
      </Button>
      <Button
        variant={value === "sucessos" ? "default" : "outline"}
        size="sm"
        className="h-11"
        onClick={() => onChange(value === "sucessos" ? "todos" : "sucessos")}
        aria-pressed={value === "sucessos"}
      >
        Sucessos
      </Button>
    </div>
  );
}
