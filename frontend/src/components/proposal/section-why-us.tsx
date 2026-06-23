
import { Slide, SlideTitle, SectionHeading, DiffCard, ValueBox } from "./proposal-primitives"
import { Zap, GitPullRequest, Layers, ShieldCheck, Boxes, Users } from "lucide-react"

export function SectionWhyUs() {
  return (
    <Slide id="sec-why-us" sectionLabel="Why Us" pageLabel="차별점">
      <SlideTitle
        eyebrow="Why Us · 컨소시엄의 차별적 가치"
        title="보험상품 플랫폼과 AI·모델링 전문가가 한 팀으로 — 가장 빠르고 정확하게 구축합니다"
        headline="VNB Assistant는 단순한 룰 엔진(BRMS) 손질이 아니라, 계리 로직 이해 · AI 모델링 · 실시간 화면 검증이 함께 맞물려야 성공합니다. 본 컨소시엄은 보험상품 플랫폼 역량을 보유한 한화시스템과 AI·데이터 모델링 전문 인력이 한 팀으로 협업하여, 전통 SI/룰 엔진 사업자와는 다른 속도와 정밀도로 솔루션을 완성합니다."
        keyPoints={[
          "프로토타입으로 빠른 합의",
          "보험 플랫폼 기반 구축",
          "AI 전문가 직접 투입",
        ]}
      />

      <div className="grid flex-1 grid-cols-12 gap-4">
        {/* 6 differentiators */}
        <div className="col-span-8 grid grid-cols-2 gap-3">
          <DiffCard icon={<Zap className="h-4 w-4" />} title="작동하는 프로토타입으로 검증">
            문서·화면 정의서가 아니라 실제 동작하는 화면(본 프로토타입)으로 요구사항을 확정합니다. 고객이 직접
            보고 만지며 의견을 주므로, 착수 전에 이미 &ldquo;무엇을 만들지&rdquo;가 합의됩니다.
          </DiffCard>
          <DiffCard icon={<GitPullRequest className="h-4 w-4" />} title="고객 요구 즉시 반영·빠른 반복">
            요구가 바뀌면 화면을 바로 수정해 다음 회의에서 곧장 확인합니다. 긴 변경관리 절차에 묶이는 전통 SI 방식과
            달리, 짧은 반복 주기로 재작업과 위험을 최소화합니다.
          </DiffCard>
          <DiffCard icon={<Boxes className="h-4 w-4" />} title="검증된 보험상품 플랫폼 기반">
            한화시스템이 보유한 보험상품 플랫폼·업무 자산을 기반으로 구축해, 상품·기초율·인수기준 구조를 처음부터
            다시 만들지 않습니다. 이미 검증된 토대 위에서 시작해 구축 기간을 단축합니다.
          </DiffCard>
          <DiffCard icon={<Users className="h-4 w-4" />} title="AI·모델링 전문가의 직접 투입">
            룰 엔진(BRMS) 손질에 머무는 사업자와 달리, 데이터분석·예측모델 전문 인력이 직접 모델을 설계·검증
            합니다. VNB 예측의 정확도와 설명력을 근본적으로 끌어올립니다.
          </DiffCard>
          <DiffCard icon={<Layers className="h-4 w-4" />} title="처음부터 끝까지 한 팀이 책임">
            DB 설계 → 데이터 생성 → 모델 → 시뮬레이션 → 대시보드 → 출력까지 컨소시엄이 한 팀으로 책임집니다. 단계 사이
            연결이 끊기지 않는 일관된 구조로 통합 위험을 없앱니다.
          </DiffCard>
          <DiffCard icon={<ShieldCheck className="h-4 w-4" />} title="검증 가능한 모델 운영 체계">
            변수 기여도 분석 · 실적 비교 검증 · 시나리오 검증 · 성능 모니터링을 표준 절차로 제공하고, 재학습·운영·교육까지
            지원하여 신한라이프가 스스로 운영할 수 있게 합니다.
          </DiffCard>
        </div>

        {/* expected value column */}
        <div className="col-span-4 flex flex-col gap-3">
          <SectionHeading>제안 기대 효과</SectionHeading>
          <ValueBox label="요구사항 확정 속도" value="프로토타입 선검증" sub="착수 전 화면 합의" />
          <ValueBox label="VNB 산출 리드타임" value="수일 → 수초" sub="결산 종속 → 실시간" />
          <ValueBox label="예측 신뢰성" value="결산 대비 검증" sub="백테스트·정합성 확보" />
          <div className="rounded-lg border border-border bg-secondary p-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-card-foreground">한 줄 요약</strong> — 보험 플랫폼 + AI 전문가가 한 팀으로,
              프로토타입으로 빠르게 합의하고 정확하게 구축하는 컨소시엄.
            </p>
          </div>
        </div>
      </div>
    </Slide>
  )
}
