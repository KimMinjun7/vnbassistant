
import { Slide, SlideTitle, SectionHeading, InfoCard, FlowDiagram, Pill, SectionValueBar } from "./proposal-primitives"
import { LayoutGrid, GitCompareArrows, Grid3x3, Gauge } from "lucide-react"

const channels = ["대면", "TM", "GA", "방카", "디지털"]
const products = ["종신", "정기", "건강", "암", "치아"]

// demo heatmap values (마진율 %)
const heat = [
  [12.4, 9.1, 14.2, 7.8, 18.5],
  [10.2, 8.4, 12.0, 6.5, 16.1],
  [15.8, 11.2, 17.5, 9.3, 21.0],
  [13.1, 9.8, 15.0, 8.0, 19.2],
  [8.5, 6.2, 9.0, 5.1, 11.4],
]

function heatColor(v: number) {
  // map 5~21 to opacity 0.15~1 of primary
  const min = 5
  const max = 21
  const t = Math.max(0, Math.min(1, (v - min) / (max - min)))
  const opacity = 0.15 + t * 0.85
  return `hsl(220 100% 40% / ${opacity})`
}

export function SectionDashboard() {
  return (
    <Slide id="sec-dashboard" sectionLabel="3.2.5.6 대시보드" pageLabel="6 / 7">
      <SlideTitle
        eyebrow="3.2.5.6 대시보드"
        title="어시스턴트 화면에서 예측 결과와 결산 실적을 한눈에 비교·시각화"
        headline="VNB 결산 집계와 같은 가입조건의 예측 집계를 나란히 비교하고, 사용자가 입력한 조건으로 예측·집계한 결과를 시각화합니다. 채널·상품 등 판매속성별 색상표(히트맵)로 수익성이 높은 영역을 한눈에 찾을 수 있습니다."
        keyPoints={[
          "결산 실적 vs 예측 비교",
          "판매속성별 수익성 색상표",
          "조건 입력 → 즉시 시각화",
        ]}
      />

      <div className="grid flex-1 grid-cols-12 gap-4">
        {/* Heatmap */}
        <div className="col-span-7 flex flex-col">
          <SectionHeading icon={<Grid3x3 className="h-4 w-4" />}>판매속성별 색상표 (채널 × 상품, 마진율)</SectionHeading>
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex">
              <div className="w-14 shrink-0" />
              {products.map((p) => (
                <div key={p} className="flex-1 text-center text-[11px] font-medium text-muted-foreground">
                  {p}
                </div>
              ))}
            </div>
            {channels.map((ch, r) => (
              <div key={ch} className="mt-1 flex items-center">
                <div className="w-14 shrink-0 text-[11px] font-medium text-muted-foreground">{ch}</div>
                {products.map((p, c) => (
                  <div key={p} className="flex-1 px-0.5">
                    <div
                      className="flex h-9 items-center justify-center rounded text-[11px] font-semibold"
                      style={{
                        background: heatColor(heat[r][c]),
                        color: heat[r][c] > 13 ? "hsl(0 0% 100%)" : "hsl(222 47% 11%)",
                      }}
                    >
                      {heat[r][c].toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <p className="mt-2 text-[10px] text-muted-foreground">* 색이 진할수록 마진율 높음 — 수익성 높은 영역을 바로 식별</p>
          </div>
        </div>

        {/* Comparison + composition */}
        <div className="col-span-5 flex flex-col gap-3">
          <div>
            <SectionHeading icon={<GitCompareArrows className="h-4 w-4" />}>결산 실적 vs 예측 비교</SectionHeading>
            <InfoCard accent>
              <div className="flex items-center justify-between">
                <span>VNB 결산 집계</span>
                <Pill tone="muted">실적 기준</Pill>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span>VNB Assistant 예측 집계</span>
                <Pill tone="primary">같은 가입조건</Pill>
              </div>
              <p className="mt-2 text-xs">→ 예측이 실적과 얼마나 맞는지 검증하고 차이 원인 분석</p>
            </InfoCard>
          </div>
          <div>
            <SectionHeading icon={<Gauge className="h-4 w-4" />}>대시보드 구성 요소</SectionHeading>
            <InfoCard>
              <div className="flex flex-wrap gap-1">
                <Pill tone="muted">핵심 지표 카드 (VNB·마진율·신계약 환산보험료)</Pill>
                <Pill tone="muted">추이 차트</Pill>
                <Pill tone="muted">속성별 색상표</Pill>
                <Pill tone="muted">조건 입력 패널</Pill>
                <Pill tone="muted">집계 단위 전환</Pill>
              </div>
            </InfoCard>
          </div>
        </div>

        <div className="col-span-12">
          <SectionHeading icon={<LayoutGrid className="h-4 w-4" />}>상세 작업 프로세스 (대시보드)</SectionHeading>
          <FlowDiagram
            steps={[
              { label: "조건 선택", desc: "가입조건 · 집계 단위" },
              { label: "예측·집계 호출", desc: "결과 DB · 모델 연계" },
              { label: "결산 집계 매칭", desc: "같은 조건 결산 집계" },
              { label: "화면 그리기", desc: "지표 카드 · 색상표 · 차트" },
              { label: "상세 탐색", desc: "자세히 보기 · 비교" },
            ]}
          />
        </div>
      </div>

      <SectionValueBar
        value="실적 대비 예측이 잘 맞는지, 채널×상품 중 어디가 수익성이 높은지 한 화면에서 직관적으로 파악해 경영 의사결정을 돕습니다."
        differentiator="같은 가입조건 기준으로 결산 실적과 예측을 비교하도록 기준 키를 맞춰, 믿고 쓸 수 있는 차이 분석을 제공합니다."
      />
    </Slide>
  )
}
