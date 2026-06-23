
import { Slide, SlideTitle, SectionHeading, InfoCard, FlowDiagram, Pill, SectionValueBar } from "./proposal-primitives"
import { Database, Grid3x3, Brain, Filter } from "lucide-react"

export function SectionPredictionDb() {
  return (
    <Slide id="sec-prediction-db" sectionLabel="3.2.5.2 예측용 DB" pageLabel="2 / 7">
      <SlideTitle
        eyebrow="3.2.5.2 예측용 DB 구축"
        title="가입 가능한 범위를 펼쳐 모델포인트(MP) DB를 만들어 예측모델 입력으로 사용"
        headline="기준 정보(상품·기초율·환산율·인수기준)를 바탕으로 가입 가능한 계약 조합을 펼쳐, 예측 대상이 되는 모델포인트(MP, 예측 단위가 되는 계약 묶음) DB를 만듭니다. 신규로 펼친 조합뿐 아니라 과거 결산·계약 정보도 같은 형태로 담을 수 있어, 실적과 예측을 같은 기준으로 비교할 수 있습니다."
        keyPoints={[
          "가입가능 범위로 예측 대상 생성",
          "신규·과거 데이터 동일 구조 관리",
          "유효하지 않은 조합은 사전 제외",
        ]}
      />

      <div className="grid flex-1 grid-cols-12 gap-4">
        <div className="col-span-6 flex flex-col gap-3">
          <div>
            <SectionHeading icon={<Grid3x3 className="h-4 w-4" />}>MP DB 생성 (가입 가능 범위 펼치기)</SectionHeading>
            <InfoCard accent>
              상품의 인수기준·가입한도 범위 안에서 설명변수를 조합해 펼칩니다.
              <div className="mt-2 flex flex-wrap gap-1">
                <Pill tone="primary">채널</Pill>
                <Pill tone="primary">성별·연령</Pill>
                <Pill tone="primary">보험기간·납입기간</Pill>
                <Pill tone="primary">가입금액</Pill>
                <Pill tone="primary">특약 구성</Pill>
              </div>
            </InfoCard>
          </div>
          <InfoCard title="MP DB의 두 가지 출처">
            <ul className="flex flex-col gap-1.5">
              <li>
                <strong className="text-card-foreground">신규 생성</strong> — 가입 가능 범위를 펼쳐 새로 만든 예측 대상
              </li>
              <li>
                <strong className="text-card-foreground">과거 실적</strong> — 결산·계약 시스템에서 가져온 데이터(시점·출처 구분),
                실적 기반 예측과 검증에 활용
              </li>
            </ul>
          </InfoCard>
        </div>

        <div className="col-span-6 flex flex-col">
          <SectionHeading icon={<Filter className="h-4 w-4" />}>유효성 검증 & 예측 호출</SectionHeading>
          <InfoCard className="flex-1">
            펼친 조합 중 인수기준·최소보험료에 맞지 않는 조합은 걸러내고, 실제 예측할 대상만 확정합니다.
            확정된 MP DB는 정해진 시점(배치) 또는 필요할 때(온디맨드) 예측모델 호출 인터페이스로 전달됩니다.
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-md bg-secondary p-2">
                <p className="text-xs text-muted-foreground">펼친 조합</p>
                <p className="text-lg font-bold text-card-foreground">대량</p>
              </div>
              <div className="rounded-md bg-primary/5 p-2">
                <p className="text-xs text-muted-foreground">유효 MP</p>
                <p className="text-lg font-bold text-primary">예측 대상</p>
              </div>
            </div>
          </InfoCard>
        </div>

        <div className="col-span-12">
          <SectionHeading icon={<Brain className="h-4 w-4" />}>상세 작업 프로세스 (예측용 DB)</SectionHeading>
          <FlowDiagram
            steps={[
              { label: "기준 정보 로드", desc: "상품·기초율·환산율·인수기준", icon: <Database className="h-4 w-4" /> },
              { label: "범위 펼치기", desc: "가입 가능 조합 전부 펼침" },
              { label: "유효성 검증", desc: "인수기준·최소보험료 확인" },
              { label: "MP DB 확정", desc: "예측 대상 모델포인트 적재" },
              { label: "모델 호출", desc: "예측모델 인터페이스로 전달" },
              { label: "VNB 예측", desc: "MP별 VNB 예측값 산출" },
            ]}
          />
        </div>
      </div>

      <SectionValueBar
        value="신규 가입 가능 범위와 과거 실적을 같은 구조로 다뤄, 예측과 결산 비교·검증을 하나의 흐름에서 수행합니다."
        differentiator="인수기준·최소보험료 유효성 검증을 계리 규칙에 맞춰 설계해, 현실에 없는 조합을 걸러낸 신뢰도 높은 예측 대상만 남깁니다."
      />
    </Slide>
  )
}
