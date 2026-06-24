import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Database, Layers, Network, CheckCircle2, RefreshCw, Zap, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { SecHead, StatCard, chartStyle } from "@/components/vnb-shared"

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
                    <div className="bg-primary" style={{ width: `${r.train}%` }} />
                    <div className="bg-primary/40" style={{ width: `${r.val}%` }} />
                    <div className="bg-muted-foreground/30" style={{ width: `${r.test}%` }} />
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
