
import { Slide, SlideTitle, SectionHeading, InfoCard, FlowDiagram, Pill, SectionValueBar } from "./proposal-primitives"
import { Database, Save, Layers, History, BarChart3 } from "lucide-react"

export function SectionResultDb() {
  return (
    <Slide id="sec-result-db" sectionLabel="3.2.5.3 예측결과저장 DB" pageLabel="3 / 7">
      <SlideTitle
        eyebrow="3.2.5.3 예측결과 저장 DB 구축"
        title="예측 결과를 표준 형식으로 저장해 다양한 단위 집계와 이력 추적의 기반으로 활용"
        headline="MP(모델포인트) 단위의 예측 결과를 예측 시점·모델 버전·입력 조건과 함께 저장합니다. 저장된 결과는 증번·보종·상품·판매구성·채널 등 원하는 단위로 즉시 집계할 수 있고, 모델 버전별 예측 이력으로 언제든 같은 결과를 다시 만들어 비교할 수 있습니다."
        keyPoints={[
          "예측 결과 표준 형식 저장",
          "원하는 단위로 즉시 집계",
          "버전·시점별 이력 추적",
        ]}
      />

      <div className="grid flex-1 grid-cols-12 gap-4">
        <div className="col-span-6 flex flex-col">
          <SectionHeading icon={<Save className="h-4 w-4" />}>예측 결과 저장 항목 (주요 내용)</SectionHeading>
          <InfoCard className="flex-1">
            <ul className="flex flex-col gap-1.5">
              <li>· <strong className="text-card-foreground">예측 식별 정보</strong> : 예측 묶음 번호 · 모델 이름/버전 · 예측 시점</li>
              <li>· <strong className="text-card-foreground">입력 조건</strong> : MP 키 · 그 시점의 설명변수 값</li>
              <li>· <strong className="text-card-foreground">예측값</strong> : 예측 VNB · 마진율 · 신뢰구간</li>
              <li>· <strong className="text-card-foreground">집계 기준</strong> : 증번 · 보종 · 상품 · 채널 · 판매구성</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-1">
              <Pill tone="muted">같은 결과 재현</Pill>
              <Pill tone="muted">버전 추적</Pill>
              <Pill tone="muted">빠른 집계를 위한 색인</Pill>
            </div>
          </InfoCard>
        </div>

        <div className="col-span-6 flex flex-col gap-3">
          <InfoCard title="바로 집계할 수 있는 구조" accent>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              증번·보종·상품·판매구성·채널 단위로 집계 기준을 미리 갖춰, 대시보드·출력 시 즉시 응답
            </div>
          </InfoCard>
          <InfoCard title="예측 이력 관리">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              모델 버전·상품 개정 시점별 예측 이력 보존 → 변경 분석 및 결산 대비 비교
            </div>
          </InfoCard>
          <InfoCard title="결산 DB와 연계">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              VNB 결산 집계와 같은 가입조건으로 비교할 수 있도록 기준 키를 맞춤
            </div>
          </InfoCard>
        </div>

        <div className="col-span-12">
          <SectionHeading icon={<Database className="h-4 w-4" />}>상세 작업 프로세스 (예측 결과 저장·활용)</SectionHeading>
          <FlowDiagram
            steps={[
              { label: "예측 결과 수신", desc: "모델 호출 결과 수집" },
              { label: "표준 형식 적재", desc: "항목 매핑 · 부가정보 부여" },
              { label: "집계 기준 색인", desc: "증번·보종·판매구성·채널" },
              { label: "이력 버전 관리", desc: "모델·개정 시점 보존" },
              { label: "집계·비교", desc: "결산 DB 대비 분석" },
              { label: "대시보드·출력", desc: "다음 단계에서 활용" },
            ]}
          />
        </div>
      </div>

      <SectionValueBar
        value="집계 기준과 버전 이력을 함께 저장해 어떤 단위로든 즉시 집계하고, 과거 예측을 언제든 다시 만들어 비교할 수 있습니다."
        differentiator="결산 DB와 기준 키를 맞춘 표준 형식으로 설계해, 예측과 실적의 직접 비교·차이 분석을 구조적으로 보장합니다."
      />
    </Slide>
  )
}
