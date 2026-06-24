import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Sparkles,
  Database,
  FlaskConical,
  Save,
  Brain,
  Activity,
  BarChart2,
  Download,
  Wand2,
  Calculator,
  Package,
} from "lucide-react"

interface WelcomeScreenProps {
  onNavigate: (dashboardId: string) => void
}

const VNB_STEPS_ROW1 = [
  {
    id: "training-db",
    step: "Step 1",
    title: "학습용 DB",
    description: "설명변수 DB 관리 및 내부 시스템 연계, 학습 데이터 생성",
    icon: Database,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: "prediction-db",
    step: "Step 2",
    title: "예측용 DB",
    description: "MP DB 생성 및 예측 데이터셋 구축, VNB 예측 수행",
    icon: FlaskConical,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
  },
  {
    id: "result-db",
    step: "Step 3",
    title: "예측결과 저장 DB",
    description: "예측 결과 저장 및 집계 관리",
    icon: Save,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  {
    id: "model-dev",
    step: "Step 4",
    title: "예측모델 개발",
    description: "모델 구축, 알고리즘 선정, SHAP 영향도 분석 및 재학습 체계",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
]

const VNB_STEPS_ROW2 = [
  {
    id: "simulation",
    step: "Step 5",
    title: "시뮬레이션 및 집계",
    description: "집계 단위별 VNB 조회, 가입조건 시뮬레이션, 변경 영향 분석",
    icon: Activity,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    id: "vnb-dashboard",
    step: "Step 6",
    title: "대시보드",
    description: "결산 DB vs 예측 모델 트렌드, 히트맵, 조건별 집계 비교",
    icon: BarChart2,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  {
    id: "output",
    step: "Step 7",
    title: "출력",
    description: "분석 결과 보고서 Excel·PDF 출력 및 다운로드",
    icon: Download,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
  },
]

const OTHER_TOOLS = [
  {
    id: "product-builder",
    title: "상품 설계 도구",
    description: "레고 블록 방식의 직관적 상품 구조 설계",
    icon: Wand2,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
  },
  {
    id: "vnb-simulator",
    title: "VNB 시뮬레이터",
    description: "실시간 VNB·보험료·손해율 시나리오 시뮬레이션",
    icon: Calculator,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
  },
  {
    id: "product-analysis-list",
    title: "상품 목록",
    description: "저장된 상품 목록 조회 및 비교 분석",
    icon: Package,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
  },
]

function StepCard({
  step,
  compact = false,
  showArrow = false,
  onNavigate,
}: {
  step: (typeof VNB_STEPS_ROW1)[number]
  compact?: boolean
  showArrow?: boolean
  onNavigate: (id: string) => void
}) {
  return (
    <div className="relative h-full">
      <Card
        className={`h-full flex flex-col border-2 transition-all hover:scale-[1.02] cursor-pointer ${step.bgColor} ${step.borderColor} hover:shadow-lg ${compact ? "p-3" : "p-4"}`}
        onClick={() => onNavigate(step.id)}
      >
        <div className={`flex items-start justify-between ${compact ? "mb-2" : "mb-3"}`}>
          <div className={`p-1.5 rounded-lg ${step.bgColor}`}>
            <step.icon className={`${compact ? "h-4 w-4" : "h-5 w-5"} ${step.color}`} />
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${step.color} ${step.bgColor}`}>
            {step.step}
          </span>
        </div>
        <h3 className={`font-semibold text-foreground ${compact ? "text-xs mb-0.5" : "text-sm mb-1"}`}>{step.title}</h3>
        <p className={`flex-1 text-muted-foreground leading-relaxed ${compact ? "text-[11px] mb-2" : "text-xs mb-3"}`}>{step.description}</p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between group hover:bg-transparent p-0 h-auto mt-auto"
          onClick={(e) => { e.stopPropagation(); onNavigate(step.id) }}
        >
          <span className="text-xs">열기</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Card>
      {showArrow && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10">
          <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
        </div>
      )}
    </div>
  )
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-start p-8 bg-background overflow-auto">
      <div className="max-w-5xl w-full space-y-8">

        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">VNB Assistant</h1>
          </div>
          <p className="text-xl text-muted-foreground">VNB 예측·시뮬레이션·집계 플랫폼</p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            학습 데이터 구축부터 예측모델 개발·시뮬레이션·대시보드·출력까지 End-to-End 자동화
          </p>
        </div>

        {/* VNB Assistant Workflow */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">VNB Assistant 워크플로우</h2>
          </div>

          {/* Row 1: Steps 1-4, compact */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            {VNB_STEPS_ROW1.map((step, idx) => (
              <StepCard
                key={step.id}
                step={step}
                compact
                showArrow={idx < VNB_STEPS_ROW1.length - 1}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {/* Row 2: Steps 5-7 */}
          <div className="grid grid-cols-3 gap-3">
            {VNB_STEPS_ROW2.map((step, idx) => (
              <StepCard
                key={step.id}
                step={step}
                showArrow={idx < VNB_STEPS_ROW2.length - 1}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        {/* Other Tools */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">기타 도구</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {OTHER_TOOLS.map((tool) => (
              <Card
                key={tool.id}
                className={`p-4 border-2 transition-all hover:scale-[1.02] cursor-pointer ${tool.bgColor} ${tool.borderColor} hover:shadow-lg`}
                onClick={() => onNavigate(tool.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${tool.bgColor}`}>
                    <tool.icon className={`h-5 w-5 ${tool.color}`} />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{tool.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{tool.description}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between group hover:bg-transparent p-0 h-auto"
                  onClick={(e) => { e.stopPropagation(); onNavigate(tool.id) }}
                >
                  <span className="text-xs">열기</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-card border-border text-center">
            <div className="text-2xl font-bold text-primary mb-1">7단계</div>
            <div className="text-xs text-muted-foreground">자동화 파이프라인</div>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <div className="text-2xl font-bold text-primary mb-1">95%</div>
            <div className="text-xs text-muted-foreground">자동화율</div>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <div className="text-2xl font-bold text-primary mb-1">실시간</div>
            <div className="text-xs text-muted-foreground">VNB 예측</div>
          </Card>
        </div>

        <div className="text-center pb-4">
          <p className="text-xs text-muted-foreground">
            왼쪽 사이드바에서 항목을 선택하거나 위 카드를 클릭하여 시작하세요
          </p>
        </div>
      </div>
    </div>
  )
}
