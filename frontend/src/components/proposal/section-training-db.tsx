
import { Slide, SlideTitle, SectionHeading, InfoCard, FlowDiagram, Pill, SectionValueBar } from "./proposal-primitives"
import { Database, GitBranch, FileSpreadsheet, Server, RefreshCw, Layers } from "lucide-react"

const explanatoryVars = [
  { group: "VNB 결산정보", items: ["기준 VNB", "마진율", "PVNBP", "신계약비"] },
  { group: "계약가입속성", items: ["채널", "성별·연령", "보험기간·납입기간", "가입금액"] },
  { group: "상품정보", items: ["보종·증번", "특약 부가율", "상품군", "개정 이력"] },
  { group: "환산", items: ["환산율", "환산보험료", "APE"] },
  { group: "최적가정", items: ["위험률", "이율(할인율)", "사업비율", "해지율"] },
  { group: "최소보험료", items: ["최소보험료 기준", "가입한도", "인수기준"] },
]

export function SectionTrainingDb() {
  return (
    <Slide id="sec-training-db" sectionLabel="3.2.5.1 학습용 DB" pageLabel="1 / 7">
      <SlideTitle
        eyebrow="3.2.5.1 학습용 DB 구축"
        title="설명변수를 표준화해 적재하고, 검증된 VNB 산출 엑셀로 학습 데이터를 대량 생성"
        headline="모델 학습에 필요한 모든 설명변수를 도메인(분야)별로 표준화해 적재·관리하고, 결산·계약·상품 시스템과 정기적으로(또는 실시간으로) 연계합니다. 이미 검증된 VNB 산출 엑셀 로직을 자동 계산 엔진으로 바꿔 가입 가능한 조합을 펼치고, 정답값(VNB 라벨)이 붙은 대규모 학습 데이터를 만듭니다."
        keyPoints={[
          "설명변수 표준화 적재",
          "산출 엑셀을 계산 엔진으로 전환",
          "정답값이 붙은 대량 학습 데이터",
        ]}
      />

      <div className="grid flex-1 grid-cols-12 gap-4">
        {/* 설명변수 DB */}
        <div className="col-span-7 flex flex-col">
          <SectionHeading icon={<Database className="h-4 w-4" />}>설명변수 DB 적재·관리</SectionHeading>
          <div className="grid grid-cols-3 gap-2">
            {explanatoryVars.map((v) => (
              <div key={v.group} className="rounded-lg border border-border bg-card p-2.5">
                <p className="mb-1.5 text-xs font-bold text-primary">{v.group}</p>
                <ul className="flex flex-col gap-1">
                  {v.items.map((it) => (
                    <li key={it} className="text-[11px] leading-tight text-muted-foreground">
                      · {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <InfoCard className="mt-3" title="기준 정보의 버전·기간 관리">
            기초율·환산율·산출로직을 <strong className="text-card-foreground">버전과 유효기간(언제부터 언제까지 적용되는지)</strong>
            으로 관리하여, 과거 시점의 값을 그대로 재현하고 상품 개정 이력을 추적할 수 있습니다. 모든 기준 정보는 코드 표준에 맞춰 정리합니다.
          </InfoCard>
        </div>

        {/* 연계 + 생성 */}
        <div className="col-span-5 flex flex-col gap-3">
          <div>
            <SectionHeading icon={<GitBranch className="h-4 w-4" />}>내부 시스템 연계</SectionHeading>
            <InfoCard>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-card-foreground">
                    <RefreshCw className="h-3.5 w-3.5 text-primary" /> 정기 연계
                  </span>
                  <span className="text-xs">결산·계약 마감 주기에 맞춰 동기화</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-card-foreground">
                    <Server className="h-3.5 w-3.5 text-primary" /> 실시간 연계
                  </span>
                  <span className="text-xs">변경 내용을 즉시 반영(API)</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Pill tone="muted">결산시스템</Pill>
                  <Pill tone="muted">계약시스템</Pill>
                  <Pill tone="muted">상품시스템</Pill>
                </div>
              </div>
            </InfoCard>
          </div>

          <div>
            <SectionHeading icon={<FileSpreadsheet className="h-4 w-4" />}>학습 데이터 대량 생성</SectionHeading>
            <InfoCard accent>
              검증된 <strong className="text-card-foreground">VNB 산출 엑셀</strong>을 자동 계산 엔진으로 바꿔
              가입 가능한 조합을 펼치고 각 조합의 VNB(정답값)를 계산합니다. 대량 계산을 위해{" "}
              <strong className="text-card-foreground">분산·병렬 처리가 가능한 계산용 서버(HW)</strong> 확보를
              전제로 설계합니다.
              <div className="mt-2 flex flex-wrap gap-1">
                <Pill tone="primary">조합 펼치기</Pill>
                <Pill tone="primary">병렬 계산</Pill>
                <Pill tone="primary">정답값 부여</Pill>
              </div>
            </InfoCard>
          </div>
        </div>

        {/* 적재 파이프라인 */}
        <div className="col-span-12">
          <SectionHeading icon={<Layers className="h-4 w-4" />}>상세 작업 프로세스 (학습용 DB 구축)</SectionHeading>
          <FlowDiagram
            steps={[
              { label: "원천 수집", desc: "결산·계약·상품 시스템 연계 적재" },
              { label: "표준화·정리", desc: "코드 정의 · 변수 표준화 · 결측 처리" },
              { label: "엑셀 계산 엔진화", desc: "VNB 산출 로직 코드화" },
              { label: "조합 펼치기·대량 계산", desc: "가입가능 조합 × 병렬 계산" },
              { label: "정답값·품질 검증", desc: "VNB 라벨 · 이상치/정합성 확인" },
              { label: "학습용 DB 적재", desc: "버전·기간 관리 · 변수 저장소" },
            ]}
          />
        </div>
      </div>

      <SectionValueBar
        value="검증된 산출 로직으로 만든 대규모·고품질 학습 데이터로 예측모델의 정확도 한계를 끌어올립니다."
        differentiator="한화시스템 보험상품 플랫폼의 검증된 상품·기초율 구조 위에서 산출 로직을 엔진화하므로, 단순 복제가 아니라 정합한 학습 데이터를 빠르게 확보합니다."
      />
    </Slide>
  )
}
