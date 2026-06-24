import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, BarChart2, Activity, CheckCircle2, Play } from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts"
import { SecHead, StatCard, chartStyle } from "@/components/vnb-shared"

const aggData = [
  { unit: "암보험",  forecast: 184, settlement: 178 }, { unit: "종신보험", forecast: 92, settlement: 88 },
  { unit: "연금보험", forecast: 61, settlement: 64 },  { unit: "건강보험", forecast: 143, settlement: 139 },
  { unit: "정기보험", forecast: 47, settlement: 45 },
]

const HEATMAP_DIMS: Record<string, string[]> = {
  "채널":     ["GA", "방카", "TM", "대면"],
  "보종":     ["암보험", "종신보험", "연금보험", "건강보험"],
  "연령대":   ["~29세", "30~39세", "40~49세", "50~59세", "60세~"],
  "성별":     ["남", "여"],
  "납기":     ["10년", "15년", "20년", "30년"],
  "보험기간": ["10년", "15년", "20년", "30년"],
}

const DIM_WEIGHTS: Record<string, Record<string, number>> = {
  "채널":     { "GA": 1.00, "방카": 0.85, "TM": 0.72, "대면": 0.95 },
  "보종":     { "암보험": 1.00, "종신보험": 0.62, "연금보험": 0.38, "건강보험": 0.87 },
  "연령대":   { "~29세": 0.62, "30~39세": 0.92, "40~49세": 1.00, "50~59세": 0.85, "60세~": 0.57 },
  "성별":     { "남": 1.00, "여": 0.82 },
  "납기":     { "10년": 0.72, "15년": 0.87, "20년": 1.00, "30년": 1.14 },
  "보험기간": { "10년": 0.68, "15년": 0.84, "20년": 1.00, "30년": 1.18 },
}

function heatmapValue(rowDim: string, rowVal: string, colDim: string, colVal: string): number {
  return Math.round(95 * (DIM_WEIGHTS[rowDim]?.[rowVal] ?? 1.0) * (DIM_WEIGHTS[colDim]?.[colVal] ?? 1.0))
}

const quarterlyTrend: Record<string, { q: string; settlement: number; forecast: number }[]> = {
  "전체": [
    { q: "2025Q1", settlement: 458, forecast: 471 }, { q: "2025Q2", settlement: 481, forecast: 493 },
    { q: "2025Q3", settlement: 502, forecast: 514 }, { q: "2025Q4", settlement: 516, forecast: 528 },
    { q: "2026Q1", settlement: 527, forecast: 539 }, { q: "2026Q2", settlement: null as unknown as number, forecast: 547 },
  ],
  "암보험": [
    { q: "2025Q1", settlement: 190, forecast: 196 }, { q: "2025Q2", settlement: 197, forecast: 203 },
    { q: "2025Q3", settlement: 203, forecast: 208 }, { q: "2025Q4", settlement: 207, forecast: 212 },
    { q: "2026Q1", settlement: 205, forecast: 211 }, { q: "2026Q2", settlement: null as unknown as number, forecast: 214 },
  ],
  "종신보험": [
    { q: "2025Q1", settlement: 82, forecast: 84 }, { q: "2025Q2", settlement: 87, forecast: 89 },
    { q: "2025Q3", settlement: 90, forecast: 92 }, { q: "2025Q4", settlement: 93, forecast: 95 },
    { q: "2026Q1", settlement: 95, forecast: 98 }, { q: "2026Q2", settlement: null as unknown as number, forecast: 100 },
  ],
  "연금보험": [
    { q: "2025Q1", settlement: 60, forecast: 58 }, { q: "2025Q2", settlement: 64, forecast: 62 },
    { q: "2025Q3", settlement: 65, forecast: 64 }, { q: "2025Q4", settlement: 67, forecast: 66 },
    { q: "2026Q1", settlement: 67, forecast: 65 }, { q: "2026Q2", settlement: null as unknown as number, forecast: 67 },
  ],
  "건강보험": [
    { q: "2025Q1", settlement: 126, forecast: 133 }, { q: "2025Q2", settlement: 133, forecast: 139 },
    { q: "2025Q3", settlement: 144, forecast: 150 }, { q: "2025Q4", settlement: 153, forecast: 155 },
    { q: "2026Q1", settlement: 149, forecast: 153 }, { q: "2026Q2", settlement: null as unknown as number, forecast: 155 },
  ],
}

const conditionCompare: Record<string, { label: string; settlement: number; forecast: number; mape: string }[]> = {
  "암보험": [
    { label: "GA / 남 / 35세 / 20년 / 5천만", settlement: 18.4, forecast: 19.1, mape: "3.8%" },
    { label: "GA / 여 / 40세 / 20년 / 5천만", settlement: 14.2, forecast: 14.7, mape: "3.5%" },
    { label: "방카 / 남 / 45세 / 15년 / 3천만", settlement: 9.1, forecast: 9.4, mape: "3.3%" },
    { label: "TM / 여 / 38세 / 25년 / 7천만",  settlement: 16.8, forecast: 17.3, mape: "3.0%" },
    { label: "대면 / 남 / 50세 / 10년 / 1억",  settlement: 22.1, forecast: 22.6, mape: "2.3%" },
  ],
  "종신보험": [
    { label: "GA / 남 / 35세 / 전기납 / 1억", settlement: 24.3, forecast: 25.0, mape: "2.9%" },
    { label: "방카 / 여 / 40세 / 전기납 / 5천만", settlement: 11.6, forecast: 11.9, mape: "2.6%" },
    { label: "대면 / 남 / 45세 / 전기납 / 2억", settlement: 38.2, forecast: 39.1, mape: "2.4%" },
  ],
  "연금보험": [
    { label: "GA / 여 / 45세 / 10년 / 5천만", settlement: 8.2, forecast: 7.9, mape: "3.7%" },
    { label: "방카 / 남 / 50세 / 5년 / 3천만", settlement: 4.8, forecast: 5.0, mape: "4.2%" },
    { label: "대면 / 여 / 40세 / 20년 / 1억",  settlement: 18.6, forecast: 18.1, mape: "2.7%" },
  ],
  "건강보험": [
    { label: "GA / 남 / 40세 / 20년 / 3천만", settlement: 12.4, forecast: 12.9, mape: "4.0%" },
    { label: "TM / 여 / 45세 / 15년 / 2천만",  settlement: 7.6, forecast: 7.9, mape: "3.9%" },
    { label: "대면 / 남 / 35세 / 30년 / 5천만", settlement: 20.3, forecast: 21.0, mape: "3.4%" },
  ],
}

export function AggregationTab() {
  const [trendCat,   setTrendCat]   = useState("전체")
  const [cmpCat,     setCmpCat]     = useState("암보험")
  const [simProduct, setSimProduct] = useState("암보험")
  const [simAge,     setSimAge]     = useState("40")
  const [simGender,  setSimGender]  = useState("M")
  const [simChannel, setSimChannel] = useState("GA")
  const [simPeriod,  setSimPeriod]  = useState("20")
  const [simPayPd,   setSimPayPd]   = useState("20")
  const [simAmount,  setSimAmount]  = useState("5000")
  const [rowDim,     setRowDim]     = useState("채널")
  const [colDim,     setColDim]     = useState("보종")
  const [simResult,  setSimResult]  = useState<{
    aiVnb: number; settlVnb: number; diff: number; mape: string; margin: number; ape: number
  } | null>(null)

  const onSimulate = () => {
    const base   = simProduct === "암보험" ? 18.4 : simProduct === "종신보험" ? 24.3 : simProduct === "연금보험" ? 8.2 : 12.4
    const af     = 1 + (40 - Number(simAge)) * 0.004
    const cf     = simChannel === "GA" ? 1.08 : simChannel === "방카" ? 0.95 : simChannel === "대면" ? 1.02 : 0.96
    const pf     = 1 + (Number(simPeriod) - 20) * 0.005
    const amf    = Number(simAmount) / 5000
    const aiVnb  = Math.round(base * af * cf * pf * amf * 10) / 10
    const settlVnb = Math.round(aiVnb * (0.94 + Math.random() * 0.06) * 10) / 10
    const diff   = Math.round((aiVnb - settlVnb) * 10) / 10
    const mape   = (Math.abs(diff) / settlVnb * 100).toFixed(1) + "%"
    const margin = Math.round(aiVnb / (Number(simAmount) * 0.0015) * 10) / 10
    const ape    = Math.round(Number(simAmount) * 0.12)
    setSimResult({ aiVnb, settlVnb, diff, mape, margin, ape })
  }

  const trendData  = quarterlyTrend[trendCat]  ?? quarterlyTrend["전체"]
  const cmpData    = conditionCompare[cmpCat]   ?? conditionCompare["암보험"]
  const totalFcst  = aggData.reduce((s, r) => s + r.forecast, 0)
  const totalSettl = aggData.reduce((s, r) => s + r.settlement, 0)
  const avgMape    = (aggData.reduce((s, r) => s + Math.abs(r.forecast - r.settlement) / r.settlement, 0) / aggData.length * 100).toFixed(1)

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-5 p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp}   label="VNB Assistant 집계" value={`${totalFcst}억`}  sub="4개 보종 합산" />
          <StatCard icon={BarChart2}    label="결산 DB 집계"        value={`${totalSettl}억`} sub="동일 기간 기준" />
          <StatCard icon={Activity}     label="평균 MAPE"           value={`${avgMape}%`}     sub="보종 평균" />
          <StatCard icon={CheckCircle2} label="집계 완료 보종"      value="4종"               sub="정기보험 제외" />
        </div>

        <Card className="p-5 bg-card border-border">
          <div className="flex items-start justify-between mb-1">
            <SecHead num={1} title="VNB 결산 DB vs 예측 모델 트렌드" desc="분기별 결산 VNB(결산 DB)와 예측 모델 결과값을 보종 단위로 비교합니다. 미래 분기는 예측 모델 결과만 표시됩니다." />
            <Select value={trendCat} onValueChange={setTrendCat}>
              <SelectTrigger className="w-28 h-7 bg-secondary border-border text-xs flex-shrink-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["전체","암보험","종신보험","연금보험","건강보험"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ left: -10, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
              <XAxis dataKey="q" tick={chartStyle.tick} />
              <YAxis tick={chartStyle.tick} tickFormatter={v => `${v}억`} />
              <RechartsTooltip formatter={(v: number) => v != null ? [`${v}억`, ""] : ["예정", ""]} contentStyle={chartStyle.contentStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="settlement" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} name="결산 DB" />
              <Line type="monotone" dataKey="forecast"   stroke="hsl(var(--primary))"          strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3"          name="예측 모델" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 bg-card border-border">
          <div className="flex items-start justify-between mb-1">
            <SecHead num={2} title="동일가입조건 결산 DB vs 예측 모델 집계" desc="동일한 가입조건(MP) 기준으로 결산 DB에서 집계한 VNB와 예측 모델이 산출한 VNB를 나란히 비교합니다." />
            <Select value={cmpCat} onValueChange={setCmpCat}>
              <SelectTrigger className="w-28 h-7 bg-secondary border-border text-xs flex-shrink-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["암보험","종신보험","연금보험","건강보험"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-3">가입조건 (MP)</th>
                  <th className="text-right py-2 px-3">결산 DB (억)</th>
                  <th className="text-right py-2 px-3">예측 모델 (억)</th>
                  <th className="text-right py-2 px-3">차이 (억)</th>
                  <th className="text-right py-2 px-3">MAPE</th>
                </tr>
              </thead>
              <tbody>
                {cmpData.map(r => {
                  const diff = Math.round((r.forecast - r.settlement) * 10) / 10
                  return (
                    <tr key={r.label} className="border-b border-border/50 hover:bg-secondary/40">
                      <td className="py-2.5 px-3 text-foreground font-mono text-[11px]">{r.label}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{r.settlement}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-primary">{r.forecast}</td>
                      <td className={`py-2.5 px-3 text-right font-mono ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>{diff > 0 ? "+" : ""}{diff}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-foreground">{r.mape}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border">
          <SecHead num={3} title="원하는 조건으로 VNB 예측·집계" desc="가입조건을 입력하면 보종별 예측 모델이 VNB를 즉시 산출하고, 결산 DB의 동일조건 집계값과 나란히 비교합니다." />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1.5 block">보종</Label>
                  <Select value={simProduct} onValueChange={v => { setSimProduct(v); setSimResult(null) }}>
                    <SelectTrigger className="bg-secondary border-border text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{["암보험","종신보험","연금보험","건강보험"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">채널</Label>
                  <Select value={simChannel} onValueChange={setSimChannel}>
                    <SelectTrigger className="bg-secondary border-border text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{["GA","방카","TM","대면"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs mb-1.5 block">가입연령</Label>
                  <Input type="number" value={simAge} onChange={e => setSimAge(e.target.value)} className="bg-secondary border-border h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">성별</Label>
                  <Select value={simGender} onValueChange={setSimGender}>
                    <SelectTrigger className="bg-secondary border-border text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="M">남</SelectItem><SelectItem value="F">여</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">가입금액(만)</Label>
                  <Input type="number" value={simAmount} onChange={e => setSimAmount(e.target.value)} className="bg-secondary border-border h-8 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1.5 block">보험기간(년)</Label>
                  <Input type="number" value={simPeriod} onChange={e => setSimPeriod(e.target.value)} className="bg-secondary border-border h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">납기(년)</Label>
                  <Input type="number" value={simPayPd} onChange={e => setSimPayPd(e.target.value)} className="bg-secondary border-border h-8 text-xs" />
                </div>
              </div>
              <Button onClick={onSimulate} className="w-full h-8 text-xs">
                <Play className="h-3.5 w-3.5 mr-1.5" />VNB 예측·집계 실행
              </Button>
            </div>
            <div className="lg:col-span-3">
              {simResult ? (
                <div className="space-y-3 h-full">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg border border-border bg-secondary/40 text-center">
                      <p className="text-[10px] text-muted-foreground mb-1">결산 DB 집계</p>
                      <p className="text-2xl font-bold font-mono text-muted-foreground">{simResult.settlVnb}억</p>
                      <p className="text-[10px] text-muted-foreground mt-1">동일조건 결산 기준</p>
                    </div>
                    <div className="p-4 rounded-lg border border-primary/30 bg-primary/10 text-center">
                      <p className="text-[10px] text-muted-foreground mb-1">예측 모델 산출</p>
                      <p className="text-2xl font-bold font-mono text-primary">{simResult.aiVnb}억</p>
                      <p className="text-[10px] text-muted-foreground mt-1">보종별 예측 모델 기준</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-border bg-secondary/30 text-center">
                      <p className="text-[10px] text-muted-foreground">차이</p>
                      <p className={`text-base font-bold font-mono mt-0.5 ${simResult.diff >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {simResult.diff >= 0 ? "+" : ""}{simResult.diff}억
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-secondary/30 text-center">
                      <p className="text-[10px] text-muted-foreground">MAPE</p>
                      <p className="text-base font-bold font-mono text-foreground mt-0.5">{simResult.mape}</p>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-secondary/30 text-center">
                      <p className="text-[10px] text-muted-foreground">신계약마진율</p>
                      <p className="text-base font-bold font-mono text-foreground mt-0.5">{simResult.margin}%</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/30 border border-border">
                    <p className="text-[10px] text-muted-foreground">
                      적용 모델: {simProduct === "암보험" ? "M-CANCER-001" : simProduct === "종신보험" ? "M-WHOLE-002" : simProduct === "연금보험" ? "M-PENSION-003" : "M-HEALTH-004"} · {simProduct} 예측모델
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
                  <Activity className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">가입조건을 입력하고 시뮬레이션을 실행하세요</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border">
          <div className="flex items-start justify-between mb-1">
            <SecHead num={4} title="판매속성별 VNB 히트맵" desc="가로(열)와 세로(행) 축을 원하는 속성으로 설정하면 해당 조합별 VNB를 히트맵으로 즉시 생성합니다." />
            <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
              <span className="text-xs text-muted-foreground">행(↓)</span>
              <Select value={rowDim} onValueChange={v => { if (v !== colDim) setRowDim(v) }}>
                <SelectTrigger className="w-28 h-7 bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(HEATMAP_DIMS).map(d => (
                    <SelectItem key={d} value={d} disabled={d === colDim}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground text-xs">×</span>
              <span className="text-xs text-muted-foreground">열(→)</span>
              <Select value={colDim} onValueChange={v => { if (v !== rowDim) setColDim(v) }}>
                <SelectTrigger className="w-28 h-7 bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(HEATMAP_DIMS).map(d => (
                    <SelectItem key={d} value={d} disabled={d === rowDim}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(() => {
            const rowVals = HEATMAP_DIMS[rowDim]
            const colVals = HEATMAP_DIMS[colDim]
            const allVals = rowVals.flatMap(rv => colVals.map(cv => heatmapValue(rowDim, rv, colDim, cv)))
            const minV = Math.min(...allVals)
            const maxV = Math.max(...allVals)
            const colorSteps = ["bg-blue-50 text-blue-900","bg-blue-100 text-blue-900","bg-blue-200 text-blue-900","bg-blue-300 text-blue-900","bg-blue-400 text-white","bg-blue-500 text-white","bg-blue-600 text-white","bg-blue-700 text-white","bg-blue-800 text-white"]
            const cellColor = (v: number) => {
              const ratio = maxV === minV ? 0.5 : (v - minV) / (maxV - minV)
              return colorSteps[Math.round(ratio * (colorSteps.length - 1))]
            }
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border">
                      <th className="text-left py-2 px-3 font-medium">{rowDim} \ {colDim}</th>
                      {colVals.map(cv => <th key={cv} className="text-center py-2 px-2 font-medium">{cv}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rowVals.map(rv => (
                      <tr key={rv}>
                        <td className="py-1.5 px-3 font-medium text-foreground whitespace-nowrap">{rv}</td>
                        {colVals.map(cv => {
                          const v = heatmapValue(rowDim, rv, colDim, cv)
                          return (
                            <td key={cv} className="py-1 px-1">
                              <div className={`rounded py-2.5 text-center font-mono font-semibold text-xs ${cellColor(v)}`}>{v}</div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })()}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px] text-muted-foreground">낮음</span>
            {["bg-blue-50","bg-blue-200","bg-blue-400","bg-blue-500","bg-blue-600","bg-blue-700","bg-blue-800"].map(c => (
              <div key={c} className={`w-5 h-3 rounded ${c}`} />
            ))}
            <span className="text-[10px] text-muted-foreground">높음</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
