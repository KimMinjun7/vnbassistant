
import { Slide, SlideTitle, SectionHeading, InfoCard, Pill } from "./proposal-primitives"
import { Calculator, BrainCircuit, ShieldCheck, Workflow, Check, X, Minus } from "lucide-react"

/* 딜로이트 차별화 3대 축 */
const pillars = [
  {
    icon: <Calculator className="h-4 w-4" />,
    title: "보험계리 도메인 깊이",
    points: [
      "VNB·PVNBP·APE·최적가정 산출 로직을 계리사가 직접 검증",
      "당사 검증된 VNB 산출 엑셀을 학습 엔진으로 전환 — 라벨 신뢰성 확보",
      "상품 개정·기초율 변경을 반영하는 계리 관점 검증 시나리오",
    ],
  },
  {
    icon: <BrainCircuit className="h-4 w-4" />,
    title: "AI 엔지니어링 구현력",
    points: [
      "증번·보종 단위 모델링 + GBM/DNN 알고리즘 비교·튜닝 역량",
      "SHAP·민감도 기반 설명가능성(XAI)으로 계리·감독 대응",
      "MLOps(레지스트리·드리프트·재학습)로 운영 단계 신뢰성 유지",
    ],
  },
  {
    icon: <Workflow className="h-4 w-4" />,
    title: "End-to-End 통합 수행",
    points: [
      "DB 설계 → 모델 → 시뮬·집계 → 대시보드 → 출력 단일 책임 수행",
      "신한라이프 분석계·결산/계약/상품 시스템 연계 경험",
      "데이터 거버넌스·RBAC·감사 추적까지 운영 이관 고려 설계",
    ],
  },
]

/* 비교 — 딜로이트 vs 일반 AI 벤더 / 계리 컨설팅 단독 */
const compareRows = [
  { cap: "검증된 VNB 산출 로직 보유", d: "full", ai: "none", act: "partial" },
  { cap: "증번·보종 단위 고정밀 모델링", d: "full", ai: "partial", act: "none" },
  { cap: "설명가능성(SHAP)·감독 대응", d: "full", ai: "partial", act: "partial" },
  { cap: "재학습·드리프트 MLOps 운영", d: "full", ai: "partial", act: "none" },
  { cap: "결산 대비 검증·계리 정합성", d: "full", ai: "none", act: "full" },
  { cap: "End-to-End 단일 책임 수행", d: "full", ai: "none", act: "none" },
]

function Mark({ level }: { level: string }) {
  if (level === "full")
    return (
      <span className="flex justify-center">
        <Check className="h-4 w-4 text-primary" strokeWidth={3} />
      </span>
    )
  if (level === "partial")
    return (
      <span className="flex justify-center">
        <Minus className="h-4 w-4 text-muted-foreground" strokeWidth={3} />
      </span>
    )
  return (
    <span className="flex justify-center">
      <X className="h-4 w-4 text-destructive/60" strokeWidth={3} />
    </span>
  )
}

export function SectionWhyDeloitte() {
  return (
    <Slide id="sec-why-deloitte" sectionLabel="3.2.5 Why Deloitte" pageLabel="차별화">
      <SlideTitle
        eyebrow="Why Deloitte · 차별화 포인트"
        title="계리 도메인과 AI 구현력을 모두 갖춘 통합 수행자만이 VNB Assistant를 완성합니다"
        headline="VNB Assistant는 정확한 계리 로직, 고정밀 AI 모델, 그리고 운영 가능한 거버넌스가 동시에 필요합니다. AI 벤더 단독으로는 계리 정합성을, 계리 컨설팅 단독으로는 AI 구현·운영을 충족하기 어렵습니다. 딜로이트는 두 영역을 결합한 단일 책임 수행으로 이를 해결합니다."
      />

      <div className="grid flex-1 grid-cols-12 gap-4">
        {/* 3 pillars */}
        <div className="col-span-7 flex flex-col gap-2.5">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-lg border border-border bg-card p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {p.icon}
                </span>
                <h3 className="text-sm font-bold text-card-foreground">{p.title}</h3>
              </div>
              <ul className="flex flex-col gap-1">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-1.5 text-xs leading-snug text-muted-foreground">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" strokeWidth={3} />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* comparison table */}
        <div className="col-span-5 flex flex-col">
          <SectionHeading icon={<ShieldCheck className="h-4 w-4" />}>수행 역량 비교</SectionHeading>
          <div className="flex-1 overflow-hidden rounded-lg border border-border">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-secondary">
                  <th className="px-2 py-2 text-left font-semibold text-muted-foreground">역량</th>
                  <th className="px-1 py-2 text-center font-bold text-primary">Deloitte</th>
                  <th className="px-1 py-2 text-center font-medium text-muted-foreground">AI 벤더</th>
                  <th className="px-1 py-2 text-center font-medium text-muted-foreground">계리 단독</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((r, i) => (
                  <tr key={r.cap} className={i % 2 === 0 ? "bg-card" : "bg-secondary/40"}>
                    <td className="px-2 py-2 leading-tight text-card-foreground">{r.cap}</td>
                    <td className="px-1 py-2">
                      <Mark level={r.d} />
                    </td>
                    <td className="px-1 py-2">
                      <Mark level={r.ai} />
                    </td>
                    <td className="px-1 py-2">
                      <Mark level={r.act} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 flex items-center justify-end gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-primary" strokeWidth={3} /> 충족
            </span>
            <span className="flex items-center gap-1">
              <Minus className="h-3 w-3" strokeWidth={3} /> 부분
            </span>
            <span className="flex items-center gap-1">
              <X className="h-3 w-3 text-destructive/60" strokeWidth={3} /> 미흡
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <InfoCard accent className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">검증 기준</p>
          <p className="mt-0.5 text-sm font-bold text-primary">결산 대비 정합성</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">계리 검증 + AI 정확도 동시 충족</p>
        </InfoCard>
        <InfoCard accent className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">리스크 절감</p>
          <p className="mt-0.5 text-sm font-bold text-primary">단일 책임 수행</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">벤더 간 책임 경계·연계 리스크 제거</p>
        </InfoCard>
        <InfoCard accent className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">지속 가능성</p>
          <p className="mt-0.5 text-sm font-bold text-primary">운영 이관 고려</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">MLOps·거버넌스로 내재화 지원</p>
        </InfoCard>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-card-foreground">핵심 메시지:</span>
        <Pill tone="primary">정확도</Pill>
        <Pill tone="primary">설명가능성</Pill>
        <Pill tone="primary">운영 거버넌스</Pill>
        <span className="text-xs text-muted-foreground">— 세 가지를 동시에 만족하는 유일한 통합 수행 파트너</span>
      </div>
    </Slide>
  )
}
