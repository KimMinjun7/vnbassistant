
import { Slide, SlideTitle, SectionHeading } from "./proposal-primitives"
import { MonitorSmartphone, Users, Database, ShieldCheck, Target } from "lucide-react"

type Strategy = {
  no: string
  icon: React.ReactNode
  headline: string
  details: string[]
  tag: string
}

const strategies: Strategy[] = [
  {
    no: "01",
    icon: <MonitorSmartphone className="h-5 w-5" />,
    tag: "속도 · 요구사항 확정",
    headline: "동작하는 UI/UX 프로토타입을 먼저 구축해, 요구사항 확장과 구현 시간을 단축합니다",
    details: [
      "문서·화면 정의서가 아니라 실제 동작하는 UI/UX 프로토타입(본 화면)으로 요구사항을 확정합니다. 고객이 직접 보고 만지며 의견을 주므로 착수 전에 이미 \u201c무엇을 만들지\u201d가 합의됩니다.",
      "요구가 바뀌면 화면을 즉시 수정해 다음 회의에서 곧장 확인합니다. 긴 변경관리 절차에 묶이는 전통 SI 방식과 달리, 짧은 반복 주기로 재작업과 위험을 최소화합니다.",
      "화면으로 합의된 요구사항이 그대로 구현 사양이 되므로, 요구사항 확장·재정의에 드는 시간을 줄이고 본 구축 단계의 속도를 끌어올립니다.",
    ],
  },
  {
    no: "02",
    icon: <Users className="h-5 w-5" />,
    tag: "베스트 컨소시엄",
    headline: "상품 전문 인력과 전문 ML Modeller·계리사 조합으로 최적의 컨소시엄을 구성합니다",
    details: [
      "한화시스템의 보험상품 전문 인력이 검증된 보험상품 플랫폼·업무 자산을 기반으로 구축을 담당합니다. 상품·기초율·인수기준 구조를 처음부터 다시 만들지 않아 구축 기간을 단축합니다.",
      "전문 ML Modeller와 계리사가 한 팀으로 모델을 직접 설계·검증합니다. 룰 엔진(BRMS) 손질에 머무는 사업자와 달리, 계리 로직 이해와 AI 모델링 역량이 결합되어 예측 정확도와 설명력을 근본적으로 끌어올립니다.",
      "플랫폼 구축 역량과 AI·모델링 전문성이 단일 팀으로 협업하여, 가장 빠르고 효율적으로 솔루션을 완성합니다.",
    ],
  },
  {
    no: "03",
    icon: <Database className="h-5 w-5" />,
    tag: "데이터 품질",
    headline: "검증된 계리 산출 로직을 \u2018계산 엔진\u2019으로 자산화해, 모델 정확도의 상한을 높입니다",
    details: [
      "검증된 VNB 산출 엑셀 로직을 자동 계산 엔진으로 전환하고, 가입 가능한 조합을 펼쳐 정답값(VNB 라벨)이 붙은 대규모 학습 데이터를 생성합니다.",
      "일반적인 AI 프로젝트가 겪는 \u201c학습 데이터 품질·양 부족\u201d 문제를 원천 차단하므로, 정합한 데이터로 출발해 예측모델 정확도의 한계선 자체가 높아집니다.",
      "기존 산출 로직을 버리지 않고 재사용·자산화하므로 계리부서의 신뢰를 얻기 쉽고 도입 저항이 낮습니다.",
    ],
  },
  {
    no: "04",
    icon: <ShieldCheck className="h-5 w-5" />,
    tag: "신뢰 · 검증",
    headline: "예측과 결산을 \u2018같은 기준\u2019으로 비교 검증해, 신뢰 기반의 빠른 현업 도입을 보장합니다",
    details: [
      "예측결과 저장 DB를 결산 DB와 동일한 기준 키(증번·보종·상품·채널·판매구성)로 설계해, 같은 가입조건에서 예측값과 실적값을 직접 비교할 수 있습니다.",
      "대시보드에서 결산 실적과 예측을 나란히 보여주고 차이 원인을 분석하므로, 모델이 실제 실적과 얼마나 맞는지 경영진·계리부서가 눈으로 확인하고 검증할 수 있습니다.",
      "버전·시점별 예측 이력을 보존해 과거 예측을 언제든 재현·감사할 수 있어, 금융권 검증 요건에도 부합하고 운영 전환 의사결정을 앞당깁니다.",
    ],
  },
  {
    no: "05",
    icon: <Target className="h-5 w-5" />,
    tag: "활용 · 가치창출",
    headline: "What-if 시뮬레이션으로 VNB를 \u2018사후 확인 지표\u2019에서 \u2018사전 의사결정 도구\u2019로 전환합니다",
    details: [
      "판매구성·환산율·최소보험료·보험료대를 바꿨을 때 VNB가 어떻게 달라지는지 \u2018바꾸기 전 vs 바꾼 후\u2019로 즉시 비교합니다.",
      "결산을 기다려야 알 수 있던 VNB를 상품 기획·판매전략 수립 단계에서 선제적으로 활용해, 수익성 중심 의사결정을 가속합니다.",
      "현실에 맞는(인수기준·최소보험료를 통과한) 시나리오만 전개하므로, 실무자가 바로 의사결정에 쓸 수 있는 신뢰도 높은 시뮬레이션을 제공합니다.",
    ],
  },
]

export function SectionStrategy() {
  return (
    <Slide id="sec-strategy" sectionLabel="추진 전략" pageLabel="Approach">
      <SlideTitle
        eyebrow="추진 전략 · How We Win"
        title="빠르게 합의하고 · 정확하게 구축하며 · 믿을 수 있게 검증하고 · 가치 있게 활용합니다"
        headline="본 컨소시엄은 5가지 추진 전략으로 VNB Assistant를 구축합니다. UI/UX 프로토타입으로 요구사항을 조기에 확정하고, 상품 전문 인력과 전문 ML Modeller·계리사 조합으로 구축하며, 검증된 산출 로직 자산화와 결산 대비 검증, What-if 시뮬레이션으로 데이터 품질부터 가치창출까지 하나의 흐름으로 연결합니다."
        keyPoints={["프로토타입 선검증", "베스트 컨소시엄", "데이터→신뢰→가치"]}
      />

      <div className="grid flex-1 grid-cols-1 gap-3">
        {strategies.map((s) => (
          <div
            key={s.no}
            className="flex gap-4 rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            {/* number + icon */}
            <div className="flex w-16 shrink-0 flex-col items-center gap-2">
              <span className="text-2xl font-bold tabular-nums text-primary/30">{s.no}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {s.icon}
              </span>
            </div>

            {/* content */}
            <div className="flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                  {s.tag}
                </span>
                <h3 className="text-sm font-bold leading-snug text-card-foreground text-pretty">
                  {s.headline}
                </h3>
              </div>
              <ul className="mt-1.5 flex flex-col gap-1">
                {s.details.map((d, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                    <span className="text-pretty">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </Slide>
  )
}
