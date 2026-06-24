import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Brain, Target, Activity, GitBranch, CheckCircle2, RefreshCw, Info } from "lucide-react"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from "recharts"
import { SecHead, StatCard, TriggerRow, KvRow, chartStyle } from "@/components/vnb-shared"

const modelList = [
  { id: "M-CANCER-001",  name: "암보험 예측모델",   algo: "XGBoost",        mape: 1.8, r2: 0.987, status: "운영중",  lastTrained: "2026-06-01" },
  { id: "M-WHOLE-002",   name: "종신보험 예측모델", algo: "LightGBM",       mape: 2.1, r2: 0.972, status: "운영중",  lastTrained: "2026-05-28" },
  { id: "M-PENSION-003", name: "연금보험 예측모델", algo: "Deep Neural Net", mape: 2.6, r2: 0.965, status: "재학습중", lastTrained: "2026-05-15" },
  { id: "M-HEALTH-004",  name: "건강보험 예측모델", algo: "CatBoost",        mape: 1.9, r2: 0.981, status: "운영중",  lastTrained: "2026-06-03" },
]

const revisionHistory = [
  { product: "암보험 (AM-2401)",   date: "2024-01-15", type: "요율개정", impact: "위험률 3.2% 변경",   status: "재학습완료" },
  { product: "종신보험 (WL-2312)", date: "2023-12-01", type: "상품개정", impact: "특약 추가 (2종)",     status: "재학습완료" },
  { product: "연금보험 (AN-2308)", date: "2023-08-20", type: "이율변경", impact: "예정이율 0.25% 하향", status: "재학습완료" },
]

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
                            정확도 <Info className="h-3 w-3 text-muted-foreground/60" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">(1 - MAPE) × 100</TooltipContent>
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
