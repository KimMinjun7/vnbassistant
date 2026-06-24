import { useState } from "react"
import { ReactGridLayout, WidthProvider } from "react-grid-layout/legacy"
import type { Layout } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

const RGL = WidthProvider(ReactGridLayout)
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Plus, X, GripVertical, RotateCcw, SlidersHorizontal,
  BarChart2, TrendingUp, PieChart as PieIcon, Activity, Table2,
  CheckCircle2, ChevronRight,
} from "lucide-react"
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { StatCard, chartStyle } from "@/components/vnb-shared"

// ── 차원·지표 정의 ────────────────────────────────────────────────────────

type DimKey  = "채널" | "보종" | "연령대" | "성별" | "납기" | "분기"
type MetricKey = "forecast" | "settlement" | "mape"

const DIMS: DimKey[] = ["채널", "보종", "연령대", "성별", "납기", "분기"]
const METRICS: { key: MetricKey; label: string }[] = [
  { key: "forecast",   label: "예측 VNB (억)" },
  { key: "settlement", label: "결산 VNB (억)" },
  { key: "mape",       label: "MAPE (%)" },
]

// 차원 값 목록
const DIM_VALS: Record<DimKey, string[]> = {
  "채널":   ["GA", "방카", "TM", "대면"],
  "보종":   ["암보험", "종신보험", "연금보험", "건강보험"],
  "연령대": ["~29세", "30~39세", "40~49세", "50~59세", "60세~"],
  "성별":   ["남", "여"],
  "납기":   ["10년", "15년", "20년", "30년"],
  "분기":   ["2025Q1", "2025Q2", "2025Q3", "2025Q4", "2026Q1", "2026Q2"],
}

// 차원별 가중치 (VNB 계산용)
const DIM_W: Record<DimKey, Record<string, number>> = {
  "채널":   { GA:1.00, 방카:0.85, TM:0.72, 대면:0.95 },
  "보종":   { 암보험:1.00, 종신보험:0.62, 연금보험:0.38, 건강보험:0.87 },
  "연령대": { "~29세":0.62, "30~39세":0.92, "40~49세":1.00, "50~59세":0.85, "60세~":0.57 },
  "성별":   { 남:1.00, 여:0.82 },
  "납기":   { "10년":0.72, "15년":0.87, "20년":1.00, "30년":1.14 },
  "분기":   { "2025Q1":0.87, "2025Q2":0.91, "2025Q3":0.95, "2025Q4":0.98, "2026Q1":1.00, "2026Q2":null as unknown as number },
}

const BASE_VNB = 150

function calcVnb(dims: Partial<Record<DimKey, string>>): number {
  let v = BASE_VNB
  for (const [dim, val] of Object.entries(dims)) {
    const w = DIM_W[dim as DimKey]?.[val ?? ""] ?? 1
    if (w != null) v *= w
  }
  return Math.round(v * 10) / 10
}

// 1-D 집계: X축 차원별 forecast/settlement/mape
function aggregate1D(xDim: DimKey): { name: string; forecast: number; settlement: number; mape: number }[] {
  return DIM_VALS[xDim].map(val => {
    const forecast   = calcVnb({ [xDim]: val })
    const settlement = Math.round(forecast * (0.92 + Math.random() * 0.06) * 10) / 10
    const mape       = Math.round(Math.abs(forecast - settlement) / settlement * 100 * 10) / 10
    return { name: val, forecast, settlement, mape }
  })
}

// 2-D 집계: X축 × 그룹별
function aggregate2D(xDim: DimKey, groupDim: DimKey) {
  return DIM_VALS[xDim].map(xVal => {
    const row: Record<string, string | number> = { name: xVal }
    DIM_VALS[groupDim].forEach(gVal => {
      row[gVal] = calcVnb({ [xDim]: xVal, [groupDim]: gVal })
    })
    return row
  })
}

// 히트맵 값
function heatmapData(rowDim: DimKey, colDim: DimKey) {
  return DIM_VALS[rowDim].map(rv => ({
    row: rv,
    cols: DIM_VALS[colDim].map(cv => ({
      col: cv, value: calcVnb({ [rowDim]: rv, [colDim]: cv }),
    })),
  }))
}

const PIE_COLORS = [
  "hsl(var(--chart-1))","hsl(var(--chart-2))","hsl(var(--chart-3))",
  "hsl(var(--chart-4))","hsl(var(--chart-5))",
]
const GROUP_COLORS = ["#60a5fa","#34d399","#f472b6","#fb923c","#a78bfa"]

// ── 차트 타입 ─────────────────────────────────────────────────────────────

type ChartType = "bar" | "line" | "area" | "pie" | "heatmap"

interface ChartConfig {
  type: ChartType
  title: string
  xDim?: DimKey
  metric: MetricKey
  groupDim?: DimKey      // bar/line/area 선택 그룹
  // heatmap
  rowDim?: DimKey
  colDim?: DimKey
}

// ── 위젯 타입 ─────────────────────────────────────────────────────────────

type PresetId = "kpi" | "trend-line" | "product-bar"
type WidgetId  = PresetId | string   // 사용자 차트는 uuid

interface Widget {
  id: WidgetId
  kind: "preset" | "chart"
  presetId?: PresetId
  chartConfig?: ChartConfig
  layout: Omit<Layout, "i">
}

const PRESET_DEFAULTS: Record<PresetId, Omit<Layout, "i">> = {
  "kpi":         { x:0, y:0,  w:12, h:2, minH:2 },
  "trend-line":  { x:0, y:2,  w:8,  h:5, minH:3 },
  "product-bar": { x:8, y:2,  w:4,  h:5, minH:3 },
}

const PRESET_LABELS: Record<PresetId, string> = {
  "kpi":         "KPI 요약",
  "trend-line":  "분기별 트렌드",
  "product-bar": "보종별 막대",
}

const DEFAULT_WIDGETS: Widget[] = [
  { id:"kpi",         kind:"preset", presetId:"kpi",         layout:PRESET_DEFAULTS["kpi"]         },
  { id:"trend-line",  kind:"preset", presetId:"trend-line",  layout:PRESET_DEFAULTS["trend-line"]  },
  { id:"product-bar", kind:"preset", presetId:"product-bar", layout:PRESET_DEFAULTS["product-bar"] },
]

// ── 분기 트렌드 데이터 (preset trend-line용) ─────────────────────────────

const TREND_DATA = {
  "전체":   [{q:"2025Q1",s:458,f:471},{q:"2025Q2",s:481,f:493},{q:"2025Q3",s:502,f:514},{q:"2025Q4",s:516,f:528},{q:"2026Q1",s:527,f:539}],
  "암보험": [{q:"2025Q1",s:190,f:196},{q:"2025Q2",s:197,f:203},{q:"2025Q3",s:203,f:208},{q:"2025Q4",s:207,f:212},{q:"2026Q1",s:205,f:211}],
  "종신보험":[{q:"2025Q1",s:82,f:84},{q:"2025Q2",s:87,f:89},{q:"2025Q3",s:90,f:92},{q:"2025Q4",s:93,f:95},{q:"2026Q1",s:95,f:98}],
  "연금보험":[{q:"2025Q1",s:60,f:58},{q:"2025Q2",s:64,f:62},{q:"2025Q3",s:65,f:64},{q:"2025Q4",s:67,f:66},{q:"2026Q1",s:67,f:65}],
  "건강보험":[{q:"2025Q1",s:126,f:133},{q:"2025Q2",s:133,f:139},{q:"2025Q3",s:144,f:150},{q:"2025Q4",s:153,f:155},{q:"2026Q1",s:149,f:153}],
}

// ── 사용자 차트 렌더러 ────────────────────────────────────────────────────

function UserChart({ cfg }: { cfg: ChartConfig }) {
  const metaLabel = METRICS.find(m => m.key === cfg.metric)?.label ?? cfg.metric

  if (cfg.type === "heatmap") {
    const row = cfg.rowDim ?? "채널"
    const col = cfg.colDim ?? "보종"
    const data = heatmapData(row, col)
    const all  = data.flatMap(r => r.cols.map(c => c.value))
    const minV = Math.min(...all), maxV = Math.max(...all)
    const steps = ["bg-blue-50 text-blue-900","bg-blue-100 text-blue-900","bg-blue-300 text-blue-900","bg-blue-400 text-white","bg-blue-500 text-white","bg-blue-600 text-white","bg-blue-800 text-white"]
    const cc = (v: number) => steps[Math.min(steps.length-1, Math.round((maxV===minV?0.5:(v-minV)/(maxV-minV))*(steps.length-1)))]
    return (
      <div className="overflow-auto h-full">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-1 px-2">{row}\{col}</th>
            {DIM_VALS[col].map(c=><th key={c} className="text-center py-1 px-1 whitespace-nowrap">{c}</th>)}
          </tr></thead>
          <tbody>{data.map(r=>(
            <tr key={r.row}>
              <td className="py-0.5 px-2 font-medium text-[11px] whitespace-nowrap">{r.row}</td>
              {r.cols.map(c=><td key={c.col} className="py-0.5 px-0.5">
                <div className={`rounded py-1.5 text-center font-mono font-semibold text-[11px] ${cc(c.value)}`}>{c.value}</div>
              </td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
    )
  }

  if (cfg.type === "pie") {
    const xDim = cfg.xDim ?? "보종"
    const data = aggregate1D(xDim).map(d => ({ name: d.name, value: d[cfg.metric] }))
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%"
            label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
            {data.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
          </Pie>
          <Tooltip formatter={(v:number)=>[`${v}`, metaLabel]} contentStyle={chartStyle.contentStyle}/>
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // bar / line / area
  const xDim    = cfg.xDim ?? "채널"
  const grouped = !!cfg.groupDim
  const data    = grouped ? aggregate2D(xDim, cfg.groupDim!) : aggregate1D(xDim)
  const groups  = grouped ? DIM_VALS[cfg.groupDim!] : []

  const commonProps = { data, margin: { left:-10, right:8, top:4, bottom:4 } }
  const axisProps   = <>
    <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid}/>
    <XAxis dataKey="name" tick={chartStyle.tick}/>
    <YAxis tick={chartStyle.tick}/>
    <Tooltip contentStyle={chartStyle.contentStyle}/>
    {grouped && <Legend wrapperStyle={{fontSize:11}}/>}
  </>

  const bars = grouped
    ? groups.map((g,i) => <Bar  key={g} dataKey={g} fill={GROUP_COLORS[i%GROUP_COLORS.length]} radius={[3,3,0,0]}/>)
    : [<Bar key="v" dataKey={cfg.metric} fill="hsl(var(--primary))" radius={[3,3,0,0]}/>]
  const lines = grouped
    ? groups.map((g,i) => <Line key={g} type="monotone" dataKey={g} stroke={GROUP_COLORS[i%GROUP_COLORS.length]} strokeWidth={2} dot={{r:2}}/>)
    : [<Line key="v" type="monotone" dataKey={cfg.metric} stroke="hsl(var(--primary))" strokeWidth={2} dot={{r:2}}/>]
  const areas = grouped
    ? groups.map((g,i) => <Area key={g} type="monotone" dataKey={g} stroke={GROUP_COLORS[i%GROUP_COLORS.length]} fill={GROUP_COLORS[i%GROUP_COLORS.length]} fillOpacity={0.15} strokeWidth={2}/>)
    : [<Area key="v" type="monotone" dataKey={cfg.metric} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2}/>]

  return (
    <ResponsiveContainer width="100%" height="100%">
      {cfg.type === "bar"  ? <BarChart  {...commonProps}>{axisProps}{bars}</BarChart>  :
       cfg.type === "line" ? <LineChart {...commonProps}>{axisProps}{lines}</LineChart> :
                             <AreaChart {...commonProps}>{axisProps}{areas}</AreaChart>}
    </ResponsiveContainer>
  )
}

// ── 차트 빌더 모달 ────────────────────────────────────────────────────────

const CHART_TYPES: { id: ChartType; label: string; icon: typeof BarChart2 }[] = [
  { id:"bar",     label:"막대 차트",  icon:BarChart2  },
  { id:"line",    label:"선형 차트",  icon:TrendingUp },
  { id:"area",    label:"면적 차트",  icon:Activity   },
  { id:"pie",     label:"원형 차트",  icon:PieIcon    },
  { id:"heatmap", label:"히트맵",     icon:Table2     },
]

function ChartBuilder({ onAdd, onClose }: { onAdd: (cfg: ChartConfig) => void; onClose: () => void }) {
  const [step, setStep] = useState<1|2>(1)
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [title,    setTitle]    = useState("")
  const [xDim,     setXDim]     = useState<DimKey>("채널")
  const [metric,   setMetric]   = useState<MetricKey>("forecast")
  const [groupDim, setGroupDim] = useState<DimKey | "">("")
  const [rowDim,   setRowDim]   = useState<DimKey>("채널")
  const [colDim,   setColDim]   = useState<DimKey>("보종")

  const auto = chartType === "bar" ? `${xDim}별 ${METRICS.find(m=>m.key===metric)?.label}` :
               chartType === "line" ? `${xDim}별 추세` :
               chartType === "area" ? `${xDim}별 면적` :
               chartType === "pie"  ? `${xDim}별 비중` :
               `${rowDim} × ${colDim} 히트맵`

  const handleAdd = () => {
    const cfg: ChartConfig = {
      type: chartType,
      title: title.trim() || auto,
      ...(chartType !== "heatmap" ? {
        xDim, metric,
        ...(groupDim ? { groupDim: groupDim as DimKey } : {}),
      } : { rowDim, colDim, metric }),
    }
    onAdd(cfg)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <Card className="w-[520px] bg-card border-border shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">차트 추가</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4"/></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Step 1: 차트 타입 */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2.5">① 차트 종류</p>
            <div className="grid grid-cols-5 gap-2">
              {CHART_TYPES.map(ct => {
                const Icon = ct.icon
                return (
                  <button key={ct.id} onClick={()=>{setChartType(ct.id); setStep(2)}}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs transition-colors ${
                      chartType===ct.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}>
                    <Icon className="h-5 w-5"/>
                    <span className="leading-tight text-center">{ct.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: 축 설정 */}
          {(step === 2 || chartType) && (
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground">② 변수 설정</p>

              {chartType === "heatmap" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">행 (Row) 차원</p>
                    <Select value={rowDim} onValueChange={v=>{if(v!==colDim)setRowDim(v as DimKey)}}>
                      <SelectTrigger className="h-8 bg-secondary border-border text-xs"><SelectValue/></SelectTrigger>
                      <SelectContent>{DIMS.map(d=><SelectItem key={d} value={d} disabled={d===colDim}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">열 (Col) 차원</p>
                    <Select value={colDim} onValueChange={v=>{if(v!==rowDim)setColDim(v as DimKey)}}>
                      <SelectTrigger className="h-8 bg-secondary border-border text-xs"><SelectValue/></SelectTrigger>
                      <SelectContent>{DIMS.map(d=><SelectItem key={d} value={d} disabled={d===rowDim}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        {chartType==="pie" ? "구분 차원" : "X축 차원"}
                      </p>
                      <Select value={xDim} onValueChange={v=>setXDim(v as DimKey)}>
                        <SelectTrigger className="h-8 bg-secondary border-border text-xs"><SelectValue/></SelectTrigger>
                        <SelectContent>{DIMS.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Y축 지표</p>
                      <Select value={metric} onValueChange={v=>setMetric(v as MetricKey)}>
                        <SelectTrigger className="h-8 bg-secondary border-border text-xs"><SelectValue/></SelectTrigger>
                        <SelectContent>{METRICS.map(m=><SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  {chartType !== "pie" && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">그룹(색상) 차원 <span className="opacity-60">— 선택</span></p>
                      <Select value={groupDim} onValueChange={v=>setGroupDim(v as DimKey | "")}>
                        <SelectTrigger className="h-8 bg-secondary border-border text-xs"><SelectValue placeholder="없음"/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">없음</SelectItem>
                          {DIMS.filter(d=>d!==xDim).map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* 제목 */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">차트 제목 <span className="opacity-60">— 비워두면 자동 생성</span></p>
                <input
                  value={title}
                  onChange={e=>setTitle(e.target.value)}
                  placeholder={auto}
                  className="w-full h-8 px-3 rounded-md border border-border bg-secondary text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* 미리보기 배지 */}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-secondary/40 px-3 py-2 rounded-lg">
                <ChevronRight className="h-3 w-3 opacity-50"/>
                <span>{title.trim() || auto}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">취소</Button>
          <Button size="sm" onClick={handleAdd} className="text-xs gap-1">
            <Plus className="h-3.5 w-3.5"/>대시보드에 추가
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ── 프리셋 위젯 렌더러 ────────────────────────────────────────────────────

const AGG_DATA = [
  {unit:"암보험",forecast:184,settlement:178},{unit:"종신보험",forecast:92,settlement:88},
  {unit:"연금보험",forecast:61,settlement:64},{unit:"건강보험",forecast:143,settlement:139},
]

function PresetWidget({ id, gCat }: { id: PresetId; gCat: string }) {
  if (id === "kpi") {
    const tf=AGG_DATA.reduce((s,r)=>s+r.forecast,0)
    const ts=AGG_DATA.reduce((s,r)=>s+r.settlement,0)
    const mape=(AGG_DATA.reduce((s,r)=>s+Math.abs(r.forecast-r.settlement)/r.settlement,0)/AGG_DATA.length*100).toFixed(1)
    return (
      <div className="grid grid-cols-4 gap-3 h-full content-center">
        <StatCard icon={TrendingUp}   label="예측 VNB 합산" value={`${tf}억`}  sub="4개 보종"/>
        <StatCard icon={BarChart2}    label="결산 VNB 합산" value={`${ts}억`}  sub="동일 기간"/>
        <StatCard icon={Activity}     label="평균 MAPE"     value={`${mape}%`} sub="보종 평균"/>
        <StatCard icon={CheckCircle2} label="집계 완료"     value="4종"        sub="정기보험 제외"/>
      </div>
    )
  }

  if (id === "trend-line") {
    const data = (TREND_DATA[gCat as keyof typeof TREND_DATA] ?? TREND_DATA["전체"])
      .map(d => ({ q:d.q, 결산:d.s, 예측:d.f }))
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{left:-10,right:8,top:4,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid}/>
          <XAxis dataKey="q" tick={chartStyle.tick}/>
          <YAxis tick={chartStyle.tick} tickFormatter={v=>`${v}억`}/>
          <Tooltip formatter={(v:number)=>[`${v}억`,""]} contentStyle={chartStyle.contentStyle}/>
          <Legend wrapperStyle={{fontSize:11}}/>
          <Line type="monotone" dataKey="결산" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={{r:2}}/>
          <Line type="monotone" dataKey="예측" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r:2}} strokeDasharray="5 3"/>
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (id === "product-bar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={AGG_DATA} margin={{left:-10,right:4,top:4,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid}/>
          <XAxis dataKey="unit" tick={chartStyle.tick}/>
          <YAxis tick={chartStyle.tick} tickFormatter={v=>`${v}억`}/>
          <Tooltip formatter={(v:number)=>[`${v}억`,""]} contentStyle={chartStyle.contentStyle}/>
          <Legend wrapperStyle={{fontSize:11}}/>
          <Bar dataKey="settlement" fill="hsl(var(--muted-foreground))" radius={[3,3,0,0]} name="결산"/>
          <Bar dataKey="forecast"   fill="hsl(var(--primary))"          radius={[3,3,0,0]} name="예측"/>
        </BarChart>
      </ResponsiveContainer>
    )
  }
  return null
}

// ── 필터 옵션 ─────────────────────────────────────────────────────────────

const YEARS    = ["2024","2025","2026"]
const QUARTERS = ["Q1","Q2","Q3","Q4","전체"]
const CATS     = ["전체","암보험","종신보험","연금보험","건강보험"]
const CHANNELS = ["전체","GA","방카","TM","대면"]

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────

let _uid = 0
const uid = () => `chart-${++_uid}`

export function AggregationTab() {
  const [gYear,    setGYear]    = useState("2026")
  const [gQuarter, setGQuarter] = useState("Q2")
  const [gCat,     setGCat]     = useState("전체")
  const [gChannel, setGChannel] = useState("전체")

  const [widgets,  setWidgets]  = useState<Widget[]>(DEFAULT_WIDGETS)
  const [layouts,  setLayouts]  = useState<Layout[]>(() =>
    DEFAULT_WIDGETS.map(w => ({ i: w.id, ...w.layout }))
  )
  const [showBuilder, setShowBuilder] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  // WidthProvider가 자동 측정하므로 별도 ref 불필요

  const addChart = (cfg: ChartConfig) => {
    const id = uid()
    const newWidget: Widget = {
      id, kind: "chart", chartConfig: cfg,
      layout: { x:0, y:Infinity, w:6, h:5, minH:3 },
    }
    setWidgets(prev => [...prev, newWidget])
    setLayouts(prev => [...prev, { i:id, ...newWidget.layout }])
    setShowBuilder(false)
  }

  const addPreset = (pid: PresetId) => {
    if (widgets.find(w => w.id === pid)) return
    const newWidget: Widget = { id:pid, kind:"preset", presetId:pid, layout:PRESET_DEFAULTS[pid] }
    setWidgets(prev => [...prev, newWidget])
    setLayouts(prev => [...prev, { i:pid, ...newWidget.layout }])
    setShowPresets(false)
  }

  const remove = (id: WidgetId) => {
    setWidgets(prev => prev.filter(w => w.id !== id))
    setLayouts(prev => prev.filter(l => l.i !== id))
  }

  const reset = () => {
    setWidgets(DEFAULT_WIDGETS)
    setLayouts(DEFAULT_WIDGETS.map(w => ({ i:w.id, ...w.layout })))
  }

  const widgetTitle = (w: Widget) =>
    w.kind === "preset" ? PRESET_LABELS[w.presetId!] : (w.chartConfig?.title ?? "차트")

  return (
    <div className="h-full overflow-y-auto">
      {/* ── 글로벌 필터 바 ── */}
      <div className="sticky top-0 z-20 bg-card border-b border-border px-5 py-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5"/>
            <span className="font-medium">필터</span>
          </div>
          <Separator orientation="vertical" className="h-5"/>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">기준 분기</span>
            <Select value={gYear} onValueChange={setGYear}>
              <SelectTrigger className="h-7 w-20 bg-secondary border-border text-xs"><SelectValue/></SelectTrigger>
              <SelectContent>{YEARS.map(y=><SelectItem key={y} value={y}>{y}년</SelectItem>)}</SelectContent>
            </Select>
            <Select value={gQuarter} onValueChange={setGQuarter}>
              <SelectTrigger className="h-7 w-16 bg-secondary border-border text-xs"><SelectValue/></SelectTrigger>
              <SelectContent>{QUARTERS.map(q=><SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Separator orientation="vertical" className="h-5"/>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">보종</span>
            <Select value={gCat} onValueChange={setGCat}>
              <SelectTrigger className="h-7 w-28 bg-secondary border-border text-xs"><SelectValue/></SelectTrigger>
              <SelectContent>{CATS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Separator orientation="vertical" className="h-5"/>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">채널</span>
            <Select value={gChannel} onValueChange={setGChannel}>
              <SelectTrigger className="h-7 w-24 bg-secondary border-border text-xs"><SelectValue/></SelectTrigger>
              <SelectContent>{CHANNELS.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex items-center gap-2 relative">
            <Button variant="outline" size="sm" onClick={reset} className="h-7 text-xs gap-1">
              <RotateCcw className="h-3 w-3"/>초기화
            </Button>
            {/* 프리셋 추가 */}
            <div className="relative">
              <Button variant="outline" size="sm" onClick={()=>{setShowPresets(v=>!v); setShowBuilder(false)}} className="h-7 text-xs gap-1">
                <Plus className="h-3.5 w-3.5"/>위젯
              </Button>
              {showPresets && (
                <>
                  <div className="fixed inset-0 z-10" onClick={()=>setShowPresets(false)}/>
                  <Card className="absolute right-0 top-9 z-30 p-3 w-44 shadow-lg border-border bg-card">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-2">기본 위젯</p>
                    {(Object.keys(PRESET_LABELS) as PresetId[]).map(pid=>(
                      <button key={pid} onClick={()=>addPreset(pid)} disabled={!!widgets.find(w=>w.id===pid)}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${widgets.find(w=>w.id===pid)?"opacity-40 cursor-not-allowed":"hover:bg-secondary text-foreground"}`}>
                        {widgets.find(w=>w.id===pid) ? "✓ " : "+ "}{PRESET_LABELS[pid]}
                      </button>
                    ))}
                  </Card>
                </>
              )}
            </div>
            {/* 차트 빌더 */}
            <Button size="sm" onClick={()=>{setShowBuilder(true); setShowPresets(false)}} className="h-7 text-xs gap-1">
              <BarChart2 className="h-3.5 w-3.5"/>차트 추가
            </Button>
          </div>
        </div>
      </div>

      {/* ── 드래그앤드롭 그리드 ── */}
      <div className="px-4 pt-3 pb-10">
        {widgets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed border-border rounded-xl mt-4">
            <BarChart2 className="h-10 w-10 mb-3 opacity-20"/>
            <p className="text-sm">위젯이 없습니다</p>
            <p className="text-xs mt-1">상단의 <strong>차트 추가</strong> / <strong>위젯</strong> 버튼으로 추가하세요</p>
          </div>
        )}

        <RGL
          layout={layouts}
          cols={12}
          rowHeight={60}
          onLayoutChange={(l) => setLayouts(l as Layout[])}
          margin={[12, 12]}
          containerPadding={[0, 0]}
          draggableHandle=".drag-handle"
          isDraggable
          isResizable
          compactType="vertical"
        >
          {widgets.map(w => (
            // overflow:visible 필수 — react-resizable이 resize handle을 이 div 안에 주입하므로
            // overflow:hidden 이면 handle이 잘려서 drag/resize 이벤트 차단됨
            <div key={w.id} style={{
              borderRadius:"0.75rem", border:"1px solid hsl(var(--border))",
              background:"hsl(var(--card))", display:"flex", flexDirection:"column",
            }}>
              {/* 헤더 — drag-handle 클래스로 드래그 영역 지정 */}
              <div
                className="drag-handle"
                style={{
                  display:"flex", alignItems:"center", gap:8,
                  padding:"6px 12px",
                  borderBottom:"1px solid hsl(var(--border))",
                  background:"hsl(var(--secondary)/0.3)",
                  borderRadius:"0.75rem 0.75rem 0 0",
                  flexShrink:0, cursor:"grab", userSelect:"none",
                }}
              >
                <GripVertical style={{width:13,height:13,opacity:0.35,flexShrink:0}}/>
                <span style={{fontSize:12,fontWeight:500,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {widgetTitle(w)}
                </span>
                <button
                  onMouseDown={e=>e.stopPropagation()}
                  onClick={()=>remove(w.id)}
                  style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex",color:"hsl(var(--muted-foreground))",flexShrink:0}}
                >
                  <X style={{width:13,height:13}}/>
                </button>
              </div>
              {/* 본문 */}
              <div
                style={{flex:1,padding:"10px 12px",overflow:"hidden",minHeight:0,borderRadius:"0 0 0.75rem 0.75rem"}}
              >
                {w.kind === "preset"
                  ? <PresetWidget id={w.presetId!} gCat={gCat}/>
                  : <UserChart cfg={w.chartConfig!}/>
                }
              </div>
            </div>
          ))}
        </RGL>
      </div>

      {/* ── 차트 빌더 모달 ── */}
      {showBuilder && <ChartBuilder onAdd={addChart} onClose={()=>setShowBuilder(false)}/>}
    </div>
  )
}
