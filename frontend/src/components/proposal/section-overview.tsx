
import { Slide, SlideTitle, SectionHeading, InfoCard, ValueBox, FlowDiagram, Pill } from "./proposal-primitives"
import { AlertTriangle, Target, Sparkles, Database, Brain, BarChart3, Layers } from "lucide-react"

export function SectionOverview() {
  return (
    <Slide id="sec-overview" sectionLabel="3.2.5 VNB Assistant 구축" pageLabel="개요">
      <SlideTitle
        eyebrow="제안 개요"
        title="신계약가치(VNB)를 실시간으로 예측·집계하는 AI 어시스턴트"
        headline="지금은 결산이 끝난 뒤에야 VNB를 확인할 수 있어, 상품 설계와 판매전략에 곧바로 반영하기 어렵습니다. VNB Assistant는 상품을 기획하는 단계에서 즉시 VNB를 예측·집계하도록 바꿉니다. 학습용 DB → 예측용 DB → 예측모델 → 시뮬레이션·집계 → 대시보드·출력으로 이어지는 전 과정을 신한라이프 분석 환경 위에 구축합니다."
        keyPoints={[
          "결산을 기다리지 않고 실시간 VNB 예측",
          "증번·보종 단위 고정밀 모델",
          "원하는 관점으로 자유롭게 집계",
        ]}
      />

      <div className="grid flex-1 grid-cols-12 gap-4">
        {/* Pain points */}
        <div className="col-span-5 flex flex-col gap-3">
          <InfoCard title="현재의 어려움 (Pain Point)" className="flex-1">
            <ul className="flex flex-col gap-2.5">
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <span>
                  <strong className="text-card-foreground">결산에 종속</strong> — VNB가 월·분기 결산 이후에야
                  나오기 때문에 상품 설계·판매전략에 제때 반영할 수 없습니다.
                </span>
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <span>
                  <strong className="text-card-foreground">수작업 엑셀 산출</strong> — 증번·보종·가입조건별로
                  반복 계산해야 해서 시간이 오래 걸리고, 사람의 실수가 생기기 쉽습니다.
                </span>
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <span>
                  <strong className="text-card-foreground">가정 변경 분석의 한계</strong> — 판매 구성·환산율·최소보험료를
                  바꿨을 때 VNB가 어떻게 변하는지 즉시 비교할 방법이 없습니다.
                </span>
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <span>
                  <strong className="text-card-foreground">집계의 경직성</strong> — 채널·판매구성·상품 등 원하는
                  기준으로 즉시 집계하고 비교하기 어렵습니다.
                </span>
              </li>
            </ul>
          </InfoCard>
        </div>

        {/* High level approach + value */}
        <div className="col-span-7 flex flex-col gap-3">
          <InfoCard title="해결 방법 (주요 내용)" accent>
            <div className="flex flex-wrap gap-1.5">
              <Pill tone="primary">학습용 DB</Pill>
              <Pill tone="primary">예측용 MP DB</Pill>
              <Pill tone="primary">예측결과 저장 DB</Pill>
              <Pill tone="primary">증번·보종 예측모델</Pill>
              <Pill tone="primary">시뮬레이션·집계</Pill>
              <Pill tone="primary">대시보드·출력</Pill>
            </div>
            <p className="mt-3">
              검증된 VNB 산출 엑셀 로직으로 대량의 학습 데이터를 만들고, 머신러닝·딥러닝 모델이 가입조건이
              바뀔 때마다 VNB를 실시간으로 예측합니다. 모델은 신한라이프 분석 환경에서 개발하고, 호출
              인터페이스(API)로 어시스턴트 화면과 연결합니다.
            </p>
          </InfoCard>

          <div className="grid grid-cols-3 gap-3">
            <ValueBox label="산출 리드타임" value="결산→실시간" sub="수일 → 수초" />
            <ValueBox label="예측 정확도" value="高정확도" sub="증번·보종 단위 모델" />
            <ValueBox label="집계 유연성" value="N-차원" sub="채널·MIX·상품 등" />
          </div>
        </div>

        {/* end-to-end pipeline */}
        <div className="col-span-12">
          <SectionHeading icon={<Layers className="h-4 w-4" />}>전체 구축 흐름 (6단계 작업 프로세스)</SectionHeading>
          <FlowDiagram
            steps={[
              { label: "학습용 DB", desc: "설명변수 적재 · 엑셀로 학습 데이터 대량 생성", icon: <Database className="h-4 w-4" /> },
              { label: "예측용 DB", desc: "가입가능 범위로 모델포인트 생성", icon: <Database className="h-4 w-4" /> },
              { label: "예측모델", desc: "증번·보종 단위 머신러닝·딥러닝 예측", icon: <Brain className="h-4 w-4" /> },
              { label: "결과저장 DB", desc: "예측결과 저장 · 집계 기반 마련", icon: <Database className="h-4 w-4" /> },
              { label: "시뮬·집계", desc: "조건 변경 분석 · 다차원 집계", icon: <Target className="h-4 w-4" /> },
              { label: "대시보드·출력", desc: "히트맵 시각화 · 파일 출력", icon: <BarChart3 className="h-4 w-4" /> },
            ]}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-md bg-secondary px-4 py-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-xs text-muted-foreground">
          <strong className="text-card-foreground">기대 효과</strong> — 상품 개발 의사결정 속도 향상, 수익성
          중심의 판매전략 수립, 결산 전 사전 리스크 탐지를 통한 가치 기반 경영(VBM) 가속화
        </p>
      </div>
    </Slide>
  )
}
