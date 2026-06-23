
import { Slide, SlideTitle, SectionHeading, InfoCard, FlowDiagram, Pill, ValueBox, SectionValueBar } from "./proposal-primitives"
import { Brain, Cpu, GitBranch, Target, Activity, BarChart3, RefreshCw, ShieldCheck, Layers } from "lucide-react"

/* 3.2.5.4 - (1) 모델 개발 접근 & End-to-End */
export function SectionModelDevA() {
  return (
    <Slide id="sec-model-dev-a" sectionLabel="3.2.5.4 예측모델 개발 (1/2)" pageLabel="4 / 7">
      <SlideTitle
        eyebrow="3.2.5.4 예측모델 개발 (1/2) · 개발 접근"
        title="증번·보종 단위 고정밀 예측모델을 분석 환경에서 개발하고 다시 재현 가능하게 운영"
        headline="학습용 데이터로 증번·보종 단위 예측모델을 만들어, 가입조건이 바뀔 때마다 VNB를 즉시 예측합니다. 여러 머신러닝·딥러닝 알고리즘을 비교해 가장 정확한 모델을 고르고, 신한라이프 분석 환경에서 개발한 뒤 호출 인터페이스(API)로 서비스화합니다."
        keyPoints={[
          "증번·보종 단위 모델",
          "여러 알고리즘 비교·선정",
          "분석 환경 개발 후 API 서비스화",
        ]}
      />

      <div className="grid flex-1 grid-cols-12 gap-4">
        <div className="col-span-4 flex flex-col gap-3">
          <InfoCard title="모델 단위 & 입력값" accent>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <strong className="text-card-foreground">증번 · 보종 단위</strong> 모델
            </div>
            <p className="mt-1.5">조건이 바뀌면 즉시 반응하는 예측 — 채널·연령·보험기간·납입기간·가입금액·환산율 등</p>
          </InfoCard>
          <InfoCard title="알고리즘 비교·선정">
            <div className="flex flex-wrap gap-1">
              <Pill tone="muted">트리 기반(XGBoost·LightGBM)</Pill>
              <Pill tone="muted">심층신경망(DNN)</Pill>
              <Pill tone="muted">표 데이터 특화(TabNet)</Pill>
              <Pill tone="muted">결합 모델(Ensemble)</Pill>
            </div>
            <p className="mt-2">정확도·안정성·예측 속도를 기준으로 보종별 최적 알고리즘 선정</p>
          </InfoCard>
        </div>

        <div className="col-span-4 flex flex-col gap-3">
          <InfoCard title="언제든 같은 결과 재현">
            <ul className="flex flex-col gap-1">
              <li>· 입력 변수·전처리 과정</li>
              <li>· 학습 방식·세부 설정값</li>
              <li>· 난수 시드·데이터 버전·모델 파일</li>
            </ul>
            <p className="mt-1.5 text-xs">→ 모델 이력 관리·실험 기록으로 완전히 동일하게 재현</p>
          </InfoCard>
          <InfoCard title="정확도를 높이는 파생변수">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              마진이 민감한 구간·변수 간 상호작용·구간 나누기 등 파생변수를 만들어 정확도 향상
            </div>
          </InfoCard>
        </div>

        <div className="col-span-4 flex flex-col gap-3">
          <ValueBox label="목표 정확도" value="高정확도" sub="실무 활용 가능 수준" />
          <InfoCard title="분석 환경 개발 & 서비스화">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              신한라이프 분석 환경에서 학습 · GPU 자원 활용
            </div>
            <p className="mt-1.5">호출 인터페이스(API)를 만들어 어시스턴트 화면·시뮬레이션과 연결</p>
          </InfoCard>
        </div>

        <div className="col-span-12">
          <SectionHeading icon={<Brain className="h-4 w-4" />}>상세 작업 프로세스 (모델 개발)</SectionHeading>
          <FlowDiagram
            steps={[
              { label: "데이터 준비", desc: "학습 DB · 변수 가공", icon: <Layers className="h-4 w-4" /> },
              { label: "파생변수 도출", desc: "정확도 높이는 변수 생성", icon: <GitBranch className="h-4 w-4" /> },
              { label: "알고리즘 탐색", desc: "머신러닝·딥러닝 비교·조정", icon: <Cpu className="h-4 w-4" /> },
              { label: "학습·검증", desc: "교차검증 · 보종별 모델", icon: <Target className="h-4 w-4" /> },
              { label: "영향도 분석", desc: "변수 기여도 · 민감도", icon: <Activity className="h-4 w-4" /> },
              { label: "등록·서비스화", desc: "모델 등록 · 호출 API", icon: <BarChart3 className="h-4 w-4" /> },
            ]}
          />
        </div>
      </div>
    </Slide>
  )
}

/* 3.2.5.4 - (2) 검증·영향도·운영 체계 */
export function SectionModelDevB() {
  return (
    <Slide id="sec-model-dev-b" sectionLabel="3.2.5.4 예측모델 개발 (2/2)" pageLabel="4 / 7">
      <SlideTitle
        eyebrow="3.2.5.4 예측모델 개발 (2/2) · 검증·운영"
        title="영향도 분석·시나리오 검증·재학습·성능 모니터링으로 모델 신뢰성을 유지"
        headline="어떤 변수가 VNB에 얼마나 영향을 주는지 정량적으로 보여주고, 여러 상황을 가정해 모델을 검증합니다. 성능이 떨어지면 다시 학습하는 절차와 주기적인 성능 점검 체계를 갖추며, 상품이 개정될 때도 정확도가 유지되도록 학습·검증 전략을 제시합니다."
        keyPoints={[
          "변수 영향도 정량 제공(설명가능)",
          "다양한 시나리오로 검증",
          "자동 재학습·성능 모니터링",
        ]}
      />

      <div className="grid flex-1 grid-cols-12 gap-4">
        <div className="col-span-6 flex flex-col gap-3">
          <div>
            <SectionHeading icon={<Activity className="h-4 w-4" />}>영향도 분석 (설명가능성)</SectionHeading>
            <InfoCard accent>
              <strong className="text-card-foreground">변수 기여도 분석(SHAP)</strong>과{" "}
              <strong className="text-card-foreground">민감도 분석</strong>으로 어떤 조건 변화가 VNB에 얼마나
              영향을 주는지 수치로 보여줍니다 → 모델이 왜 그렇게 예측했는지 설명 가능
            </InfoCard>
          </div>
          <div>
            <SectionHeading icon={<ShieldCheck className="h-4 w-4" />}>시나리오별 검증 전략</SectionHeading>
            <InfoCard>
              <div className="flex flex-wrap gap-1">
                <Pill tone="muted">정상·극단 상황</Pill>
                <Pill tone="muted">보종·채널별 나눠 검증</Pill>
                <Pill tone="muted">학습에 없던 미래 시점 검증</Pill>
                <Pill tone="muted">과거 결산 실적과 비교 검증</Pill>
              </div>
            </InfoCard>
          </div>
          <div>
            <SectionHeading icon={<BarChart3 className="h-4 w-4" />}>평가 지표</SectionHeading>
            <div className="grid grid-cols-4 gap-2">
              {["RMSE", "MAPE", "R²", "PSI"].map((m) => (
                <div key={m} className="rounded-md border border-border bg-secondary p-2 text-center">
                  <p className="text-sm font-bold text-card-foreground">{m}</p>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
              오차 크기(RMSE·MAPE) · 설명력(R²) · 데이터 변화 정도(PSI)를 함께 확인
            </p>
          </div>
        </div>

        <div className="col-span-6 flex flex-col gap-3">
          <div>
            <SectionHeading icon={<RefreshCw className="h-4 w-4" />}>재학습 시점 & 절차</SectionHeading>
            <InfoCard accent>
              <ul className="flex flex-col gap-1">
                <li>· <strong className="text-card-foreground">정기 재학습</strong> : 월·분기 등 정해진 주기마다</li>
                <li>· <strong className="text-card-foreground">조건 재학습</strong> : 성능 저하·데이터 변화(PSI)가 기준을 넘을 때</li>
                <li>· <strong className="text-card-foreground">이벤트 재학습</strong> : 상품 개정·기초율 변경 시</li>
              </ul>
            </InfoCard>
          </div>
          <div>
            <SectionHeading icon={<Activity className="h-4 w-4" />}>성능·안정성 모니터링</SectionHeading>
            <InfoCard>
              예측 성능·안정성 지표(RMSE/MAPE/PSI)를 주기적으로 점검하고, 기준을 벗어나면 알림·재학습으로 연결
            </InfoCard>
          </div>
          <div>
            <SectionHeading icon={<GitBranch className="h-4 w-4" />}>상품 개정 대응</SectionHeading>
            <InfoCard>
              개정 전후 데이터 분리·가중, 신·구 상품 연결, 개정에 영향받는 변수 식별을 통한 학습·검증 전략 제시
            </InfoCard>
          </div>
        </div>

        <div className="col-span-12">
          <SectionHeading icon={<RefreshCw className="h-4 w-4" />}>상세 작업 프로세스 (검증·운영)</SectionHeading>
          <FlowDiagram
            steps={[
              { label: "모니터링", desc: "성능·데이터 변화 상시 점검" },
              { label: "재학습 시점 감지", desc: "정기·조건·이벤트" },
              { label: "재학습", desc: "분석 환경 자동 학습" },
              { label: "검증·승인", desc: "시나리오 검증 · 승인 단계" },
              { label: "배포", desc: "버전 교체 · 되돌리기 대비" },
            ]}
          />
        </div>
      </div>

      <SectionValueBar
        value="설명 가능한 고정밀 모델과 자동 재학습·모니터링으로, 상품이 개정되어도 정확도가 유지되는 지속 운영 체계를 갖춥니다."
        differentiator="AI·모델링 전문 인력이 모델을 직접 설계·검증하므로, 룰 엔진 손질에 머무는 방식과 달리 변수 기여도 분석·실적 비교 검증·데이터 변화 관리까지 표준화합니다."
      />
    </Slide>
  )
}
