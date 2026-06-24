
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Database, Brain, FlaskConical, Download, RefreshCw, Zap,
  TrendingUp, Activity, CheckCircle2, Clock, FileSpreadsheet, Server, Info,
  Cpu, Target, GitBranch, Layers, ArrowRight, Play, Save, BarChart2,
  FileCheck, Network,
} from "lucide-react"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts"

// ── 공통 UI 컴포넌트 ──────────────────────────────────────────────────────

function SecHead({ num, title, desc, example }: { num: number; title: string; desc?: string; example?: boolean; icon?: typeof Database }) {
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

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Database; label: string; value: string; sub: string }) {
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

function TriggerRow({ label, condition, status }: { label: string; condition: string; status: string }) {
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

function KvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-mono text-foreground text-right">{value}</span>
    </div>
  )
}

function ResultBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`p-4 rounded-lg border text-center ${accent ? "bg-primary/10 border-primary/30" : "bg-secondary/40 border-border"}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  )
}



const chartStyle = {
  contentStyle: { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 },
  tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
  grid: "hsl(var(--border))",
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const explanatoryVars = [
  { category: "VNB결산정보", count: 142, fields: "VNB, 신계약마진, APE, PVNBP, 결산기준일", sync: "정기배치", status: "active" },
  { category: "계약가입속성", count: 88,  fields: "성별, 연령, 보험기간, 납입기간, 가입금액, 채널", sync: "실시간", status: "active" },
  { category: "상품정보",     count: 64,  fields: "증번, 보종, 상품군, 특약구조, 개정이력",         sync: "정기배치", status: "active" },
  { category: "환산정보",     count: 36,  fields: "환산APE, 환산율, 납기별 환산계수",               sync: "정기배치", status: "active" },
  { category: "최적가정",     count: 51,  fields: "위험률, 해지율, 사업비율, 할인율, 손해율",       sync: "실시간",  status: "active" },
  { category: "최소보험료",   count: 27,  fields: "최소보험료, 보험료대, 부가율, 가입한도",         sync: "정기배치", status: "syncing" },
]

const internalSystems = [
  { system: "계약관리시스템 (계관)", type: "정기배치", period: "일 1회 (새벽 2시)", items: "계약가입속성, 최소보험료" },
  { system: "보험료산출시스템",     type: "정기배치", period: "주 1회 (월요일)",   items: "보험료대, 환산율" },
  { system: "VNB결산시스템",        type: "실시간",   period: "결산 이벤트 시",    items: "VNB결산정보, 최적가정" },
  { system: "상품관리시스템",       type: "정기배치", period: "개정 발생 시",      items: "상품정보, 증번/보종" },
  { system: "분석계 DW",            type: "실시간",   period: "On-Demand",         items: "학습 데이터 조회" },
]

const genStats = [
  { month: "1월", rows: 1240000 }, { month: "2월", rows: 1580000 }, { month: "3월", rows: 2100000 },
  { month: "4월", rows: 2650000 }, { month: "5월", rows: 3200000 }, { month: "6월", rows: 4100000 },
]


const modelList = [
  { id: "M-CANCER-001",  name: "암보험 예측모델",   unit: "보종단위", algo: "XGBoost",        mape: 1.8, r2: 0.987, status: "운영중",  lastTrained: "2026-06-01" },
  { id: "M-WHOLE-002",   name: "종신보험 예측모델", unit: "보종단위", algo: "LightGBM",       mape: 2.1, r2: 0.972, status: "운영중",  lastTrained: "2026-05-28" },
  { id: "M-PENSION-003", name: "연금보험 예측모델", unit: "보종단위", algo: "Deep Neural Net", mape: 2.6, r2: 0.965, status: "재학습중", lastTrained: "2026-05-15" },
  { id: "M-HEALTH-004",  name: "건강보험 예측모델", unit: "보종단위", algo: "CatBoost",        mape: 1.9, r2: 0.981, status: "운영중",  lastTrained: "2026-06-03" },
]




const revisionHistory = [
  { product: "암보험 (AM-2401)",   date: "2024-01-15", type: "요율개정", impact: "위험률 3.2% 변경",   status: "재학습완료" },
  { product: "종신보험 (WL-2312)", date: "2023-12-01", type: "상품개정", impact: "특약 추가 (2종)",     status: "재학습완료" },
  { product: "연금보험 (AN-2308)", date: "2023-08-20", type: "이율변경", impact: "예정이율 0.25% 하향", status: "재학습완료" },
]

const aggData = [
  { unit: "암보험",  forecast: 184, settlement: 178 }, { unit: "종신보험", forecast: 92, settlement: 88 },
  { unit: "연금보험", forecast: 61, settlement: 64 },  { unit: "건강보험", forecast: 143, settlement: 139 },
  { unit: "정기보험", forecast: 47, settlement: 45 },
]

// ── 동적 히트맵 ──────────────────────────────────────────────────────────────

const HEATMAP_DIMS: Record<string, string[]> = {
  "채널":     ["GA", "방카", "TM", "대면"],
  "보종":     ["암보험", "종신보험", "연금보험", "건강보험"],
  "연령대":   ["~29세", "30~39세", "40~49세", "50~59세", "60세~"],
  "성별":     ["남", "여"],
  "납기":     ["10년", "15년", "20년", "30년"],
  "보험기간": ["10년", "15년", "20년", "30년"],
}

// 각 차원 값별 VNB 기여 가중치
const DIM_WEIGHTS: Record<string, Record<string, number>> = {
  "채널":     { "GA": 1.00, "방카": 0.85, "TM": 0.72, "대면": 0.95 },
  "보종":     { "암보험": 1.00, "종신보험": 0.62, "연금보험": 0.38, "건강보험": 0.87 },
  "연령대":   { "~29세": 0.62, "30~39세": 0.92, "40~49세": 1.00, "50~59세": 0.85, "60세~": 0.57 },
  "성별":     { "남": 1.00, "여": 0.82 },
  "납기":     { "10년": 0.72, "15년": 0.87, "20년": 1.00, "30년": 1.14 },
  "보험기간": { "10년": 0.68, "15년": 0.84, "20년": 1.00, "30년": 1.18 },
}

function heatmapValue(rowDim: string, rowVal: string, colDim: string, colVal: string): number {
  const base = 95
  const rw = DIM_WEIGHTS[rowDim]?.[rowVal] ?? 1.0
  const cw = DIM_WEIGHTS[colDim]?.[colVal] ?? 1.0
  return Math.round(base * rw * cw)
}



// ── 메인 래퍼 ──────────────────────────────────────────────────────────────

type TabId = "training-db" | "prediction-db" | "result-db" | "model-dev" | "dashboard" | "output"

const TABS: { id: TabId; label: string; icon: typeof Database }[] = [
  { id: "training-db",   label: "학습용 DB",        icon: Database },
  { id: "prediction-db", label: "예측용 DB",         icon: FlaskConical },
  { id: "result-db",     label: "예측결과 저장 DB",  icon: Save },
  { id: "model-dev",     label: "예측모델 개발",     icon: Brain },
  { id: "dashboard",     label: "대시보드",          icon: BarChart2 },
  { id: "output",        label: "출력",              icon: Download },
]

export function VnbAssistant() {
  const [activeTab, setActiveTab] = useState<TabId>("training-db")
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">VNB Assistant</h2>
            <p className="text-xs text-muted-foreground">AI 기반 VNB 예측 모델 학습·시뮬레이션·집계 서비스</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 px-4 border-b border-border bg-card overflow-x-auto flex-shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "training-db"   && <TrainingDbTab />}
        {activeTab === "prediction-db" && <PredictionTab />}
        {activeTab === "result-db"     && <ResultDbTab />}
        {activeTab === "model-dev"     && <ModelDevTab />}
        {activeTab === "dashboard"     && <AggregationTab />}
        {activeTab === "output"        && <OutputTab />}
      </div>
    </div>
  )
}

// ── TAB 1: 학습용 DB ───────────────────────────────────────────────────────

export function TrainingDbTab() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)

  const onGenerate = () => {
    setIsGenerating(true); setGenProgress(0)
    const iv = setInterval(() => setGenProgress(p => {
      if (p >= 100) { clearInterval(iv); setIsGenerating(false); return 100 }
      return p + 8
    }), 180)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Layers}   label="설명변수 총계" value="408개"   sub="6개 카테고리" />
          <StatCard icon={Database} label="학습 데이터"   value="410만건" sub="누적 적재" />
          <StatCard icon={Network}  label="연계 시스템"   value="5개"     sub="배치 3 / 실시간 2" />
        </div>

        <Card className="p-5 bg-card border-border">
          <SecHead num={1} title="설명변수 DB 구축 및 관리" desc="VNB 예측 모델 학습에 사용되는 입력변수를 카테고리별로 관리합니다. 각 변수의 연계 방식과 동기화 상태를 실시간으로 확인할 수 있습니다." />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3">카테고리</th>
                  <th className="text-right py-2 px-3">변수 수</th>
                  <th className="text-left py-2 px-3">주요 필드</th>
                  <th className="text-center py-2 px-3">연계 방식</th>
                  <th className="text-center py-2 px-3">상태</th>
                </tr>
              </thead>
              <tbody>
                {explanatoryVars.map(r => (
                  <tr key={r.category} className="border-b border-border hover:bg-secondary/40">
                    <td className="py-2.5 px-3 font-medium text-foreground">{r.category}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{r.count}</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{r.fields}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="outline" className={`text-[10px] ${r.sync === "실시간" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{r.sync}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {r.status === "active"
                        ? <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="h-3 w-3" />정상</span>
                        : <span className="inline-flex items-center gap-1 text-yellow-600 text-xs"><RefreshCw className="h-3 w-3 animate-spin" />동기화중</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border">
          <SecHead num={2} title="내부 시스템 연계" desc="계관, 보험료산출, VNB결산 등 내부 시스템과의 연계 방식 및 데이터 제공 주기를 관리합니다." />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3">연계 시스템</th>
                  <th className="text-center py-2 px-3">방식</th>
                  <th className="text-center py-2 px-3">제공 주기</th>
                  <th className="text-left py-2 px-3">제공 항목</th>
                </tr>
              </thead>
              <tbody>
                {internalSystems.map(s => (
                  <tr key={s.system} className="border-b border-border hover:bg-secondary/40">
                    <td className="py-2.5 px-3 font-medium text-foreground">{s.system}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="outline" className={`text-[10px] ${s.type === "실시간" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{s.type}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{s.period}</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{s.items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border">
          <SecHead num={3} title="학습 데이터 생성" desc="VNB 산출 엑셀 로직을 기반으로 보종별 가입 가능 조건 전체를 조합해 학습 데이터를 대량 생성합니다." />
          {(isGenerating || genProgress === 100) && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">생성 진행률</span>
                <span className="font-mono text-foreground">{genProgress}%</span>
              </div>
              <Progress value={genProgress} className="h-2" />
              {genProgress === 100 && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />410만건 생성 완료</p>}
            </div>
          )}
          <Button onClick={onGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />생성 중...</> : <><Zap className="h-4 w-4 mr-2" />학습데이터 대량 생성</>}
          </Button>
          <div className="mt-4 w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                <XAxis dataKey="month" tick={chartStyle.tick} />
                <YAxis tick={chartStyle.tick} tickFormatter={v => `${v / 10000}만`} />
                <RechartsTooltip formatter={(v: number) => [`${(v / 10000).toFixed(0)}만건`, "생성량"]} contentStyle={chartStyle.contentStyle} />
                <Bar dataKey="rows" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 4. 보종별 학습 데이터 현황 */}
        <Card className="p-5 bg-card border-border">
          <SecHead num={4} title="보종별 학습 데이터 현황" desc="보종 단위 모델 학습에 사용되는 데이터 규모와 기간 커버리지를 보여줍니다. 데이터가 부족한 보종은 추가 생성이 필요합니다." />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3">보종</th>
                  <th className="text-right py-2 px-3">학습 건수</th>
                  <th className="text-center py-2 px-3">데이터 기간</th>
                  <th className="text-center py-2 px-3">최근 생성일</th>
                  <th className="text-center py-2 px-3">충분성</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: "암보험",   count: "1,847,200", period: "2021.01~2026.06", latest: "2026-06-20", ok: true },
                  { cat: "종신보험", count: "1,203,400", period: "2021.01~2026.06", latest: "2026-06-20", ok: true },
                  { cat: "연금보험", count: "986,200",   period: "2021.06~2026.06", latest: "2026-06-20", ok: true },
                  { cat: "건강보험", count: "748,600",   period: "2022.01~2026.06", latest: "2026-06-20", ok: true },
                  { cat: "정기보험", count: "214,400",   period: "2023.01~2026.06", latest: "2026-06-18", ok: false },
                ].map(r => (
                  <tr key={r.cat} className="border-b border-border hover:bg-secondary/40">
                    <td className="py-2.5 px-3 font-medium text-foreground">{r.cat}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{r.count}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{r.period}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{r.latest}</td>
                    <td className="py-2.5 px-3 text-center">
                      {r.ok
                        ? <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="h-3 w-3" />충분</span>
                        : <span className="inline-flex items-center gap-1 text-amber-500 text-xs"><Clock className="h-3 w-3" />보강 필요</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 5+6. 데이터 품질 & 학습/검증 분리 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 bg-card border-border">
            <SecHead num={5} title="데이터 품질 지표" desc="카테고리별 결측률과 이상치 비율을 모니터링합니다. 기준치(결측률 2%, 이상치 1%) 초과 항목은 전처리 보완이 필요합니다." />
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-3">카테고리</th>
                    <th className="text-right py-2 px-3">결측률</th>
                    <th className="text-right py-2 px-3">이상치 비율</th>
                    <th className="text-center py-2 px-3">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cat: "VNB결산정보",   missing: 0.0,  outlier: 0.3 },
                    { cat: "계약가입속성",   missing: 0.2,  outlier: 0.8 },
                    { cat: "상품정보",       missing: 0.0,  outlier: 0.1 },
                    { cat: "환산정보",       missing: 1.4,  outlier: 0.5 },
                    { cat: "최적가정",       missing: 0.1,  outlier: 1.2 },
                    { cat: "최소보험료",     missing: 3.2,  outlier: 0.6 },
                  ].map(r => {
                    const ok = r.missing < 2 && r.outlier < 1
                    return (
                      <tr key={r.cat} className="border-b border-border/50 hover:bg-secondary/40">
                        <td className="py-2 px-3 font-medium text-foreground">{r.cat}</td>
                        <td className={`py-2 px-3 text-right font-mono ${r.missing >= 2 ? "text-amber-500" : "text-foreground"}`}>{r.missing.toFixed(1)}%</td>
                        <td className={`py-2 px-3 text-right font-mono ${r.outlier >= 1 ? "text-amber-500" : "text-foreground"}`}>{r.outlier.toFixed(1)}%</td>
                        <td className="py-2 px-3 text-center">
                          {ok
                            ? <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" /></span>
                            : <span className="inline-flex items-center gap-1 text-amber-500 text-[10px]">검토 필요</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border">
            <SecHead num={6} title="학습 / 검증 데이터 분리 현황" desc="보종별로 Train 80% / Validation 10% / Test 10% 기준으로 시계열 순서에 맞게 데이터를 분리합니다." />
            <div className="space-y-3">
              {[
                { cat: "암보험",   train: 80, val: 10, test: 10, trainN: "147.8만", valN: "18.5만", testN: "18.5만" },
                { cat: "종신보험", train: 80, val: 10, test: 10, trainN: "96.3만",  valN: "12.0만", testN: "12.0만" },
                { cat: "연금보험", train: 80, val: 10, test: 10, trainN: "78.9만",  valN: "9.9만",  testN: "9.9만"  },
                { cat: "건강보험", train: 80, val: 10, test: 10, trainN: "59.9만",  valN: "7.5만",  testN: "7.5만"  },
                { cat: "정기보험", train: 80, val: 10, test: 10, trainN: "17.2만",  valN: "2.1만",  testN: "2.1만"  },
              ].map(r => (
                <div key={r.cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{r.cat}</span>
                    <span className="text-[10px] text-muted-foreground">Train {r.trainN} · Val {r.valN} · Test {r.testN}</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden gap-px">
                    <div className="bg-primary" style={{ width: `${r.train}%` }} title={`Train ${r.train}%`} />
                    <div className="bg-primary/40" style={{ width: `${r.val}%` }} title={`Val ${r.val}%`} />
                    <div className="bg-muted-foreground/30" style={{ width: `${r.test}%` }} title={`Test ${r.test}%`} />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-primary inline-block" />Train 80%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-primary/40 inline-block" />Validation 10%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-muted-foreground/30 inline-block" />Test 10%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── TAB 2: 예측용 DB ───────────────────────────────────────────────────────

const BY_CAT_MP = [
  { cat: "암보험",   modelId: "M-CANCER-001",  combo: "연령(51)×성별(2)×기간(6)×금액(11)×채널(5)", insAge: "15~65세", period: "10~30년", amount: "1,000만~1억",  mpCount: "2,847,600", ready: true  },
  { cat: "종신보험", modelId: "M-WHOLE-002",   combo: "연령(41)×성별(2)×금액(12)×채널(5)",          insAge: "20~60세", period: "전기납",  amount: "1,000만~5억",  mpCount: "1,203,400", ready: true  },
  { cat: "연금보험", modelId: "M-PENSION-003", combo: "연령(31)×성별(2)×기간(5)×금액(10)×채널(4)", insAge: "25~55세", period: "5~20년",  amount: "1,000만~3억",  mpCount: "986,200",   ready: true  },
  { cat: "건강보험", modelId: "M-HEALTH-004",  combo: "연령(56)×성별(2)×기간(6)×금액(7)×채널(5)",  insAge: "15~70세", period: "10~30년", amount: "500만~5,000만", mpCount: "748,600",   ready: true  },
  { cat: "정기보험", modelId: "—",             combo: "연령(36)×성별(2)×기간(4)×금액(8)×채널(5)",  insAge: "20~55세", period: "10~20년", amount: "1,000만~2억",  mpCount: "214,400",   ready: false },
]


export function PredictionTab() {
  const [age, setAge] = useState("40")
  const [gender, setGender] = useState("M")
  const [channel, setChannel] = useState("GA")
  const [product, setProduct] = useState("암보험")
  const [amount, setAmount] = useState("5000")
  const [result, setResult] = useState<{ vnb: number; margin: number; ape: number; modelId: string } | null>(null)

  const onPredict = () => {
    const row = BY_CAT_MP.find(r => r.cat === product)
    if (!row?.ready) return
    const base = product === "암보험" ? 180 : product === "종신보험" ? 95 : product === "연금보험" ? 62 : 143
    const af = 1 + (40 - Number(age)) * 0.004
    const cf = channel === "GA" ? 1.08 : channel === "방카" ? 0.94 : 1.0
    const amf = Number(amount) / 5000
    const vnb = Math.round(base * af * cf * amf)
    setResult({ vnb, margin: Math.round(vnb / (Number(amount) * 0.15) * 1000) / 10, ape: Math.round(Number(amount) * 0.12), modelId: row.modelId })
  }

return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={Database}     label="보종별 MP 총계"  value="5,999만" sub="5개 보종" />
          <StatCard icon={CheckCircle2} label="전처리 완료 보종" value="4종"    sub="정기보험 보완 필요" />
          <StatCard icon={Clock}        label="최근 예측 수행"  value="10분 전" sub="배치 자동 실행" />
        </div>

        {/* 1. 보종별 MP DB */}
        <Card className="p-5 bg-card border-border">
          <SecHead num={1} title="보종별 MP DB 생성" desc="보종별 예측 모델에 입력될 MP(Model Point)를 가입 가능 조건 전 범위로 생성합니다. 보종마다 연결된 예측 모델 ID를 확인할 수 있습니다." />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3">보종</th>
                  <th className="text-left py-2 px-3">연결 모델</th>
                  <th className="text-left py-2 px-3">
                    <span>조합 기준</span>
                    <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-300 font-medium align-middle">예시</span>
                  </th>
                  <th className="text-center py-2 px-3">가입연령</th>
                  <th className="text-center py-2 px-3">보험기간</th>
                  <th className="text-center py-2 px-3">가입금액</th>
                  <th className="text-right py-2 px-3">MP 건수</th>
                  <th className="text-center py-2 px-3">상태</th>
                </tr>
              </thead>
              <tbody>
                {BY_CAT_MP.map(r => (
                  <tr key={r.cat} className="border-b border-border hover:bg-secondary/40">
                    <td className="py-2.5 px-3 font-medium text-foreground">{r.cat}</td>
                    <td className="py-2.5 px-3 font-mono text-primary text-xs">{r.modelId}</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{r.combo}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{r.insAge}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{r.period}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{r.amount}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">{r.mpCount}</td>
                    <td className="py-2.5 px-3 text-center">
                      {r.ready
                        ? <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="h-3 w-3" />준비완료</span>
                        : <span className="inline-flex items-center gap-1 text-amber-500 text-xs"><Clock className="h-3 w-3" />모델 개발 중</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 2. 보종별 VNB 예측 수행 */}
        <Card className="p-5 bg-card border-border">
          <SecHead num={2} title="보종별 VNB 예측 수행" desc="보종을 선택하면 해당 보종의 예측 모델이 자동으로 적용됩니다. 가입조건 입력 후 해당 모델로 VNB를 예측합니다." />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-xs mb-1.5 block">보종 선택</Label>
                <Select value={product} onValueChange={v => { setProduct(v); setResult(null) }}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BY_CAT_MP.filter(r => r.ready).map(r => (
                      <SelectItem key={r.cat} value={r.cat}>{r.cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-primary mt-1.5">
                  적용 모델: {BY_CAT_MP.find(r => r.cat === product)?.modelId ?? "—"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1.5 block">가입연령</Label>
                  <Input type="number" value={age} onChange={e => setAge(e.target.value)} className="bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">성별</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="M">남성</SelectItem><SelectItem value="F">여성</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">판매채널</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GA">GA</SelectItem>
                    <SelectItem value="방카">방카</SelectItem>
                    <SelectItem value="TM">TM</SelectItem>
                    <SelectItem value="대면">대면</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">가입금액 (만원)</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="bg-secondary border-border" />
              </div>
              <Button onClick={onPredict} className="w-full"><Play className="h-4 w-4 mr-2" />VNB 예측 실행</Button>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <Card className="p-4 border-border bg-secondary/20">
                <p className="text-xs font-semibold text-foreground mb-3">예측 결과</p>
                {result ? (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <ResultBox label="예측 VNB"    value={`${result.vnb}억`} accent />
                      <ResultBox label="신계약마진율" value={`${result.margin}%`} />
                      <ResultBox label="환산 APE"    value={`${result.ape}만원`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">적용 모델: <span className="font-mono text-primary">{result.modelId}</span></p>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <FlaskConical className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-xs">보종 및 가입조건 입력 후 예측을 실행하세요</p>
                  </div>
                )}
              </Card>
              <Card className="p-4 border-border bg-secondary/20">
                <p className="text-xs font-semibold text-foreground mb-3">예측 이력</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-1.5 px-2">예측 ID</th>
                      <th className="text-left py-1.5 px-2">보종</th>
                      <th className="text-left py-1.5 px-2">적용 모델</th>
                      <th className="text-right py-1.5 px-2">VNB</th>
                      <th className="text-right py-1.5 px-2">마진율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "PRED-0623-001", cat: "암보험",   model: "M-CANCER-001",  vnb: 184, margin: 24.1 },
                      { id: "PRED-0623-002", cat: "종신보험", model: "M-WHOLE-002",   vnb: 92,  margin: 9.8  },
                      { id: "PRED-0623-003", cat: "연금보험", model: "M-PENSION-003", vnb: 61,  margin: 14.2 },
                      { id: "PRED-0623-004", cat: "건강보험", model: "M-HEALTH-004",  vnb: 143, margin: 18.7 },
                    ].map(p => (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="py-1.5 px-2 font-mono text-primary text-[10px]">{p.id}</td>
                        <td className="py-1.5 px-2 text-foreground">{p.cat}</td>
                        <td className="py-1.5 px-2 font-mono text-muted-foreground text-[10px]">{p.model}</td>
                        <td className="py-1.5 px-2 text-right font-semibold text-foreground">{p.vnb}억</td>
                        <td className="py-1.5 px-2 text-right text-green-600">{p.margin}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── TAB 3: 예측결과 저장 DB ────────────────────────────────────────────────

export function ResultDbTab() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={Save}         label="저장된 MP 예측 건수" value="599만건" sub="5개 보종 합계" />
          <StatCard icon={Database}     label="결과 DB 용량"        value="38GB"   sub="보종단위 적재" />
          <StatCard icon={CheckCircle2} label="집계 완료 보종"      value="4종"    sub="정기보험 적재중" />
          <StatCard icon={Clock}        label="최근 적재"           value="10분 전" sub="배치 자동 실행" />
        </div>

        {/* 1. 보종별 MP 예측 결과 저장 */}
        <Card className="p-5 bg-card border-border">
          <SecHead num={1} title="보종별 MP 예측 결과 저장" desc="보종별 예측 모델이 전체 MP 조합에 대해 산출한 VNB 값을 보종 단위로 적재합니다. 적재 완료된 보종만 집계에 활용됩니다." />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3">보종</th>
                  <th className="text-left py-2 px-3">연결 모델</th>
                  <th className="text-left py-2 px-3">테이블명</th>
                  <th className="text-right py-2 px-3">저장 MP 건수</th>
                  <th className="text-center py-2 px-3">최근 산출일</th>
                  <th className="text-center py-2 px-3">상태</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: "암보험",   model: "M-CANCER-001",  table: "TB_VNB_RESULT_CANCER",  count: "2,847,600", updated: "2026-06-23 06:00", ok: true  },
                  { cat: "종신보험", model: "M-WHOLE-002",   table: "TB_VNB_RESULT_WHOLE",   count: "1,203,400", updated: "2026-06-23 06:05", ok: true  },
                  { cat: "연금보험", model: "M-PENSION-003", table: "TB_VNB_RESULT_PENSION", count: "986,200",   updated: "2026-06-23 06:10", ok: true  },
                  { cat: "건강보험", model: "M-HEALTH-004",  table: "TB_VNB_RESULT_HEALTH",  count: "748,600",   updated: "2026-06-23 06:15", ok: true  },
                  { cat: "정기보험", model: "—",             table: "TB_VNB_RESULT_TERM",    count: "214,400",   updated: "—",               ok: false },
                ].map(r => (
                  <tr key={r.cat} className="border-b border-border hover:bg-secondary/40">
                    <td className="py-2.5 px-3 font-medium text-foreground">{r.cat}</td>
                    <td className="py-2.5 px-3 font-mono text-primary text-xs">{r.model}</td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground text-xs">{r.table}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{r.count}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{r.updated}</td>
                    <td className="py-2.5 px-3 text-center">
                      {r.ok
                        ? <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="h-3 w-3" />적재완료</span>
                        : <span className="inline-flex items-center gap-1 text-amber-500 text-xs"><Clock className="h-3 w-3" />모델 개발 중</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 2. 보종별 VNB 집계 결과 */}
        <Card className="p-5 bg-card border-border">
          <SecHead num={2} title="보종별 VNB 집계 결과" desc="MP별 예측 VNB에 실제 판매 믹스(가중치)를 적용해 보종 단위 VNB를 집계합니다. 채널·가입조건별 세부 집계도 함께 확인합니다." />
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3">보종</th>
                  <th className="text-right py-2 px-3">예측 VNB (억)</th>
                  <th className="text-right py-2 px-3">신계약마진율</th>
                  <th className="text-right py-2 px-3">환산 APE (억)</th>
                  <th className="text-center py-2 px-3">판매 믹스 기준</th>
                  <th className="text-center py-2 px-3">집계일</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: "암보험",   vnb: 1847, margin: 24.1, ape: 7652, mix: "최근 3개월 실적", date: "2026-06-23" },
                  { cat: "종신보험", vnb: 923,  margin: 9.8,  ape: 9418, mix: "최근 3개월 실적", date: "2026-06-23" },
                  { cat: "연금보험", vnb: 612,  margin: 14.2, ape: 4310, mix: "최근 3개월 실적", date: "2026-06-23" },
                  { cat: "건강보험", vnb: 1430, margin: 18.7, ape: 7647, mix: "최근 3개월 실적", date: "2026-06-23" },
                  { cat: "정기보험", vnb: null, margin: null, ape: null, mix: "—",            date: "—"          },
                ].map(r => (
                  <tr key={r.cat} className="border-b border-border hover:bg-secondary/40">
                    <td className="py-2.5 px-3 font-medium text-foreground">{r.cat}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">{r.vnb != null ? r.vnb.toLocaleString() : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-green-600">{r.margin != null ? `${r.margin}%` : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{r.ape != null ? r.ape.toLocaleString() : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{r.mix}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border pt-4 space-y-2">
            {[
              { label: "채널 단위 세부 집계",   desc: "GA / 방카 / TM / 대면 × 4개 보종",  status: "완료" },
              { label: "가입조건 단위 세부 집계", desc: "연령대 × 성별 × 보험기간 단위",     status: "완료" },
              { label: "전사 VNB 합산",          desc: "4개 보종 VNB 합계 (정기보험 제외)", status: "완료" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 border border-border">
                <div>
                  <p className="text-xs font-medium text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
                <Badge variant="outline" className="text-[10px] border-green-500 text-green-600">{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  )
}

// ── TAB 4: 예측모델 개발 ──────────────────────────────────────────────────

const shapByModel: Record<string, { variable: string; impact: number }[]> = {
  "암보험":   [{ variable: "위험률", impact: 0.34 }, { variable: "최소보험료", impact: 0.27 }, { variable: "해지율", impact: 0.19 }, { variable: "가입연령", impact: 0.16 }, { variable: "사업비율", impact: 0.13 }, { variable: "납입기간", impact: 0.11 }, { variable: "환산율", impact: 0.08 }, { variable: "채널", impact: 0.06 }],
  "종신보험": [{ variable: "납입기간", impact: 0.31 }, { variable: "해지율", impact: 0.26 }, { variable: "위험률", impact: 0.22 }, { variable: "가입연령", impact: 0.18 }, { variable: "최소보험료", impact: 0.14 }, { variable: "사업비율", impact: 0.09 }, { variable: "환산율", impact: 0.07 }, { variable: "채널", impact: 0.05 }],
  "연금보험": [{ variable: "예정이율", impact: 0.38 }, { variable: "납입기간", impact: 0.29 }, { variable: "가입연령", impact: 0.21 }, { variable: "해지율", impact: 0.15 }, { variable: "환산율", impact: 0.12 }, { variable: "최소보험료", impact: 0.08 }, { variable: "위험률", impact: 0.06 }, { variable: "채널", impact: 0.04 }],
  "건강보험": [{ variable: "위험률", impact: 0.41 }, { variable: "가입연령", impact: 0.25 }, { variable: "최소보험료", impact: 0.18 }, { variable: "해지율", impact: 0.14 }, { variable: "사업비율", impact: 0.11 }, { variable: "납입기간", impact: 0.09 }, { variable: "환산율", impact: 0.06 }, { variable: "채널", impact: 0.04 }],
}

const perfByModel: Record<string, { date: string; rmse: number; mape: number }[]> = {
  "암보험":   [{ date: "1월", rmse: 4.2, mape: 3.1 }, { date: "2월", rmse: 3.8, mape: 2.8 }, { date: "3월", rmse: 3.5, mape: 2.5 }, { date: "4월", rmse: 3.1, mape: 2.2 }, { date: "5월", rmse: 2.9, mape: 2.0 }, { date: "6월", rmse: 2.7, mape: 1.8 }],
  "종신보험": [{ date: "1월", rmse: 5.1, mape: 3.8 }, { date: "2월", rmse: 4.6, mape: 3.4 }, { date: "3월", rmse: 4.2, mape: 3.0 }, { date: "4월", rmse: 3.9, mape: 2.7 }, { date: "5월", rmse: 3.5, mape: 2.4 }, { date: "6월", rmse: 3.2, mape: 2.1 }],
  "연금보험": [{ date: "1월", rmse: 5.8, mape: 4.2 }, { date: "2월", rmse: 5.3, mape: 3.9 }, { date: "3월", rmse: 4.9, mape: 3.5 }, { date: "4월", rmse: 4.4, mape: 3.1 }, { date: "5월", rmse: 4.1, mape: 2.9 }, { date: "6월", rmse: 3.8, mape: 2.6 }],
  "건강보험": [{ date: "1월", rmse: 3.9, mape: 2.8 }, { date: "2월", rmse: 3.5, mape: 2.5 }, { date: "3월", rmse: 3.2, mape: 2.3 }, { date: "4월", rmse: 2.9, mape: 2.0 }, { date: "5월", rmse: 2.6, mape: 1.8 }, { date: "6월", rmse: 2.4, mape: 1.6 }],
}

export function ModelDevTab() {
  const [shapModel, setShapModel] = useState("암보험")
  const [perfModel, setPerfModel] = useState("암보험")
  const [reproModel, setReproModel] = useState("암보험")

  const reproData: Record<string, { id: string; ver: string; algo: string; params: { k: string; v: string }[]; pipe: string; run: string }> = {
    "암보험":   { id: "M-CANCER-001",  ver: "v3.2.1", algo: "XGBoost",  params: [{ k: "learning_rate", v: "0.05" }, { k: "max_depth", v: "8" }, { k: "n_estimators", v: "1200" }, { k: "subsample", v: "0.8" }, { k: "colsample_bytree", v: "0.9" }], pipe: "v2.4.1", run: "run_a1b2c3d4" },
    "종신보험": { id: "M-WHOLE-002",   ver: "v2.8.0", algo: "LightGBM", params: [{ k: "learning_rate", v: "0.03" }, { k: "max_depth", v: "7" }, { k: "n_estimators", v: "800" }, { k: "min_child_samples", v: "5" }, { k: "num_leaves", v: "63" }], pipe: "v2.4.1", run: "run_e5f6g7h8" },
    "연금보험": { id: "M-PENSION-003", ver: "v2.1.3", algo: "LightGBM", params: [{ k: "learning_rate", v: "0.04" }, { k: "max_depth", v: "6" }, { k: "n_estimators", v: "1000" }, { k: "reg_lambda", v: "1.2" }, { k: "num_leaves", v: "31" }], pipe: "v2.3.0", run: "run_i9j0k1l2" },
    "건강보험": { id: "M-HEALTH-004",  ver: "v3.0.5", algo: "CatBoost", params: [{ k: "depth", v: "8" }, { k: "iterations", v: "900" }, { k: "l2_leaf_reg", v: "3" }, { k: "rsm", v: "0.9" }, { k: "learning_rate", v: "0.04" }], pipe: "v2.4.1", run: "run_m3n4o5p6" },
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={Brain}     label="운영 모델"     value="4개"    sub="보종단위" />
          <StatCard icon={Target}    label="평균 정확도"   value="97.6%"  sub="R² 0.976" />
          <StatCard icon={Activity}  label="모니터링"      value="실시간" sub="성능 추적중" />
          <StatCard icon={GitBranch} label="재학습 트리거" value="주간"   sub="조건부 자동" />
        </div>

        <Card className="p-5 bg-card border-border">
          <SecHead num={1} title="보종별 예측 모델 구축 현황" desc="보종마다 독립된 VNB 예측 모델을 구축합니다. 각 모델은 해당 보종의 학습 데이터로 개별 학습되며, 정확도와 R² 기준으로 운영 여부를 관리합니다." />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3">모델 ID</th>
                  <th className="text-left py-2 px-3">보종</th>
                  <th className="text-center py-2 px-3">알고리즘</th>
                  <th className="text-right py-2 px-3">
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 cursor-default">
                            정확도
                            <Info className="h-3 w-3 text-muted-foreground/60" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          (1 - MAPE) × 100
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                  <th className="text-right py-2 px-3">R²</th>
                  <th className="text-center py-2 px-3">상태</th>
                  <th className="text-right py-2 px-3">최종 학습</th>
                </tr>
              </thead>
              <tbody>
                {modelList.map(m => (
                  <tr key={m.id} className="border-b border-border hover:bg-secondary/40">
                    <td className="py-2.5 px-3 font-mono text-primary text-xs">{m.id}</td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{m.name}</td>
                    <td className="py-2.5 px-3 text-center"><Badge variant="outline" className="text-[10px]">{m.algo}</Badge></td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{((1 - m.mape / 100) * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{m.r2}</td>
                    <td className="py-2.5 px-3 text-center">
                      {m.status === "운영중"
                        ? <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="h-3 w-3" />{m.status}</span>
                        : <span className="inline-flex items-center gap-1 text-yellow-600 text-xs"><RefreshCw className="h-3 w-3 animate-spin" />{m.status}</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground text-xs">{m.lastTrained}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 bg-card border-border">
            <SecHead num={2} title="보종별 알고리즘 선정" desc="각 보종의 데이터 특성에 맞는 알고리즘을 실험 비교 후 선정합니다." />
            <div className="space-y-2">
              {[
                { algo: "Linear Regression", type: "Baseline", note: "단순 선형 관계 가정, 기준선 역할" },
                { algo: "Random Forest",     type: "ML",       note: "앙상블 기반, 과적합에 강건" },
                { algo: "XGBoost",           type: "ML",       note: "부스팅 기반, 단기 시계열 예측 우수" },
                { algo: "LightGBM",          type: "ML",       note: "대용량 데이터 처리 속도 강점" },
                { algo: "CatBoost",          type: "ML",       note: "범주형 변수 자동 처리, 튜닝 부담 적음" },
              ].map(a => (
                <div key={a.algo} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 border border-border">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${a.type === "Baseline" ? "border-muted-foreground text-muted-foreground" : "border-primary text-primary"}`}>{a.type}</Badge>
                    <span className="text-xs font-medium text-foreground">{a.algo}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.note}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-card border-border">
            <SecHead num={3} title="모델 재현성 확보" desc="보종별 모델의 버전, 하이퍼파라미터, 전처리 파이프라인을 개별 관리합니다. MLflow로 실험 이력을 추적합니다." />
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-muted-foreground">보종 선택</span>
              <Select value={reproModel} onValueChange={setReproModel}>
                <SelectTrigger className="h-7 text-xs w-32 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(reproData).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {(() => {
              const r = reproData[reproModel]
              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-0">
                    <KvRow label="모델 ID"           value={r.id} />
                    <KvRow label="알고리즘"           value={r.algo} />
                    <KvRow label="모델 버전"          value={r.ver} />
                    <KvRow label="전처리 파이프라인"  value={r.pipe} />
                    <KvRow label="MLflow Run ID"      value={r.run} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">하이퍼파라미터</p>
                    <div className="space-y-1">
                      {r.params.map(p => (
                        <div key={p.k} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-secondary/40 border border-border">
                          <span className="text-xs font-mono text-muted-foreground">{p.k}</span>
                          <span className="text-xs font-mono font-semibold text-foreground">{p.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 bg-card border-border">
            <SecHead num={4} title="보종별 영향도 분석 (SHAP)" desc="선택한 보종 모델의 변수 영향도입니다. 보종마다 주요 변수가 다르게 나타납니다." />
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground">보종 선택</span>
              <Select value={shapModel} onValueChange={setShapModel}>
                <SelectTrigger className="h-7 text-xs w-32 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(shapByModel).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={shapByModel[shapModel]} layout="vertical" margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                <XAxis type="number" tick={chartStyle.tick} />
                <YAxis type="category" dataKey="variable" tick={chartStyle.tick} width={65} />
                <RechartsTooltip formatter={(v: number) => [v.toFixed(2), "SHAP 값"]} contentStyle={chartStyle.contentStyle} />
                <Bar dataKey="impact" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5 bg-card border-border">
            <SecHead num={5} title="보종별 성능 모니터링" desc="선택한 보종 모델의 월별 RMSE·MAPE 추이입니다." />
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground">보종 선택</span>
              <Select value={perfModel} onValueChange={setPerfModel}>
                <SelectTrigger className="h-7 text-xs w-32 bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(perfByModel).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={perfByModel[perfModel]} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStyle.grid} />
                <XAxis dataKey="date" tick={chartStyle.tick} />
                <YAxis tick={chartStyle.tick} />
                <RechartsTooltip contentStyle={chartStyle.contentStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="rmse" stroke="hsl(var(--chart-1))" strokeWidth={2} name="RMSE" dot={false} />
                <Line type="monotone" dataKey="mape" stroke="hsl(var(--chart-2))" strokeWidth={2} name="MAPE" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-5 bg-card border-border">
          <SecHead num={6} title="재학습 체계 구축" desc="보종별 모델의 성능 저하나 상품 개정 발생 시 자동으로 재학습이 트리거됩니다." />
          <div className="space-y-3">
            <TriggerRow label="정기 재학습"     condition="매주 월요일 02:00"       status="활성" />
            <TriggerRow label="성능 저하 감지"  condition="MAPE > 3% 초과 시"       status="활성" />
            <TriggerRow label="상품 개정 반영"  condition="보종 개정 이벤트 발생 시" status="활성" />
            <TriggerRow label="데이터 드리프트" condition="분포 변화 PSI > 0.2"      status="활성" />
          </div>
        </Card>

        <Card className="p-5 bg-card border-border">
          <SecHead num={7} title="보종 개정 대응" desc="보종별 요율·이율·상품 개정 발생 시 해당 보종 모델을 재학습합니다." />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3">보종</th>
                  <th className="text-center py-2 px-3">개정일</th>
                  <th className="text-center py-2 px-3">개정 유형</th>
                  <th className="text-left py-2 px-3">영향 항목</th>
                  <th className="text-center py-2 px-3">처리 상태</th>
                </tr>
              </thead>
              <tbody>
                {revisionHistory.map(r => (
                  <tr key={r.product} className="border-b border-border hover:bg-secondary/40">
                    <td className="py-2.5 px-3 font-medium text-foreground">{r.product}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{r.date}</td>
                    <td className="py-2.5 px-3 text-center"><Badge variant="outline" className="text-[10px]">{r.type}</Badge></td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{r.impact}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="h-3 w-3" />{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── 대시보드 전용 데이터 ──────────────────────────────────────────────────

// 분기별 결산 vs 예측 모델 트렌드 (보종별)
const quarterlyTrend: Record<string, { q: string; settlement: number; forecast: number }[]> = {
  "전체": [
    { q: "2025Q1", settlement: 458, forecast: 471 },
    { q: "2025Q2", settlement: 481, forecast: 493 },
    { q: "2025Q3", settlement: 502, forecast: 514 },
    { q: "2025Q4", settlement: 516, forecast: 528 },
    { q: "2026Q1", settlement: 527, forecast: 539 },
    { q: "2026Q2", settlement: null as unknown as number, forecast: 547 },
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

// 동일가입조건 결산 DB vs AI 집계 비교
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


// ── TAB 5: 대시보드 ────────────────────────────────────────────────────────

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

  const trendData   = quarterlyTrend[trendCat]  ?? quarterlyTrend["전체"]
  const cmpData     = conditionCompare[cmpCat]   ?? conditionCompare["암보험"]
  const totalFcst   = aggData.reduce((s, r) => s + r.forecast, 0)
  const totalSettl  = aggData.reduce((s, r) => s + r.settlement, 0)
  const avgMape     = (aggData.reduce((s, r) => s + Math.abs(r.forecast - r.settlement) / r.settlement, 0) / aggData.length * 100).toFixed(1)

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-5 p-6">

        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp}   label="VNB Assistant 집계" value={`${totalFcst}억`}  sub="4개 보종 합산" />
          <StatCard icon={BarChart2}    label="결산 DB 집계"        value={`${totalSettl}억`} sub="동일 기간 기준" />
          <StatCard icon={Activity}     label="평균 MAPE"           value={`${avgMape}%`}     sub="보종 평균" />
          <StatCard icon={CheckCircle2} label="집계 완료 보종"      value="4종"               sub="정기보험 제외" />
        </div>

        {/* 섹션 1: 결산 DB vs 예측 모델 트렌드 */}
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

        {/* 섹션 2: 동일가입조건 비교 */}
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

        {/* 섹션 3: 사용자 조건 VNB 예측·집계 */}
        <Card className="p-5 bg-card border-border">
          <SecHead num={3} title="원하는 조건으로 VNB 예측·집계" desc="가입조건을 입력하면 보종별 예측 모델이 VNB를 즉시 산출하고, 결산 DB의 동일조건 집계값과 나란히 비교합니다." />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 조건 입력 */}
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

            {/* 결과 비교 */}
            <div className="lg:col-span-3">
              {simResult ? (
                <div className="space-y-3 h-full">
                  {/* 결산 DB vs AI 비교 */}
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

        {/* 섹션 4: 판매속성별 히트맵 (축 자유 설정) */}
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
                      {colVals.map(cv => (
                        <th key={cv} className="text-center py-2 px-2 font-medium">{cv}</th>
                      ))}
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

// ── TAB 6: 출력 ───────────────────────────────────────────────────────────

const OUTPUT_PREVIEW: Record<string, { unit: string; forecast: number; settlement: number }[]> = {
  "보종단위": [
    { unit: "암보험",   forecast: 184, settlement: 178 },
    { unit: "종신보험", forecast: 92,  settlement: 88  },
    { unit: "연금보험", forecast: 61,  settlement: 64  },
    { unit: "건강보험", forecast: 143, settlement: 139 },
    { unit: "정기보험", forecast: 47,  settlement: 45  },
  ],
  "채널단위": [
    { unit: "GA",   forecast: 198, settlement: 191 },
    { unit: "방카", forecast: 142, settlement: 138 },
    { unit: "TM",   forecast: 87,  settlement: 90  },
    { unit: "대면", forecast: 100, settlement: 97  },
  ],
  "상품단위": [
    { unit: "무배당암보험",   forecast: 184, settlement: 178 },
    { unit: "통합종신보험",   forecast: 92,  settlement: 88  },
    { unit: "변액연금보험",   forecast: 61,  settlement: 64  },
    { unit: "건강든든보험",   forecast: 143, settlement: 139 },
  ],
  "MIX단위": [
    { unit: "GA × 암보험",    forecast: 92,  settlement: 88  },
    { unit: "방카 × 종신보험", forecast: 88,  settlement: 86  },
    { unit: "TM × 연금보험",   forecast: 74,  settlement: 72  },
    { unit: "대면 × 건강보험", forecast: 88,  settlement: 85  },
  ],
  "증번단위": [
    { unit: "암보험",   forecast: 184, settlement: 178 },
    { unit: "종신보험", forecast: 92,  settlement: 88  },
    { unit: "연금보험", forecast: 61,  settlement: 64  },
    { unit: "건강보험", forecast: 143, settlement: 139 },
  ],
}

const OUTPUT_HISTORY = [
  { date: "2026-06-23 09:00", name: "VNB_예측집계_보종단위_2026Q2.xlsx", unit: "보종단위", format: "Excel", size: "1.2MB", quarter: "2026 Q2", status: "완료" },
  { date: "2026-06-20 14:30", name: "VNB_예측집계_채널단위_2026Q2.pdf",  unit: "채널단위", format: "PDF",   size: "3.4MB", quarter: "2026 Q2", status: "완료" },
  { date: "2026-06-17 11:00", name: "VNB_예측집계_상품단위_2026Q2.xlsx", unit: "상품단위", format: "Excel", size: "0.9MB", quarter: "2026 Q2", status: "완료" },
  { date: "2026-06-10 08:00", name: "VNB_예측집계_보종단위_2026Q1.xlsx", unit: "보종단위", format: "Excel", size: "1.1MB", quarter: "2026 Q1", status: "완료" },
  { date: "2026-03-14 16:20", name: "VNB_예측집계_MIX단위_2026Q1.pdf",   unit: "MIX단위",  format: "PDF",   size: "4.1MB", quarter: "2026 Q1", status: "완료" },
]

const EXCEL_SHEETS: Record<string, string[]> = {
  "보종단위": ["요약", "암보험", "종신보험", "연금보험", "건강보험", "정기보험"],
  "채널단위": ["요약", "GA", "방카", "TM", "대면"],
  "상품단위": ["요약", "무배당암보험", "통합종신보험", "변액연금보험", "건강든든보험"],
  "MIX단위":  ["요약", "GA×암보험", "방카×종신", "TM×연금", "대면×건강"],
  "증번단위": ["요약", "보종별 증번 목록"],
}

const PRODUCTS = ["암보험", "종신보험", "연금보험", "건강보험", "정기보험"]

export function OutputTab() {
  const [unit,           setUnit]           = useState("보종단위")
  const [format,         setFormat]         = useState("excel")
  const [year,           setYear]           = useState("2026")
  const [quarter,        setQuarter]        = useState("Q2")
  const [selectedProds,  setSelectedProds]  = useState<string[]>(["암보험","종신보험","연금보험","건강보험"])
  const [inclChart,      setInclChart]      = useState(true)
  const [inclModel,      setInclModel]      = useState(true)
  const [inclCompare,    setInclCompare]    = useState(true)
  const [inclShap,       setInclShap]       = useState(false)
  const [inclTrend,      setInclTrend]      = useState(false)

  const toggleProd = (p: string) =>
    setSelectedProds(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const previewData = (OUTPUT_PREVIEW[unit] ?? OUTPUT_PREVIEW["보종단위"])
    .filter(r => unit !== "보종단위" || selectedProds.some(p => r.unit.includes(p.replace("보험",""))))

  const totalFcst   = previewData.reduce((s, r) => s + r.forecast, 0)
  const totalSettl  = previewData.reduce((s, r) => s + r.settlement, 0)

  const fileName = `VNB_예측집계_${unit}_${year}${quarter}`

  const tableRows = previewData.map(r => {
    const diff = r.forecast - r.settlement
    const mape = (Math.abs(diff) / r.settlement * 100).toFixed(1)
    return { ...r, diff, mape }
  })

  const handleDownload = () => {
    if (format === "excel") {
      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8">
          <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>
            <x:ExcelWorksheet><x:Name>${unit}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
          </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        </head>
        <body>
          <table border="1">
            <thead>
              <tr style="background:#003DA5;color:white;font-weight:bold">
                <th>구분</th><th>예측 모델 (억)</th><th>결산 DB (억)</th><th>차이 (억)</th><th>MAPE (%)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows.map(r => `
                <tr>
                  <td>${r.unit}</td>
                  <td align="right">${r.forecast}</td>
                  <td align="right">${r.settlement}</td>
                  <td align="right">${r.diff > 0 ? "+" : ""}${r.diff}</td>
                  <td align="right">${r.mape}%</td>
                </tr>`).join("")}
              <tr style="font-weight:bold;background:#f0f0f0">
                <td>합계</td>
                <td align="right">${totalFcst}</td>
                <td align="right">${totalSettl}</td>
                <td align="right">${totalFcst - totalSettl > 0 ? "+" : ""}${totalFcst - totalSettl}</td>
                <td align="right">${(Math.abs(totalFcst - totalSettl) / totalSettl * 100).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </body></html>`
      const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `${fileName}.xls`
      link.click()
      URL.revokeObjectURL(link.href)

    } else {
      const win = window.open("", "_blank")
      if (!win) return
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${fileName}</title>
          <style>
            body { font-family: "Noto Sans KR", Arial, sans-serif; font-size: 12px; color: #1a1a2e; padding: 32px; }
            h1 { font-size: 16px; color: #003DA5; margin-bottom: 4px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #003DA5; color: white; padding: 8px 12px; text-align: right; font-size: 11px; }
            th:first-child { text-align: left; }
            td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; font-size: 11px; text-align: right; }
            td:first-child { text-align: left; font-weight: 500; }
            tfoot td { font-weight: bold; background: #f3f4f6; border-top: 2px solid #003DA5; }
            .pos { color: #16a34a; } .neg { color: #dc2626; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>VNB 예측집계 보고서</h1>
          <p class="meta">${year}년 ${quarter} · ${unit} · 보종: ${selectedProds.join(", ")}</p>
          <table>
            <thead>
              <tr><th style="text-align:left">구분</th><th>예측 모델 (억)</th><th>결산 DB (억)</th><th>차이 (억)</th><th>MAPE (%)</th></tr>
            </thead>
            <tbody>
              ${tableRows.map(r => `
                <tr>
                  <td>${r.unit}</td>
                  <td>${r.forecast}</td>
                  <td>${r.settlement}</td>
                  <td class="${r.diff >= 0 ? "pos" : "neg"}">${r.diff > 0 ? "+" : ""}${r.diff}</td>
                  <td>${r.mape}%</td>
                </tr>`).join("")}
            </tbody>
            <tfoot>
              <tr>
                <td>합계</td>
                <td>${totalFcst}</td>
                <td>${totalSettl}</td>
                <td class="${totalFcst - totalSettl >= 0 ? "pos" : "neg"}">${totalFcst - totalSettl > 0 ? "+" : ""}${totalFcst - totalSettl}</td>
                <td>${(Math.abs(totalFcst - totalSettl) / totalSettl * 100).toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </body></html>`)
      win.document.close()
      win.focus()
      setTimeout(() => { win.print() }, 400)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-5 p-6">

        {/* 섹션 1: 출력 설정 */}
        <Card className="p-5 bg-card border-border">
          <SecHead num={1} title="출력 설정" desc="출력 기간, 집계 단위, 보종 범위, 파일 형식을 설정합니다." />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* 열 1: 기간 + 집계 단위 + 형식 */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground">기본 설정</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1.5 block">연도</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="bg-secondary border-border text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["2024","2025","2026"].map(y => <SelectItem key={y} value={y}>{y}년</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">분기</Label>
                  <Select value={quarter} onValueChange={setQuarter}>
                    <SelectTrigger className="bg-secondary border-border text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Q1","Q2","Q3","Q4","연간"].map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">집계 단위</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="bg-secondary border-border text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["증번단위","보종단위","상품단위","MIX단위","채널단위"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">출력 형식</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { val: "excel", label: "Excel", sub: ".xlsx" },
                    { val: "pdf",   label: "PDF",   sub: "리포트" },
                  ].map(f => (
                    <button
                      key={f.val}
                      onClick={() => setFormat(f.val)}
                      className={`p-2 rounded-lg border text-center transition-colors ${
                        format === f.val
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <p className="text-xs font-medium">{f.label}</p>
                      <p className="text-[10px]">{f.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 열 2: 보종 필터 */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground">보종 필터</p>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/40">
                  <input
                    type="checkbox"
                    checked={selectedProds.length === PRODUCTS.length}
                    onChange={e => setSelectedProds(e.target.checked ? [...PRODUCTS] : [])}
                    className="accent-primary"
                  />
                  <span className="text-xs font-medium text-foreground">전체 선택</span>
                </label>
                <div className="h-px bg-border" />
                {PRODUCTS.map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/40">
                    <input
                      type="checkbox"
                      checked={selectedProds.includes(p)}
                      onChange={() => toggleProd(p)}
                      className="accent-primary"
                    />
                    <span className="text-xs text-foreground">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 열 3: 포함 항목 + Excel 시트 안내 */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground">포함 항목</p>
              <div className="space-y-1.5">
                {[
                  { label: "예측 모델 VNB 집계",     val: inclModel,   set: setInclModel   },
                  { label: "결산 DB 비교 테이블",     val: inclCompare, set: setInclCompare },
                  { label: "VNB 추이 차트",           val: inclChart,   set: setInclChart   },
                  { label: "분기별 트렌드",           val: inclTrend,   set: setInclTrend   },
                  { label: "SHAP 영향도 분석",        val: inclShap,    set: setInclShap    },
                ].map(({ label, val, set }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/40">
                    <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} className="accent-primary" />
                    <span className="text-xs text-foreground">{label}</span>
                  </label>
                ))}
              </div>
              {format === "excel" && (
                <div className="mt-2 p-2.5 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-[10px] font-medium text-foreground mb-1.5">Excel 시트 구성</p>
                  <div className="flex flex-wrap gap-1">
                    {(EXCEL_SHEETS[unit] ?? EXCEL_SHEETS["보종단위"]).map(s => (
                      <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {year}년 {quarter} · {unit} · {selectedProds.length}개 보종 ·{" "}
              {[inclModel && "예측집계", inclCompare && "결산비교", inclChart && "차트", inclTrend && "트렌드", inclShap && "SHAP"]
                .filter(Boolean).join(" + ")}
            </p>
            <Button className="h-8 text-xs px-5" onClick={handleDownload} disabled={selectedProds.length === 0}>
              <Download className="h-3.5 w-3.5 mr-1.5" />파일 생성 및 다운로드
            </Button>
          </div>
        </Card>

        {/* 섹션 2: 미리보기 */}
        <Card className="p-5 bg-card border-border">
          <SecHead num={2} title="결과 미리보기" desc={`${year}년 ${quarter} · ${unit} 기준 예측 모델 결과입니다. 파일 생성 전 데이터를 확인하세요.`} />

          {selectedProds.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-xs border border-dashed border-border rounded-lg">
              보종을 1개 이상 선택해주세요
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left py-2 px-3">구분</th>
                      <th className="text-right py-2 px-3">예측 모델 (억)</th>
                      <th className="text-right py-2 px-3">결산 DB (억)</th>
                      <th className="text-right py-2 px-3">차이 (억)</th>
                      <th className="text-right py-2 px-3">MAPE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map(r => {
                      const diff = r.forecast - r.settlement
                      const mape = (Math.abs(diff) / r.settlement * 100).toFixed(1)
                      return (
                        <tr key={r.unit} className="border-b border-border/50 hover:bg-secondary/40">
                          <td className="py-2.5 px-3 font-medium text-foreground">{r.unit}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-primary">{r.forecast}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{r.settlement}</td>
                          <td className={`py-2.5 px-3 text-right font-mono ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>{diff > 0 ? "+" : ""}{diff}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-foreground">{mape}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border font-semibold">
                      <td className="py-2.5 px-3 text-foreground">합계</td>
                      <td className="py-2.5 px-3 text-right font-mono text-primary">{totalFcst}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{totalSettl}</td>
                      <td className={`py-2.5 px-3 text-right font-mono ${totalFcst - totalSettl >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {totalFcst - totalSettl > 0 ? "+" : ""}{totalFcst - totalSettl}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-foreground">
                        {(Math.abs(totalFcst - totalSettl) / totalSettl * 100).toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </Card>

        {/* 섹션 3: 출력 이력 */}
        <Card className="p-5 bg-card border-border">
          <SecHead num={3} title="출력 이력" desc="이전에 생성된 파일 목록입니다. 재다운로드할 수 있습니다." />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-3">생성일시</th>
                  <th className="text-left py-2 px-3">파일명</th>
                  <th className="text-center py-2 px-3">기간</th>
                  <th className="text-center py-2 px-3">집계 단위</th>
                  <th className="text-center py-2 px-3">형식</th>
                  <th className="text-right py-2 px-3">크기</th>
                  <th className="text-center py-2 px-3">상태</th>
                  <th className="text-center py-2 px-3">다운로드</th>
                </tr>
              </thead>
              <tbody>
                {OUTPUT_HISTORY.map(r => (
                  <tr key={r.date} className="border-b border-border/50 hover:bg-secondary/40">
                    <td className="py-2.5 px-3 font-mono text-muted-foreground text-[11px]">{r.date}</td>
                    <td className="py-2.5 px-3 text-foreground text-[11px] max-w-[200px] truncate">{r.name}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground">{r.quarter}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant="outline" className="text-[10px]">{r.unit}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground">{r.format}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{r.size}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] text-green-600 font-medium">{r.status}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <Download className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  )
}

// ── TAB 7: 시뮬레이션 및 집계 ─────────────────────────────────────────────

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
    { unit: "무배당암보험",   forecast: 212, settlement: 205 },
    { unit: "통합종신보험",   forecast: 98,  settlement: 95  },
    { unit: "변액연금보험",   forecast: 64,  settlement: 67  },
    { unit: "건강든든보험",   forecast: 153, settlement: 149 },
  ],
  "MIX단위": [
    { unit: "GA×암",    forecast: 92,  settlement: 88  },
    { unit: "방카×종신", forecast: 88,  settlement: 86  },
    { unit: "TM×연금",  forecast: 74,  settlement: 72  },
    { unit: "대면×건강", forecast: 88,  settlement: 85  },
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

// 보종별 기준 VNB 및 민감도 계수 (슬라이더 단위당 VNB 변화 억원)
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
  const [aggUnit, setAggUnit]                     = useState("보종단위")
  const [simProduct, setSimProduct]               = useState("암보험")
  const [simAge, setSimAge]                       = useState("40")
  const [simGender, setSimGender]                 = useState("M")
  const [simChannel, setSimChannel]               = useState("GA")
  const [simInsurePeriod, setSimInsurePeriod]     = useState("20")
  const [simPayPeriod, setSimPayPeriod]           = useState("20")
  const [simAmount, setSimAmount]                 = useState("5000")
  const [simResult, setSimResult]                 = useState<{ vnb: number; margin: number; ape: number; mp: string } | null>(null)

  // 변경 영향 분석 states (convRate: 25 = 2.5%×10 정수 저장)
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

  const catCfg  = CHG_BY_CAT[chgCat]
  const coeff   = catCfg.coeff
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

        {/* ── 섹션 1: 집계 조회 ── */}
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

        {/* ── 섹션 2: 가입조건 VNB 시뮬레이션 ── */}
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
                    <ResultBox label="예측 VNB"      value={`${simResult.vnb}억`} accent />
                    <ResultBox label="신계약마진율"  value={`${simResult.margin}%`} />
                    <ResultBox label="환산 APE"      value={`${simResult.ape}만원`} />
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

        {/* ── 섹션 3: 변경 영향 분석 ── */}
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
            {/* 판매MIX */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />판매MIX 변경
              </p>
              <SliderRow label="채널 (GA비중)"  baseText="30%"   value={gaRatio}     onChange={setGaRatio}     min={10}   max={70}   step={1}   unit="%" delta={d.gaRatio} />
              <SliderRow label="성별 (여성비중)" baseText="40%"   value={femaleRatio} onChange={setFemaleRatio} min={20}   max={80}   step={1}   unit="%" delta={d.femaleRatio} />
              <SliderRow label="평균 가입연령"   baseText="42세"  value={avgAge}      onChange={setAvgAge}      min={25}   max={60}   step={1}   unit="세" delta={d.avgAge} />
              <SliderRow label="납기"            baseText="20년"  value={payPeriod}   onChange={setPayPeriod}   min={5}    max={30}   step={5}   unit="년" delta={d.payPeriod} />
              <SliderRow label="가입한도"        baseText="1억"   value={maxLimit}    onChange={setMaxLimit}    min={50}   max={300}  step={10}  unit="백만" delta={d.maxLimit} />
            </div>

            {/* 최소보험료 + 보험료대 + 환산율 */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />최소보험료 변경
              </p>
              <SliderRow label="최소보험료(월)" baseText="3만원" value={minPremium}  onChange={setMinPremium}  min={1}    max={8}    step={1}   unit="만" delta={d.minPremium} />

              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />보험료대 변경
              </p>
              <SliderRow label="평균 가입금액"   baseText="5천만" value={avgAmount}   onChange={setAvgAmount}   min={2000} max={10000} step={500} unit="만" delta={d.avgAmount} />
              <SliderRow label="특약부가율"       baseText="15%"   value={riderRatio}  onChange={setRiderRatio}  min={5}    max={30}   step={1}   unit="%" delta={d.riderRatio} />

              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />환산율 변경
              </p>
              <SliderRow label="환산율 (×0.1%)" baseText="2.5%"  value={convRate}    onChange={setConvRate}    min={10}   max={40}   step={1}   unit="%" delta={d.convRate} />
            </div>
          </div>

          {/* 총 효과 요약 */}
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
