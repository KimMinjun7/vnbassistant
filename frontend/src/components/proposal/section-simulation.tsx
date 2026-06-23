
import { Slide, SlideTitle, SectionHeading, InfoCard, FlowDiagram, Pill, SectionValueBar } from "./proposal-primitives"
import { Layers, SlidersHorizontal, GitCompareArrows, Play, Target } from "lucide-react"

const aggregationUnits = ["증번 단위", "보종 단위", "상품 단위", "MIX 단위", "채널 단위"]

const changeAnalysis = [
  { title: "판매 구성 변경", items: ["채널", "성별·연령", "보험기간·납입기간", "가입한도"] },
  { title: "최소보험료 변경", items: ["최소보험료 기준 조정", "인수 한도 변경"] },
  { title: "보험료대 변경", items: ["가입금액 상향", "특약 부가율 상향"] },
  { title: "환산율 변경", items: ["환산율 조정", "APE 영향 반영"] },
]

export function SectionSimulation() {
  return (
    <Slide id="sec-simulation" sectionLabel="3.2.5.5 시뮬레이션 및 집계" pageLabel="5 / 7">
      <SlideTitle
        eyebrow="3.2.5.5 시뮬레이션 및 집계"
        title="원하는 가입조건으로 VNB를 예측하고, 원하는 단위로 즉시 집계·비교"
        headline="사용자가 가입조건을 입력하면 예측모델이 VNB를 곧바로 계산하고, 증번·보종·상품·판매구성·채널 등 원하는 단위로 집계합니다. 판매구성·최소보험료·보험료대·환산율을 바꿨을 때 VNB가 어떻게 달라지는지 '바꾸기 전 vs 바꾼 후'로 비교해 보여줍니다."
        keyPoints={[
          "조건 입력 → VNB 즉시 예측",
          "원하는 단위로 자유롭게 집계",
          "조건 변경 전후 비교(What-if)",
        ]}
      />

      <div className="grid flex-1 grid-cols-12 gap-4">
        <div className="col-span-5 flex flex-col gap-3">
          <div>
            <SectionHeading icon={<Layers className="h-4 w-4" />}>다양한 집계 단위</SectionHeading>
            <InfoCard accent>
              <div className="flex flex-wrap gap-1.5">
                {aggregationUnits.map((u) => (
                  <Pill key={u} tone="primary">
                    {u}
                  </Pill>
                ))}
              </div>
              <p className="mt-2">원하는 관점으로 자유롭게 더 자세히 보거나(상세) 묶어서 보기(요약)</p>
            </InfoCard>
          </div>
          <div>
            <SectionHeading icon={<Play className="h-4 w-4" />}>가입조건 입력 시뮬레이션</SectionHeading>
            <InfoCard>
              채널·성별·연령·보험기간·납입기간·가입금액·특약 등 조건 입력 → 예측모델 호출 → VNB·마진율 즉시 반환
            </InfoCard>
          </div>
        </div>

        <div className="col-span-7 flex flex-col">
          <SectionHeading icon={<GitCompareArrows className="h-4 w-4" />}>조건 변경 분석 (바꾸기 전 vs 바꾼 후)</SectionHeading>
          <div className="grid flex-1 grid-cols-2 gap-2">
            {changeAnalysis.map((c) => (
              <div key={c.title} className="rounded-lg border border-border bg-card p-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-primary">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {c.title}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {c.items.map((it) => (
                    <li key={it} className="text-[11px] leading-tight text-muted-foreground">
                      · {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12">
          <SectionHeading icon={<Target className="h-4 w-4" />}>상세 작업 프로세스 (시뮬레이션·집계)</SectionHeading>
          <FlowDiagram
            steps={[
              { label: "조건 입력", desc: "가입조건 · 변경 시나리오" },
              { label: "MP 펼치기", desc: "조건 기반 모델포인트 생성" },
              { label: "VNB 예측", desc: "모델 호출 · 예측값 산출" },
              { label: "변경 분석", desc: "바꾸기 전 vs 바꾼 후 비교" },
              { label: "다양한 집계", desc: "증번·보종·판매구성·채널" },
              { label: "결과 제공", desc: "대시보드 · 출력 연계" },
            ]}
          />
        </div>
      </div>

      <SectionValueBar
        value="판매구성·환산율·최소보험료를 바꿨을 때 VNB가 어떻게 달라지는지 즉시 비교해, 수익성 중심의 상품·판매전략 수립을 빠르게 돕습니다."
        differentiator="현실에 맞는 변경 시나리오만 펼쳐 다양한 집계와 연결하므로, 실무자가 바로 의사결정에 쓸 수 있는 시뮬레이션을 제공합니다."
      />
    </Slide>
  )
}
