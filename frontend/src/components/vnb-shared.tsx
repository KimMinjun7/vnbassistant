import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Database } from "lucide-react"

export function SecHead({ num, title, desc, example }: { num: number; title: string; desc?: string; example?: boolean; icon?: typeof Database }) {
  return (
    <div className="pb-3 mb-4 border-b border-border">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center font-bold flex-shrink-0">{num}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {example && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300 font-medium">예시</span>}
      </div>
      {desc && <p className="text-xs text-muted-foreground mt-1.5 pl-7">{desc}</p>}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Database; label: string; value: string; sub: string }) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </Card>
  )
}

export function TriggerRow({ label, condition, status }: { label: string; condition: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 border border-border">
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{condition}</p>
      </div>
      <Badge variant="outline" className="text-[10px] border-green-500 text-green-600">{status}</Badge>
    </div>
  )
}

export function KvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-mono text-foreground text-right">{value}</span>
    </div>
  )
}

export function ResultBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`p-4 rounded-lg border text-center ${accent ? "bg-primary/10 border-primary/30" : "bg-secondary/40 border-border"}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  )
}

export const chartStyle = {
  contentStyle: { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 },
  tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
  grid: "hsl(var(--border))",
}
