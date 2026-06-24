import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, ArrowRight, Play } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts"
import { SecHead, ResultBox, chartStyle } from "@/components/vnb-shared"

const AGG_UNIT_DATA: Record<string, { unit: string; forecast: number; settlement: number }[]> = {
  "보종단위": [
    { unit: "암보험",   forecast: 212, settlement: 205 },
    { unit: "종신보험", forecast: 98,  settlement: 95  },
    { unit: "연금보험", forecast: 64,  settlement: 67  },
    { unit: "건강보험", forecast: 153, settlement: 149 },
  ],
  "채널단위": [
    { unit: "GA",   forecast: 198, settlement: 191 },
    { unit: "방카", forecast: 142, settlement: 138 },
    { unit: "TM",   forecast: 87,  settlement: 90  },
    { unit: "대면", forecast: 100, settlement: 97  },
  ],
  "상품단위": [
    { unit: "무배당암보험", forecast: 212, settlement: 205 },
    { unit: "통합종신보험", forecast: 98,  settlement: 95  },
    { unit: "변액연금보험", forecast: 64,  settlement: 67  },
    { unit: "건강든든보험", forecast: 153, settlement: 149 },
  ],
  "MIX단위": [
    { unit: "GA×암",    forecast: 92, settlement: 88 },
    { unit: "방카×종신", forecast: 88, settlement: 86 },
    { unit: "TM×연금",  forecast: 74, settlement: 72 },
    { unit: "대면×건강", forecast: 88, settlement: 85 },
  ],
  "증번단위": [
    { unit: "암보험",   forecast: 212, settlement: 205 },
    { unit: "종신보험", forecast: 98,  settlement: 95  },
    { unit: "연금보험", forecast: 64,  settlement: 67  },
    { unit: "건강보험", forecast: 153, settlement: 149 },
  ],
}

const CHGBASE = {
  gaRatio: 30, femaleRatio: 40, avgAge: 42, payPeriod: 20, maxLimit: 100,
  minPremium: 3, avgAmount: 5000, riderRatio: 15, convRate: 25,
}

const CHG_BY_CAT: Record<string, {
  baseVNB: number; modelId: string
  coeff: typeof CHGBASE & Record<keyof typeof CHGBASE, number>
}> = {
  "암보험":   { baseVNB: 205, modelId: "M-CANCER-001",
    coeff: { gaRatio: 1.8, femaleRatio: -0.3, avgAge: -3.2, payPeriod: 0.8, maxLimit: 1.2, minPremium: -8.0, avgAmount: 5.2, riderRatio: 2.1, convRate: -1.8 } },
  "종신보험": { baseVNB: 95,  modelId: "M-WHOLE-002",
    coeff: { gaRatio: 0.8, femaleRatio:  0.5, avgAge: -1.8, payPeriod: 0.5, maxLimit: 0.9, minPremium: -5.0, avgAmount: 3.8, riderRatio: 1.2, convRate: -1.2 } },
  "연금보험": { baseVNB: 67,  modelId: "M-PENSION-003",
    coeff: { gaRatio: 0.5, femaleRatio:  0.8, avgAge: -2.1, payPeriod: 1.2, maxLimit: 0.6, minPremium: -4.0, avgAmount: 2.9, riderRatio: 0.8, convRate: -2.4 } },
  "건강보험": { baseVNB: 149, modelId: "M-HEALTH-004",
    coeff: { gaRatio: 1.2, femaleRatio: -0.5, avgAge: -2.8, payPeriod: 0.6, maxLimit: 1.0, minPremium: -7.0, avgAmount: 4.1, riderRatio: 1.8, convRate: -1.5 } },
}

function SliderRow({
  label, baseText, value, onChange, min, max, step, unit, delta,
}: {
  label: string; baseText: string; value: number
  onChange: (v: number) => void
  min: number; max: number; step: number; unit: string; delta: number
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="grid items-center gap-x-3 gap-y-1" style={{ gridTemplateColumns: "130px 1fr 64px" }}>
      <div>
        <p className="text-xs text-foreground leading-tight">{label}</p>
        <p className="text-[10px] text-muted-foreground">기준: {baseText}</p>
      </div>
      <div className="space-y-0.5">
        <div className="relative">
          <input
            type="range" min={min} max={max} step={step} value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-1.5 accent-primary cursor-pointer appearance-none rounded-full bg-secondary"
            style={{ background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--secondary)) ${pct}%)` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>{min}{unit}</span>
          <span className="font-semibold text-foreground">{unit === "%" && step < 1 ? (value / 10).toFixed(1) : value}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
      <div className="text-right">
        {delta === 0
          ? <span className="text-[10px] text-muted-foreground">—</span>
          : <Badge variant="outline" className={`text-[10px] ${delta > 0 ? "border-green-500 text-green-600" : "border-red-500 text-red-500"}`}>
              {delta > 0 ? "+" : ""}{delta}억
            </Badge>
        }
      </div>
    </div>
  )
}

export function SimulationTab() {
  const [aggUnit,          setAggUnit]          = useState("보종단위")
  const [simProduct,       setSimProduct]       = useState("암보험")
  const [simAge,           setSimAge]           = useState("40")
  const [simGender,        setSimGender]        = useState("M")
  const [simChannel,       setSimChannel]       = useState("GA")
  const [simInsurePeriod,  setSimInsurePeriod]  = useState("20")
  const [simPayPeriod,     setSimPayPeriod]     = useState("20")
  const [simAmount,        setSimAmount]        = useState("5000")
  const [simResult,        setSimResult]        = useState<{ vnb: number; margin: number; ape: number; mp: string } | null>(null)

  const [chgCat,      setChgCat]      = useState("암보험")
  const [gaRatio,     setGaRatio]     = useState(CHGBASE.gaRatio)
  const [femaleRatio, setFemaleRatio] = useState(CHGBASE.femaleRatio)
  const [avgAge,      setAvgAge]      = useState(CHGBASE.avgAge)
  const [payPeriod,   setPayPeriod]   = useState(CHGBASE.payPeriod)
  const [maxLimit,    setMaxLimit]    = useState(CHGBASE.maxLimit)
  const [minPremium,  setMinPremium]  = useState(CHGBASE.minPremium)
  const [avgAmount,   setAvgAmount]   = useState(CHGBASE.avgAmount)
  const [riderRatio,  setRiderRatio]  = useState(CHGBASE.riderRatio)
  const [convRate,    setConvRate]    = useState(CHGBASE.convRate)

  const catCfg = CHG_BY_CAT[chgCat]
  const coeff  = catCfg.coeff
  const d = {
    gaRatio:     Math.round((gaRatio     - CHGBASE.gaRatio)        * coeff.gaRatio),
    femaleRatio: Math.round((femaleRatio - CHGBASE.femaleRatio)    * coeff.femaleRatio),
    avgAge:      Math.round((CHGBASE.avgAge     - avgAge)          * Math.abs(coeff.avgAge)),
    payPeriod:   Math.round((payPeriod   - CHGBASE.payPeriod)      * coeff.payPeriod),
    maxLimit:    Math.round((maxLimit    - CHGBASE.maxLimit) / 10  * coeff.maxLimit),
    minPremium:  Math.round((CHGBASE.minPremium - minPremium)      * Math.abs(coeff.minPremium)),
    avgAmount:   Math.round((avgAmount   - CHGBASE.avgAmount) / 500 * coeff.avgAmount),
    riderRatio:  Math.round((riderRatio  - CHGBASE.riderRatio)     * coeff.riderRatio),
    convRate:    Math.round((CHGBASE.convRate   - convRate)        * Math.abs(coeff.convRate)),
  }
  const totalDelta   = Object.values(d).reduce((s, v) => s + v, 0)
  const BASE_VNB     = catCfg.baseVNB
  const projectedVNB = BASE_VNB + totalDelta

  const onResetChg = () => {
    setGaRatio(CHGBASE.gaRatio); setFemaleRatio(CHGBASE.femaleRatio)
    setAvgAge(CHGBASE.avgAge);   setPayPeriod(CHGBASE.payPeriod)
    setMaxLimit(CHGBASE.maxLimit); setMinPremium(CHGBASE.minPremium)
    setAvgAmount(CHGBASE.avgAmount); setRiderRatio(CHGBASE.riderRatio)
    setConvRate(CHGBASE.convRate)
  }

  const onSimulate = () => {
    const base = simProduct === "암보험" ? 180 : simProduct === "종신보험" ? 95 : simProduct === "연금보험" ? 62 : 143
    const af   = 1 + (40 - Number(simAge)) * 0.004
    const cf   = simChannel === "GA" ? 1.08 : simChannel === "방카" ? 0.94 : simChannel === "대면" ? 1.02 : 0.97
    const pf   = 1 + (Number(simInsurePeriod) - 20) * 0.005
    const amf  = Number(simAmount) / 5000
    const vnb  = Math.round(base * af * cf * pf * amf)
    const mp   = `연령(${simAge})×성별(${simGender})×채널(${simChannel})×보기(${simInsurePeriod}년)`
    setSimResult({ vnb, margin: Math.round(vnb / (Number(simAmount) * 0.15) * 1000) / 10, ape: Math.round(Number(simAmount) * 0.12), mp })
  }

  const displayData = AGG_UNIT_DATA[aggUnit] ?? AGG_UNIT_DATA["보종단위"]

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-6">
        <Card className="p-5 bg-card border-border">
          <div className="flex items-start justify-between mb-1">
            <SecHead num={1} title="집계 조회" desc="집계 단위를 선택하면 해당 기준으로 VNB 예측 결과를 재집계합니다 (증번·보종·상품·MIX·채널)." />
            <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
              <span className="text-xs text-muted-foreground">집계 단위</span>
              <Select value={aggUnit} onValueChange={setAggUnit}>
                <SelectTrigger className="w-32 h-7 bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["증번단위","보종단위","상품단위","MIX단위","채널단위"].map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={displayData} margin={{ left: -10, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                  <XAxis dataKey="unit" tick={chartStyle.tick} />
                  <YAxis tick={chartStyle.tick} tickFormatter={v => `${v}억`} />
                  <RechartsTooltip formatter={(v: number) => [`${v}억`, ""]} contentStyle={chartStyle.contentStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="settlement" fill="hsl(var(--muted-foreground))" radius={[4,4,0,0]} name="결산" />
                  <Bar dataKey="forecast"   fill="hsl(var(--primary))"          radius={[4,4,0,0]} name="예측" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-2">구분</th>
                    <th className="text-right py-2 px-2">예측</th>
                    <th className="text-right py-2 px-2">결산</th>
                    <th className="text-right py-2 px-2">차이</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map(r => {
                    const diff = r.forecast - r.settlement
                    return (
                      <tr key={r.unit} className="border-b border-border/50 hover:bg-secondary/40">
                        <td className="py-2 px-2 font-medium text-foreground">{r.unit}</td>
                        <td className="py-2 px-2 text-right font-mono text-foreground">{r.forecast}억</td>
                        <td className="py-2 px-2 text-right font-mono text-muted-foreground">{r.settlement}억</td>
                        <td className={`py-2 px-2 text-right font-mono ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>{diff > 0 ? "+" : ""}{diff}억</td>
                      </tr>
                    )
                  })}
                  <tr className="border-t-2 border-border font-semibold">
                    <td className="py-2 px-2 text-foreground">합계</td>
                    <td className="py-2 px-2 text-right font-mono text-foreground">{displayData.reduce((s,r) => s+r.forecast, 0)}억</td>
                    <td className="py-2 px-2 text-right font-mono text-muted-foreground">{displayData.reduce((s,r) => s+r.settlement, 0)}억</td>
                    <td className="py-2 px-2 text-right font-mono text-green-600">+{displayData.reduce((s,r) => s+(r.forecast-r.settlement), 0)}억</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border">
          <SecHead num={2} title="가입조건 VNB 시뮬레이션" desc="가입조건을 직접 입력하면 해당 보종 모델이 VNB를 즉시 산출합니다. 입력값은 하나의 MP(가입조건 조합)에 해당합니다." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1.5 block">보종</Label>
                  <Select value={simProduct} onValueChange={v => { setSimProduct(v); setSimResult(null) }}>
                    <SelectTrigger className="bg-secondary border-border text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["암보험","종신보험","연금보험","건강보험"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">채널</Label>
                  <Select value={simChannel} onValueChange={setSimChannel}>
                    <SelectTrigger className="bg-secondary border-border text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["GA","방카","TM","대면"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
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
                  <Label className="text-xs mb-1.5 block">가입금액(만원)</Label>
                  <Input type="number" value={simAmount} onChange={e => setSimAmount(e.target.value)} className="bg-secondary border-border h-8 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1.5 block">보험기간(년)</Label>
                  <Input type="number" value={simInsurePeriod} onChange={e => setSimInsurePeriod(e.target.value)} className="bg-secondary border-border h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">납기(년)</Label>
                  <Input type="number" value={simPayPeriod} onChange={e => setSimPayPeriod(e.target.value)} className="bg-secondary border-border h-8 text-xs" />
                </div>
              </div>
              <Button onClick={onSimulate} className="w-full h-8 text-xs">
                <Play className="h-3.5 w-3.5 mr-1.5" />VNB 시뮬레이션 실행
              </Button>
            </div>
            <div>
              {simResult ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <ResultBox label="예측 VNB"     value={`${simResult.vnb}억`} accent />
                    <ResultBox label="신계약마진율" value={`${simResult.margin}%`} />
                    <ResultBox label="환산 APE"     value={`${simResult.ape}만원`} />
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">적용 MP 조합</p>
                    <p className="text-xs font-mono text-foreground">{simResult.mp}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                    <p className="text-xs text-muted-foreground mb-1.5">적용 모델</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {simProduct === "암보험" ? "M-CANCER-001" : simProduct === "종신보험" ? "M-WHOLE-002" : simProduct === "연금보험" ? "M-PENSION-003" : "M-HEALTH-004"}
                      </Badge>
                      <span className="text-xs text-foreground">{simProduct} 예측모델</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
                  <Activity className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">가입조건을 입력하고 시뮬레이션을 실행하세요</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border">
          <div className="flex items-start justify-between mb-4">
            <SecHead num={3} title="변경 영향 분석" desc="보종을 선택하고 슬라이더를 조절하면 해당 보종 모델 기준으로 조건 변경의 VNB 영향을 실시간으로 확인합니다." />
            <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
              <Select value={chgCat} onValueChange={v => { setChgCat(v); onResetChg() }}>
                <SelectTrigger className="w-28 h-7 bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(CHG_BY_CAT).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={onResetChg} className="h-7 text-xs">초기화</Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-secondary/30 border border-border">
            <span className="text-[10px] text-muted-foreground">적용 모델</span>
            <Badge variant="outline" className="text-[10px]">{catCfg.modelId}</Badge>
            <span className="text-[10px] text-foreground">{chgCat} 예측모델</span>
            <span className="ml-auto text-[10px] text-muted-foreground">기준 VNB</span>
            <span className="text-[10px] font-mono font-semibold text-foreground">{BASE_VNB}억</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />판매MIX 변경
              </p>
              <SliderRow label="채널 (GA비중)"   baseText="30%"   value={gaRatio}     onChange={setGaRatio}     min={10}   max={70}   step={1}   unit="%" delta={d.gaRatio} />
              <SliderRow label="성별 (여성비중)"  baseText="40%"   value={femaleRatio} onChange={setFemaleRatio} min={20}   max={80}   step={1}   unit="%" delta={d.femaleRatio} />
              <SliderRow label="평균 가입연령"    baseText="42세"  value={avgAge}      onChange={setAvgAge}      min={25}   max={60}   step={1}   unit="세" delta={d.avgAge} />
              <SliderRow label="납기"             baseText="20년"  value={payPeriod}   onChange={setPayPeriod}   min={5}    max={30}   step={5}   unit="년" delta={d.payPeriod} />
              <SliderRow label="가입한도"         baseText="1억"   value={maxLimit}    onChange={setMaxLimit}    min={50}   max={300}  step={10}  unit="백만" delta={d.maxLimit} />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />최소보험료 변경
              </p>
              <SliderRow label="최소보험료(월)" baseText="3만원" value={minPremium}  onChange={setMinPremium}  min={1}    max={8}    step={1}   unit="만" delta={d.minPremium} />
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />보험료대 변경
              </p>
              <SliderRow label="평균 가입금액"  baseText="5천만" value={avgAmount}   onChange={setAvgAmount}   min={2000} max={10000} step={500} unit="만" delta={d.avgAmount} />
              <SliderRow label="특약부가율"      baseText="15%"   value={riderRatio}  onChange={setRiderRatio}  min={5}    max={30}   step={1}   unit="%" delta={d.riderRatio} />
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />환산율 변경
              </p>
              <SliderRow label="환산율 (×0.1%)" baseText="2.5%"  value={convRate}    onChange={setConvRate}    min={10}   max={40}   step={1}   unit="%" delta={d.convRate} />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">기준 VNB</p>
                  <p className="text-lg font-bold font-mono text-muted-foreground">{BASE_VNB}억</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">변경 후 예상 VNB</p>
                  <p className={`text-lg font-bold font-mono ${projectedVNB > BASE_VNB ? "text-green-600" : projectedVNB < BASE_VNB ? "text-red-500" : "text-foreground"}`}>
                    {projectedVNB}억
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">순 변화</p>
                <p className={`text-xl font-bold font-mono ${totalDelta > 0 ? "text-green-600" : totalDelta < 0 ? "text-red-500" : "text-foreground"}`}>
                  {totalDelta > 0 ? "+" : ""}{totalDelta}억
                </p>
                <p className={`text-xs ${totalDelta > 0 ? "text-green-600" : totalDelta < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                  ({totalDelta > 0 ? "+" : ""}{((totalDelta / BASE_VNB) * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
