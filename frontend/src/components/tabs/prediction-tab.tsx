import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database, FlaskConical, CheckCircle2, Clock, Play } from "lucide-react"
import { SecHead, StatCard, ResultBox } from "@/components/vnb-shared"

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
