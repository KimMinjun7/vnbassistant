
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft, FileText } from "lucide-react"
import { SectionOverview } from "./section-overview"
import { SectionWhyUs } from "./section-why-us"
import { SectionStrategy } from "./section-strategy"
import { SectionTrainingDb } from "./section-training-db"
import { SectionPredictionDb } from "./section-prediction-db"
import { SectionResultDb } from "./section-result-db"
import { SectionModelDevA, SectionModelDevB } from "./section-model-dev"
import { SectionSimulation } from "./section-simulation"
import { SectionDashboard } from "./section-dashboard"
import { SectionOutput } from "./section-output"
import { ScreenshotBackup, JourneyMap } from "./proposal-primitives"
import { Database, Layers, Brain, Target, BarChart3, Download } from "lucide-react"

const nav = [
  { id: "sec-overview", label: "개요" },
  { id: "sec-why-us", label: "Why Us" },
  { id: "sec-strategy", label: "추진 전략" },
  { id: "sec-training-db", label: "3.2.5.1 학습용 DB" },
  { id: "backup-training-db", label: "└ 화면" },
  { id: "sec-prediction-db", label: "3.2.5.2 예측용 DB" },
  { id: "sec-result-db", label: "3.2.5.3 예측결과저장 DB" },
  { id: "backup-prediction", label: "└ 화면" },
  { id: "sec-model-dev-a", label: "3.2.5.4 예측모델 개발" },
  { id: "backup-model-dev", label: "└ 화면" },
  { id: "sec-simulation", label: "3.2.5.5 시뮬레이션·집계" },
  { id: "sec-dashboard", label: "3.2.5.6 대시보드" },
  { id: "backup-dashboard", label: "└ 화면" },
  { id: "sec-output", label: "3.2.5.7 출력" },
  { id: "backup-output", label: "└ 화면" },
]

export function ProposalDoc() {
  const [active, setActive] = useState("sec-overview")

  // 인쇄 시 각 슬라이드를 A4 가로 한 페이지에 맞게 자동 축소
  const fitSlidesToPage = useCallback(() => {
    // A4 가로 인쇄 가능 영역(96dpi, @page margin 10mm 기준)에 안전 여백 적용
    const PAGE_W = 1045
    const PAGE_H = 700
    const slides = Array.from(document.querySelectorAll<HTMLElement>(".proposal-slide"))
    slides.forEach((slide) => {
      slide.style.zoom = ""
      // offsetWidth/Height는 zoom의 영향을 받지 않는 레이아웃 박스(테두리 포함) 크기
      const naturalW = slide.offsetWidth
      const naturalH = slide.offsetHeight
      // zoom은 레이아웃 박스까지 균일 축소하므로 빈 공간/오버플로 없이 한 페이지에 맞춰진다.
      let scale = Math.min(PAGE_W / naturalW, PAGE_H / naturalH, 1)
      if (scale < 1) {
        slide.style.zoom = String(scale)
        // zoom 적용 후 텍스트 재배치로 높이가 늘면 한 번 더 보정
        const afterH = slide.offsetHeight
        if (afterH > PAGE_H + 4) {
          scale = scale * (PAGE_H / afterH)
          slide.style.zoom = String(scale)
        }
      }
    })
  }, [])

  const clearSlideFit = useCallback(() => {
    const slides = Array.from(document.querySelectorAll<HTMLElement>(".proposal-slide"))
    slides.forEach((slide) => {
      slide.style.zoom = ""
    })
  }, [])

  // 브라우저 인쇄(Ctrl/Cmd+P 포함) 전후로 자동 fit/복원
  useEffect(() => {
    const before = () => fitSlidesToPage()
    const after = () => clearSlideFit()
    window.addEventListener("beforeprint", before)
    window.addEventListener("afterprint", after)
    return () => {
      window.removeEventListener("beforeprint", before)
      window.removeEventListener("afterprint", after)
    }
  }, [fitSlidesToPage, clearSlideFit])

  const handlePrint = () => {
    fitSlidesToPage()
    // 레이아웃 반영 후 인쇄 (afterprint에서 복원)
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
  }

  const scrollTo = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Top bar (인쇄 시 숨김) */}
      <header className="proposal-no-print sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              플랫폼
            </a>
            <span className="h-4 w-px bg-border" />
            <span className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <FileText className="h-4 w-4 text-primary" />
              VNB Assistant 구축 제안서
            </span>
          </div>
          <Button size="sm" onClick={handlePrint} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Printer className="mr-2 h-4 w-4" />
            인쇄 / PDF 저장
          </Button>
        </div>

        {/* section nav */}
        <nav className="mx-auto flex max-w-[1120px] gap-1 overflow-x-auto px-6 pb-2">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className={`whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                active === n.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Cover */}
      <div className="mx-auto max-w-[1120px] px-6 pt-8">
        <div className="proposal-slide flex min-h-[640px] flex-col justify-between rounded-lg border border-border bg-card p-10 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                상품 AI 다크팩토리 구축사업 · 제안서
              </p>
              <p className="text-sm font-semibold text-card-foreground">한화시스템 컨소시엄</p>
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-card-foreground text-balance">
              3.2.5 VNB Assistant 구축
            </h1>
            <p className="mt-1 text-lg font-medium text-primary">
              신계약가치(VNB)를 실시간으로 예측·집계하는 AI 어시스턴트
            </p>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground text-pretty">
              결산 이후에야 확인하던 VNB를 상품 설계·판매전략 단계에서 즉시 예측·집계하도록 전환합니다.
              아래 6단계 end-to-end 파이프라인 — 학습용 DB 구축부터 예측모델 개발·검증, 시뮬레이션·집계,
              대시보드, 파일 출력까지 — 를 어떻게 구현하는지 본 제안서에서 단계별 Approach와 가치로 제시합니다.
            </p>
          </div>

          {/* End-to-end 여정 한눈에 */}
          <div className="my-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              End-to-End 구현 여정 (How We Build It)
            </p>
            <JourneyMap
              stages={[
                { phase: "3.2.5.1", title: "학습용 DB", output: "설명변수 표준 적재 · 엑셀 산출 엔진화로 대량 학습데이터 생성", icon: <Database className="h-4 w-4" /> },
                { phase: "3.2.5.2~3", title: "예측용·결과저장 DB", output: "가입가능 범위 MP DB 전개 · 예측결과 표준 저장", icon: <Layers className="h-4 w-4" /> },
                { phase: "3.2.5.4", title: "예측모델 개발", output: "증번·보종 모델 선정 · SHAP 검증 · 재학습 운영", icon: <Brain className="h-4 w-4" /> },
                { phase: "3.2.5.5", title: "시뮬레이션·집계", output: "What-if 변경분석 · 다차원 집계", icon: <Target className="h-4 w-4" /> },
                { phase: "3.2.5.6", title: "대시보드", output: "결산 vs 예측 비교 · 수익성 히트맵", icon: <BarChart3 className="h-4 w-4" /> },
                { phase: "3.2.5.7", title: "출력", output: "Excel·PDF·API 파일화 · 거버넌스", icon: <Download className="h-4 w-4" /> },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
            <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
              <div>
                <span className="font-bold text-primary">결산 → 실시간</span>
                <span className="ml-1.5 text-xs text-muted-foreground">VNB 산출 리드타임 단축</span>
              </div>
              <div>
                <span className="font-bold text-primary">증번·보종 단위</span>
                <span className="ml-1.5 text-xs text-muted-foreground">고정밀 예측모델</span>
              </div>
              <div>
                <span className="font-bold text-primary">N-차원 집계</span>
                <span className="ml-1.5 text-xs text-muted-foreground">채널·MIX·상품 자유 분석</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">신한라이프 | Shinhan Life Insurance</p>
          </div>
        </div>
      </div>

      {/* Slides */}
      <main className="mx-auto flex max-w-[1120px] flex-col gap-6 px-6 py-6">
        <SectionOverview />
        <SectionWhyUs />
        <SectionStrategy />

        <SectionTrainingDb />
        <ScreenshotBackup
          id="backup-training-db"
          sectionLabel="3.2.5.1 학습용 DB"
          pageLabel="화면 백업"
          title="VNB Assistant · 학습용 DB 화면"
          caption="설명변수 408개·누적 410만건 학습 데이터, 내부시스템 연계(정기배치/실시간)와 적재 현황을 실제 화면으로 확인합니다."
          src={`${import.meta.env.BASE_URL}proposal-screens/training-db.png`}
          alt="VNB Assistant 학습용 DB 탭 화면 - 설명변수 통계와 DB 적재 현황"
          highlights={[
            "상단 KPI: 설명변수 총계(408개)·학습 데이터(410만건)·연계 시스템(6개)·생성 HW 가동률(78%)",
            "설명변수 DB 적재 현황: VNB결산정보·계약가��속성 등 카테고리별 변수 수·연계 방식·상태",
            "정기배치/실시간 연계 상태를 한 화면에서 모니터링",
          ]}
        />

        <SectionPredictionDb />
        <SectionResultDb />
        <ScreenshotBackup
          id="backup-prediction"
          sectionLabel="3.2.5.2~3 예측용 · 예측결과저장 DB"
          pageLabel="화면 백업"
          title="VNB Assistant · 예측 시뮬레이션(예측용/결과저장 DB) 화면"
          caption="가입조건 입력으로 MP DB를 생성해 실시간 예측하고, 예측 결과를 결과저장 DB(이력)로 적재하는 화면입니다."
          src={`${import.meta.env.BASE_URL}proposal-screens/simulation.png`}
          alt="VNB Assistant 예측 시뮬레이션 탭 - 가입조건 입력과 예측결과 저장 이력"
          highlights={[
            "가입조건 입력(상품·연령·성별·채널·금액)으로 가입가능 범위의 MP DB 자동 생성",
            "예측결과 DB 저장 이력: 예측 ID·MP 건수·예측 VNB·마진율·일시 기록",
            "예측용 DB → 예측모델 → 예측결과저장 DB의 실시간 파이프라인",
          ]}
        />

        <SectionModelDevA />
        <SectionModelDevB />
        <ScreenshotBackup
          id="backup-model-dev"
          sectionLabel="3.2.5.4 예측모델 개발"
          pageLabel="화면 백업"
          title="VNB Assistant · 예측모델 개발 화면"
          caption="증번/보종 단위 예측모델의 알고리즘·정확도(R²)·운영상태·재학습 트리거를 관리하는 화면입니다."
          src={`${import.meta.env.BASE_URL}proposal-screens/model-dev.png`}
          alt="VNB Assistant 예측모델 개발 탭 - 모델 목록과 성능 지표"
          highlights={[
            "상단 KPI: 운영 모델(4개)·평균 정확도(97.6%)·실시간 모니터링·주간 재학습 트리거",
            "증번·보종 단위 모델별 알고리즘(XGBoost/LightGBM/DNN/CatBoost)·정확도·R²·학습일",
            "운영중/재학습중 상태 표시로 모델 거버넌스 가시화",
          ]}
        />

        <SectionSimulation />

        <SectionDashboard />
        <ScreenshotBackup
          id="backup-dashboard"
          sectionLabel="3.2.5.6 대시보드"
          pageLabel="화면 백업"
          title="VNB Assistant · 집계 대시보드 화면"
          caption="보종단위 결산 vs 예측 비교, 채널×보종 히트맵, 변경분석(What-if)을 제공하는 집계 대시보드입니다."
          src={`${import.meta.env.BASE_URL}proposal-screens/dashboard.png`}
          alt="VNB Assistant 집계 대시보드 탭 - 결산 vs 예측 비교 차트와 히트맵"
          highlights={[
            "VNB 결산 vs 예측 비교: 보종단위 막대 차트로 정합성 직관 확인",
            "���요 판매속성별 히트맵: 채널×보종별 VNB(억원)",
            "변경 분석: 판매MIX·최소보험료·보험료대·환산율 변경 영향 시뮬레이션",
          ]}
        />

        <SectionOutput />
        <ScreenshotBackup
          id="backup-output"
          sectionLabel="3.2.5.7 출력"
          pageLabel="화면 백업"
          title="VNB Assistant · 결과 출력 화면"
          caption="집계 단위·출력 형식을 선택해 예측·집계 결과를 파일로 내보내고, 결산 대비 차이·정확도를 미리보기로 확인합니다."
          src={`${import.meta.env.BASE_URL}proposal-screens/output.png`}
          alt="VNB Assistant 결과 출력 탭 - 파일 다운로드 옵션과 출력 미리보기"
          highlights={[
            "집계 단위(보종단위 등)·출력 형식(Excel 등) 선택 후 결과 파일 다운로드",
            "출력 미리보기: 보종별 예측 VNB vs 결산 VNB·차이·정확도",
            "예측 정확도 95% 이상으로 결산 대비 검증 가능",
          ]}
        />
      </main>

      <footer className="proposal-no-print mx-auto max-w-[1120px] px-6 pb-10 text-center text-xs text-muted-foreground">
        상품 AI 다크팩토리 구축사업 제안서 · 3.2.5 VNB Assistant
      </footer>
    </div>
  )
}
