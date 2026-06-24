
import { useEffect } from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Lightbulb,
  Target,
  Package,
  Trash2,
  Star,
  Edit3,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { useProduct, type ProfitabilityIssue } from "@/contexts/product-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface Scenario {
  name: string
  riskRate: number
  expense: number
  lapseRate: number
  discountRate: number
  vnb: number
  premium: number
  lossRatio: number
  color: string
}

export function VnbSimulator() {
  const { savedProducts, currentProduct, loadProduct, updateProduct } = useProduct()
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  // Initialize to 0 if no product code is linked
  const [riskRate, setRiskRate] = useState([0])
  const [expense, setExpense] = useState([0])
  const [lapseRate, setLapseRate] = useState([0])
  const [discountRate, setDiscountRate] = useState([0])
  const [isCalculating, setIsCalculating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [simulationHistory, setSimulationHistory] = useState<Array<{
    simulationId: string
    productName: string
    productCode: string
    riskRate: number
    expense: number
    lapseRate: number
    discountRate: number
    vnb: number
    marginRate: number
    timestamp: Date
  }>>([])
  const [simulationCounter, setSimulationCounter] = useState(0)
  // Store original base scenario for comparison
  const [originalScenario, setOriginalScenario] = useState<{
    riskRate: number
    expense: number
    lapseRate: number
    discountRate: number
    vnb: number
    marginRate: number
  } | null>(null)

  // Sync input values and simulation history when product is loaded
  useEffect(() => {
    if (currentProduct?.productCode && currentProduct?.vnbSimulationData) {
      const baseScenario = currentProduct.vnbSimulationData.baseScenario
      setRiskRate([baseScenario.riskRate])
      setExpense([baseScenario.expense])
      setLapseRate([baseScenario.lapseRate])
      setDiscountRate([baseScenario.discountRate])
      setShowResults(true)
      // Store original scenario for comparison
      const originalCalc = calculateScenario(baseScenario.riskRate, baseScenario.expense, baseScenario.lapseRate, baseScenario.discountRate)
      setOriginalScenario({
        riskRate: baseScenario.riskRate,
        expense: baseScenario.expense,
        lapseRate: baseScenario.lapseRate,
        discountRate: baseScenario.discountRate,
        vnb: originalCalc.vnb,
        marginRate: (originalCalc.vnb / originalCalc.premium) * 100,
      })
      console.log("[v0] Synced VNB inputs from product:", currentProduct.productCode, baseScenario)
    } else if (currentProduct?.productCode && !currentProduct?.vnbSimulationData) {
      // Set AI-recommended defaults if product code exists but no simulation data
      const defaultRisk = 3.5
      const defaultExpense = 5.0
      const defaultLapse = 8.0
      const defaultDiscount = 2.5
      setRiskRate([defaultRisk])
      setExpense([defaultExpense])
      setLapseRate([defaultLapse])
      setDiscountRate([defaultDiscount])
      setShowResults(false)
      // Store default as original scenario
      const originalCalc = calculateScenario(defaultRisk, defaultExpense, defaultLapse, defaultDiscount)
      setOriginalScenario({
        riskRate: defaultRisk,
        expense: defaultExpense,
        lapseRate: defaultLapse,
        discountRate: defaultDiscount,
        vnb: originalCalc.vnb,
        marginRate: (originalCalc.vnb / originalCalc.premium) * 100,
      })
      console.log("[v0] Set AI default values for product:", currentProduct.productCode)
    } else if (!currentProduct?.productCode) {
      // Reset to 0 if no product code is linked
      setRiskRate([0])
      setExpense([0])
      setLapseRate([0])
      setDiscountRate([0])
      setShowResults(false)
      setOriginalScenario(null)
      console.log("[v0] Reset VNB values to 0 - no product code")
    }
    
    // Load simulation history from product
    if (currentProduct?.simulationHistory) {
      setSimulationHistory(currentProduct.simulationHistory)
      // Set counter based on highest simulation number
      const maxCounter = currentProduct.simulationHistory.reduce((max, sim) => {
        const simNum = parseInt(sim.simulationId.split('_')[1] || '0')
        return Math.max(max, simNum)
      }, 0)
      setSimulationCounter(maxCounter)
      console.log("[v0] Loaded simulation history:", currentProduct.simulationHistory.length, "simulations")
    } else {
      // Reset history if no product or switching products
      setSimulationHistory([])
      setSimulationCounter(0)
    }
  }, [currentProduct])

  // Calculate scenarios
  const calculateScenario = (
    risk: number,
    exp: number,
    lapse: number,
    discount: number
  ): Omit<Scenario, "name" | "color"> => {
    const basePremium = 100000
    const premiumFactor = 1 + risk / 100 + exp / 100
    const premium = Math.round(basePremium * premiumFactor)

    const pvFactor = 1 / (1 + discount / 100)
    const vnb = Math.round(
      premium * pvFactor * 20 * (1 - lapse / 100) * 0.15
    )

    const lossRatio = Math.round((risk / (risk + exp + 2)) * 100)

    return { riskRate: risk, expense: exp, lapseRate: lapse, discountRate: discount, vnb, premium, lossRatio }
  }

  const scenarios: Scenario[] = [
    {
      name: "기본 가정",
      ...calculateScenario(riskRate[0], expense[0], lapseRate[0], discountRate[0]),
      color: "hsl(199, 89%, 48%)",
    },
    {
      name: "보수적",
      ...calculateScenario(riskRate[0] + 1, expense[0] + 2, lapseRate[0] + 3, discountRate[0] + 0.5),
      color: "hsl(30, 80%, 55%)",
    },
    {
      name: "공격적",
      ...calculateScenario(riskRate[0] - 0.5, expense[0] - 1, lapseRate[0] - 2, discountRate[0] - 0.5),
      color: "hsl(160, 60%, 45%)",
    },
  ]

  const chartData = scenarios.map((s) => ({
    scenario: s.name,
    vnb: s.vnb,
    premium: s.premium / 10,
    lossRatio: s.lossRatio,
  }))

  const chartConfig = {
    vnb: {
      label: "VNB",
      color: "hsl(199, 89%, 48%)",
    },
    premium: {
      label: "보험료",
      color: "hsl(160, 60%, 45%)",
    },
    lossRatio: {
      label: "손해율",
      color: "hsl(30, 80%, 55%)",
    },
  } satisfies ChartConfig

  const handleDeleteSimulation = (simulationId: string) => {
    const updatedHistory = simulationHistory.filter(s => s.simulationId !== simulationId)
    setSimulationHistory(updatedHistory)
    
    // Save updated history to product context (outside of state setter)
    if (currentProduct?.id) {
      updateProduct(currentProduct.id, {
        simulationHistory: updatedHistory
      })
    }
    
    console.log("[v0] Deleted simulation:", simulationId)
  }

  const handleNavigateToProductBuilder = () => {
    if (!currentProduct?.id) return
    const event = new CustomEvent('navigate-to-dashboard', { 
      detail: { 
        dashboardId: 'product-builder',
        productId: currentProduct.id
      }
    })
    window.dispatchEvent(event)
  }

  const handleNavigateToAutoDoc = () => {
    if (!currentProduct?.id) return
    const event = new CustomEvent('navigate-to-dashboard', { 
      detail: { 
        dashboardId: 'auto-doc',
        productId: currentProduct.id
      }
    })
    window.dispatchEvent(event)
  }

  const handleSubmitSimulation = (sim: typeof simulationHistory[0]) => {
    if (!currentProduct?.id || !currentProduct?.productCode || !currentProduct?.name) {
      console.log("[v0] Cannot submit: No current product")
      return
    }

    // Show confirmation alert
    const confirmed = window.confirm(
      `해당 상품 (${currentProduct.name} / ${currentProduct.productCode})의 최적화 시나리오 ID ${sim.simulationId}를 best 시나리오로 저장합니다.`
    )

    if (!confirmed) {
      return
    }

    // Calculate premium based on VNB and margin rate
    const premium = sim.vnb / (sim.marginRate / 100)

    // Save submitted simulation to product
    updateProduct(currentProduct.id, {
      submittedSimulation: {
        simulationId: sim.simulationId,
        riskRate: sim.riskRate,
        expense: sim.expense,
        lapseRate: sim.lapseRate,
        discountRate: sim.discountRate,
        vnb: sim.vnb,
        marginRate: sim.marginRate,
        premium: premium,
        submittedAt: new Date(),
      }
    })

    console.log("[v0] Submitted simulation to product:", sim.simulationId, currentProduct.productCode)
  }

  const handleCalculate = () => {
    setIsCalculating(true)
    setTimeout(() => {
      setIsCalculating(false)
      setShowResults(true)
      
      // Generate simulation ID
      const newCounter = simulationCounter + 1
      setSimulationCounter(newCounter)
      const simId = String(newCounter).padStart(5, '0')
      const productCode = currentProduct?.productCode || 'UNKNOWN'
      const simulationId = `${productCode}_${simId}`
      
      // Calculate margin rate (VNB / Premium ratio as percentage)
      const baseScenario = scenarios[0]
      const marginRate = ((baseScenario.vnb / baseScenario.premium) * 100)
      
      // Add to simulation history
      const newSimulation = {
        simulationId,
        productName: currentProduct?.name || '미지정 상품',
        productCode,
        riskRate: riskRate[0],
        expense: expense[0],
        lapseRate: lapseRate[0],
        discountRate: discountRate[0],
        vnb: baseScenario.vnb,
        marginRate,
        timestamp: new Date(),
      }
      
      const updatedHistory = [newSimulation, ...simulationHistory]
      setSimulationHistory(updatedHistory)
      
      // Save simulation history to product context (outside of state setter)
      if (currentProduct?.id) {
        updateProduct(currentProduct.id, {
          vnbSimulationData: {
            baseScenario: scenarios[0],
            conservativeScenario: scenarios[1],
            aggressiveScenario: scenarios[2],
            calculatedAt: new Date(),
          },
          simulationHistory: updatedHistory
        })
      }
      
      console.log("[v0] Created simulation:", simulationId, newSimulation)
    }, 1500)
  }

  const breakEvenPoint = scenarios[0].premium * 20 * 0.7

  // Sensitivity Analysis Calculations
  const baseScenario = scenarios[0]
  
  // Calculate VNB change for 1% parameter change
  const riskSensitivity = calculateScenario(
    riskRate[0] + 1, expense[0], lapseRate[0], discountRate[0]
  ).vnb
  const expenseSensitivity = calculateScenario(
    riskRate[0], expense[0] + 1, lapseRate[0], discountRate[0]
  ).vnb
  const lapseSensitivity = calculateScenario(
    riskRate[0], expense[0], lapseRate[0] + 1, discountRate[0]
  ).vnb
  const discountSensitivity = calculateScenario(
    riskRate[0], expense[0], lapseRate[0], discountRate[0] + 1
  ).vnb

  const riskImpact = ((riskSensitivity - baseScenario.vnb) / baseScenario.vnb * 100)
  const expenseImpact = ((expenseSensitivity - baseScenario.vnb) / baseScenario.vnb * 100)
  const lapseImpact = ((lapseSensitivity - baseScenario.vnb) / baseScenario.vnb * 100)
  const discountImpact = ((discountSensitivity - baseScenario.vnb) / baseScenario.vnb * 100)

  const sensitivities = [
    { factor: "해지율", value: lapseRate[0], impact: lapseImpact, unit: "%", recommendation: "해지율이 VNB에 가장 큰 영향을 미칩니다" },
    { factor: "위험률", value: riskRate[0], impact: riskImpact, unit: "%", recommendation: "위험률 관리가 중요합니다" },
    { factor: "사업비", value: expense[0], impact: expenseImpact, unit: "%", recommendation: "사업비 절감이 필요합니다" },
    { factor: "할인율", value: discountRate[0], impact: discountImpact, unit: "%", recommendation: "할인율 변동성을 모니터링하세요" },
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))

  const mostSensitiveFactor = sensitivities[0]
  
  // AI Recommendations based on sensitivity analysis - CONTEXTUAL
  const generateContextualRecommendations = () => {
    const recommendations = []
    
    // 1. Most sensitive factor recommendation (always highest priority)
    recommendations.push({
      priority: "high",
      title: `핵심 리스크: ${mostSensitiveFactor.factor} ${mostSensitiveFactor.value}${mostSensitiveFactor.unit}`,
      message: `현재 ${mostSensitiveFactor.factor}이(가) 1% 변동 시 VNB ${Math.abs(mostSensitiveFactor.impact).toFixed(2)}% ${mostSensitiveFactor.impact < 0 ? '감소' : '증가'}. 즉시 관리 필요.`,
      action: mostSensitiveFactor.factor === "해지율" 
        ? "상품 설계에서 계약 유지 인센��브 추가"
        : mostSensitiveFactor.factor === "사업비"
        ? "디지털 채널 비중 확대로 사업비 절감"
        : mostSensitiveFactor.factor === "위험률"
        ? "건강 고지 항목 강화 및 언더라이팅 개선"
        : "금리연동형 담보 설계 검토"
    })

    // 2. Scenario gap analysis
    const scenarioGap = ((scenarios[2].vnb - scenarios[1].vnb) / scenarios[1].vnb * 100)
    if (scenarioGap > 15) {
      recommendations.push({
        priority: "high",
        title: `시나리오 변동폭 높음 (${scenarioGap.toFixed(1)}%)`,
        message: `보수적-공격적 시나리오 간 VNB 차이가 ${scenarioGap.toFixed(1)}%로 큼. 가정 정밀화 필요.`,
        action: "언더라이팅 데이터 재분석 및 경험통계 반영"
      })
    } else {
      recommendations.push({
        priority: "medium",
        title: `시나리오 안정성 양호 (±${(scenarioGap/2).toFixed(1)}%)`,
        message: `시나리오 간 변동폭이 적정 수준. 현재 가정 기��� 상품화 가능.`,
        action: "자동 문서 생성기에서 상품 제출 서류 작성"
      })
    }

    // 3. Loss ratio analysis
    const avgLossRatio = scenarios.reduce((sum, s) => sum + s.lossRatio, 0) / scenarios.length
    if (avgLossRatio > 75) {
      recommendations.push({
        priority: "high",
        title: `손해율 높음 (평균 ${avgLossRatio.toFixed(0)}%)`,
        message: `손해율이 목표 범위를 초과. 수익성 악화 리스크 존재.`,
        action: "상품 설계에서 위험 담보 보장 한도 조정"
      })
    } else if (avgLossRatio < 45) {
      recommendations.push({
        priority: "medium",
        title: `손해율 낮음 (평균 ${avgLossRatio.toFixed(0)}%)`,
        message: `양호한 손해율이지만 시장 경쟁력 저하 가능성 있음.`,
        action: "보험료 인하 또는 보장 강화로 시장 점유율 ���대"
      })
    } else {
      recommendations.push({
        priority: "low",
        title: `손해율 적정 (평균 ${avgLossRatio.toFixed(0)}%)`,
        message: `손해율이 최적 범위 내. 현재 구조 유지 권장.`,
        action: "VNB 극대화를 위한 세부 담보 조정"
      })
    }

    // 4. Product-specific recommendation if product is selected
    if (currentProduct) {
      recommendations.push({
        priority: "medium",
        title: `${currentProduct.name} 최적화`,
        message: `현재 설계된 ${currentProduct.blocks.length}개 담보 기준 시뮬레이션 완료. 담보별 수익성 점검 필요.`,
        action: "상품 설계 도구에서 비수익 담보 제거 또는 조정"
      })
    } else {
      recommendations.push({
        priority: "low",
        title: "상품 설계 연계 필요",
        message: "저장된 상품이 없습니다. 실제 담보 구성 기반 시뮬레이션 권장.",
        action: "상품 설계 도구에서 담보 구성 후 재시뮬레이션"
      })
    }

    return recommendations
  }

  const aiRecommendations = generateContextualRecommendations()

  return (
    <div className="h-full flex gap-4 p-6 overflow-auto bg-background">
      {/* Left Panel: Input Controls */}
      <Card className="w-80 flex-shrink-0 bg-card border-border overflow-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            시뮬레이션 설정
          </h3>

          {/* Product Selection */}
          {savedProducts.length > 0 && (
            <div className="mb-6 pb-6 border-b border-border">
              <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" />
                저장된 상품 선택
              </Label>
              <Select
                value={selectedProductId}
                onValueChange={(value) => {
                  setSelectedProductId(value)
                  loadProduct(value)
                }}
              >
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="상품을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {savedProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{product.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {product.blocks.length}개 담보
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentProduct && (
                <div className="mt-2 p-3 bg-primary/10 border border-primary/30 rounded text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-foreground">
                      {currentProduct.name}
                    </div>
                    {currentProduct.vnbSimulationData && (
                      <Badge variant="outline" className="text-[9px] h-4 bg-green-100 text-green-700 border-green-300">
                        데이터 연동
                      </Badge>
                    )}
                  </div>
                  {currentProduct.productCode && (
                    <div className="font-mono text-primary text-[10px]">
                      상품설계ID: {currentProduct.productCode}
                    </div>
                  )}
                  <div className="text-muted-foreground">
                    예상 VNB: ₩{currentProduct.estimatedVnb?.toLocaleString() || 'N/A'}
                  </div>
                  {currentProduct.vnbSimulationData && (
                    <div className="text-[9px] text-green-600 mt-1">
                      저장된 시뮬레이션 데이터 적용됨
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Improvement Recommendations Panel - shown when product has recommendations from source */}
          {currentProduct?.improvementRecommendations && currentProduct.improvementRecommendations.length > 0 && (
            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <Label className="text-sm font-medium text-foreground">
                  개선 권고사항
                </Label>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-3">
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  원본 상품의 수익성 문제를 개선하기 위한 권고사항입니다. 아래 항목을 참고하여 시뮬레이션 파라미터를 조정하세요.
                </p>
              </div>
              <div className="space-y-2">
                {currentProduct.improvementRecommendations.map((rec, idx) => {
                  const severityColor = {
                    high: "border-red-500/40 bg-red-500/10",
                    medium: "border-yellow-500/40 bg-yellow-500/10",
                    low: "border-blue-500/40 bg-blue-500/10",
                  }[rec.severity]
                  const severityText = {
                    high: "text-red-600",
                    medium: "text-yellow-600",
                    low: "text-blue-600",
                  }[rec.severity]
                  const severityLabel = { high: "심각", medium: "주의", low: "검토" }[rec.severity]

                  // Determine which slider to adjust based on factor
                  const factorAction = () => {
                    if (rec.factor === "위험률") {
                      setRiskRate([Math.max(1, riskRate[0] - 0.5)])
                    } else if (rec.factor === "사업비") {
                      setExpense([Math.max(1, expense[0] - 1)])
                    } else if (rec.factor === "해지율") {
                      setLapseRate([Math.max(1, lapseRate[0] - 2)])
                    } else if (rec.factor === "할인율") {
                      setDiscountRate([Math.min(5, discountRate[0] + 0.2)])
                    }
                  }

                  return (
                    <div key={idx} className={`p-3 rounded-lg border ${severityColor}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[9px] h-4 ${severityText}`}>
                            {severityLabel}
                          </Badge>
                          <span className="text-xs font-semibold text-foreground">{rec.factor}</span>
                        </div>
                        <span className={`text-[10px] font-mono ${severityText}`}>
                          {rec.impact > 0 ? "+" : ""}{rec.impact}억
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{rec.description}</p>
                      <div className="flex items-start gap-1.5 p-2 bg-background/60 rounded border border-border mb-2">
                        <Lightbulb className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-foreground leading-relaxed">{rec.recommendation}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs h-7 bg-transparent"
                        onClick={factorAction}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {rec.factor} 개선 적용
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-muted-foreground">
                  위험률 (Risk Rate)
                </Label>
                <span className="text-sm font-semibold text-foreground">
                  {riskRate[0]}%
                </span>
              </div>
              <Slider
                value={riskRate}
                onValueChange={setRiskRate}
                min={1}
                max={10}
                step={0.1}
                className="[&_[role=slider]]:bg-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-muted-foreground">
                  사업비 (Expense)
                </Label>
                <span className="text-sm font-semibold text-foreground">
                  {expense[0]}%
                </span>
              </div>
              <Slider
                value={expense}
                onValueChange={setExpense}
                min={1}
                max={15}
                step={0.1}
                className="[&_[role=slider]]:bg-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-muted-foreground">
                  해지율 (Lapse Rate)
                </Label>
                <span className="text-sm font-semibold text-foreground">
                  {lapseRate[0]}%
                </span>
              </div>
              <Slider
                value={lapseRate}
                onValueChange={setLapseRate}
                min={1}
                max={20}
                step={0.1}
                className="[&_[role=slider]]:bg-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-muted-foreground">
                  할인율 (Discount Rate)
                </Label>
                <span className="text-sm font-semibold text-foreground">
                  {discountRate[0]}%
                </span>
              </div>
              <Slider
                value={discountRate}
                onValueChange={setDiscountRate}
                min={0.5}
                max={5}
                step={0.1}
                className="[&_[role=slider]]:bg-primary"
              />
            </div>

            <Button
              onClick={handleCalculate}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  계산 중...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  계산 실행
                </>
              )}
            </Button>
          </div>

          {/* Quick Info */}
          <div className="mt-6 p-3 bg-secondary rounded-lg border border-border">
            <div className="text-sm font-medium text-foreground mb-2">
              손익분기점
            </div>
            <div className="text-lg font-bold text-primary">
              ₩{breakEvenPoint.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              누적 보험료 기준
            </p>
          </div>

          {/* AI Recommendations */}
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              AI 추천
            </h4>
            {aiRecommendations.map((recommendation, idx) => (
              <div key={idx} className="bg-primary/5 p-3 rounded border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${
                    recommendation.priority === 'high' ? 'bg-red-500' : 
                    recommendation.priority === 'medium' ? 'bg-orange-500' : 
                    'bg-green-500'
                  }`}></div>
                  <span className="text-xs font-semibold text-foreground capitalize">
                    {recommendation.priority === 'high' ? '높음' : 
                     recommendation.priority === 'medium' ? '중간' : '낮음'} 우선순위
                  </span>
                </div>
                <h5 className="text-sm font-semibold text-foreground mb-1">{recommendation.title}</h5>
                <p className="text-[11px] text-muted-foreground mb-2">{recommendation.message}</p>
                <div className="text-[10px] text-primary font-medium">
                  → {recommendation.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Center: Results */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Product Header */}
        {currentProduct && (
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground">
                상품명 {currentProduct.name}
              </span>
              {currentProduct.productCode && (
                <span className="text-sm font-mono text-primary">
                  (상품설계ID: {currentProduct.productCode})
                </span>
              )}
            </div>
          </Card>
        )}
        
        {!showResults ? (
          <Card className="flex-1 flex items-center justify-center bg-card border-border border-dashed">
            <div className="text-center text-muted-foreground">
              <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">슬라이더를 조정하고 계산 실행 버튼을 누르세요</p>
            </div>
          </Card>
        ) : (
          <>
            {/* AI Optimal Scenario Analysis - Show when 2+ simulations exist */}
            {simulationHistory.length >= 2 && (
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">AI 최적 시나리오 분석</h3>
                </div>

                {(() => {
                  // Find best simulation by VNB
                  const bestByVnb = [...simulationHistory].sort((a, b) => b.vnb - a.vnb)[0]
                  // Find best simulation by margin rate
                  const bestByMargin = [...simulationHistory].sort((a, b) => b.marginRate - a.marginRate)[0]
                  // Calculate average values
                  const avgVnb = simulationHistory.reduce((sum, s) => sum + s.vnb, 0) / simulationHistory.length
                  const avgMargin = simulationHistory.reduce((sum, s) => sum + s.marginRate, 0) / simulationHistory.length
                  
                  // Determine optimal scenario
                  const isOptimalSame = bestByVnb.simulationId === bestByMargin.simulationId
                  const optimalSim = isOptimalSame ? bestByVnb : 
                    (bestByVnb.vnb > avgVnb * 1.1 && bestByVnb.marginRate > avgMargin * 0.9) ? bestByVnb : bestByMargin

                  return (
                    <div className="space-y-4">
                      {/* Comparison Summary */}
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="p-4 bg-card border-border">
                          <div className="text-xs text-muted-foreground mb-1">최고 VNB</div>
                          <div className="text-sm font-mono text-primary mb-1">{bestByVnb.simulationId}</div>
                          <div className="text-lg font-bold text-foreground">+₩{(bestByVnb.vnb / 1000).toFixed(1)}K</div>
                        </Card>
                        <Card className="p-4 bg-card border-border">
                          <div className="text-xs text-muted-foreground mb-1">최고 마진률</div>
                          <div className="text-sm font-mono text-primary mb-1">{bestByMargin.simulationId}</div>
                          <div className="text-lg font-bold text-green-600">+{bestByMargin.marginRate.toFixed(1)}%</div>
                        </Card>
                        <Card className="p-4 bg-card border-border">
                          <div className="text-xs text-muted-foreground mb-1">평균 VNB</div>
                          <div className="text-sm text-muted-foreground mb-1">{simulationHistory.length}개 시뮬레이션</div>
                          <div className="text-lg font-bold text-foreground">+₩{(avgVnb / 1000).toFixed(1)}K</div>
                        </Card>
                      </div>

                      {/* Optimal Recommendation */}
                      <Card className="p-4 bg-primary/5 border-primary">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary text-primary-foreground rounded-full p-2">
                            <TrendingUp className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-foreground mb-2">추천 최적 시나리오</h4>
                            <div className="bg-card p-3 rounded border border-border mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-mono text-primary font-semibold">{optimalSim.simulationId}</span>
                                <Badge className="bg-primary text-primary-foreground text-[9px]">최적</Badge>
                              </div>
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                <div>
                                  <div className="text-muted-foreground">위험률</div>
                                  <div className="font-semibold text-foreground">{optimalSim.riskRate.toFixed(1)}%</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">사업비</div>
                                  <div className="font-semibold text-foreground">{optimalSim.expense.toFixed(1)}%</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">해지율</div>
                                  <div className="font-semibold text-foreground">{optimalSim.lapseRate.toFixed(1)}%</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">할인율</div>
                                  <div className="font-semibold text-foreground">{optimalSim.discountRate.toFixed(1)}%</div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                                <div>
                                  <span className="text-xs text-muted-foreground mr-2">VNB:</span>
                                  <span className="text-sm font-bold text-primary">+₩{(optimalSim.vnb / 1000).toFixed(1)}K</span>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground mr-2">마진률:</span>
                                  <span className="text-sm font-bold text-green-600">+{optimalSim.marginRate.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2 text-xs text-foreground">
                              <p className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>
                                  이 시나리오는 평균 대비 VNB {((optimalSim.vnb / avgVnb - 1) * 100).toFixed(1)}%, 
                                  마진률 {((optimalSim.marginRate / avgMargin - 1) * 100).toFixed(1)}% 우수합니다.
                                </span>
                              </p>
                              <p className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>
                                  {optimalSim.expense < 8 ? '낮은 사업비율로 효율적인 운영이 가능하며, ' : ''}
                                  {optimalSim.lapseRate < 5 ? '안정적인 해지율을 유지하여 ' : ''}
                                  장기적으로 수익성이 보장됩니다.
                                </span>
                              </p>
                              <p className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>
                                  현재 시장 환경에서 위험과 수익의 균형이 가장 최적화된 조합입니다.
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Key Insights */}
                      <div className="grid grid-cols-2 gap-3">
                        <Card className="p-3 bg-card border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-semibold text-foreground">파라미터 영향도 분석</span>
                          </div>
                          <ul className="space-y-1 text-[11px] text-muted-foreground">
                            <li>• 위험률 변동이 VNB에 가장 큰 영향</li>
                            <li>• 사업비 최적화로 마진률 개선 가능</li>
                            <li>• 해지율 관리가 장기 수익성 핵심</li>
                          </ul>
                        </Card>
                        <Card className="p-3 bg-card border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs font-semibold text-foreground">다음 단계 제안</span>
                          </div>
                          <ul className="space-y-1 text-[11px] text-muted-foreground">
                            <li>• 최적 시나리오로 상품 설계 최종 확정</li>
                            <li>• 민감도 분석으로 리스크 검증</li>
                            <li>• 경쟁사 상품과 비교 분석 수행</li>
                          </ul>
                        </Card>
                      </div>
                    </div>
                  )
                })()}
              </Card>
            )}

            {/* Scenario Comparison Analysis and History */}
            <Card className="p-6 bg-card border-border">
              {/* Title */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">시나리오별 VNB 비교 분석</h3>
              </div>

              {/* Top Section: Simulation Results */}
              <div className="space-y-4 mb-6">
                {/* Scenario Comparison Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {scenarios.map((scenario, idx) => (
                    <Card key={idx} className="p-3 bg-card border-border">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-foreground">
                          {scenario.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5"
                          style={{ borderColor: scenario.color, color: scenario.color }}
                        >
                          {idx === 0 ? "기준" : idx === 1 ? "보수" : "공격"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="text-[10px] text-muted-foreground">VNB</div>
                          <div className="text-xl font-bold text-foreground flex items-center gap-1">
                            +₩{(scenario.vnb / 1000).toFixed(1)}K
                            {idx > 0 && (
                              <>
                                {scenario.vnb > scenarios[0].vnb ? (
                                  <TrendingUp className="h-3 w-3 text-green-500" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-red-500" />
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <div className="text-muted-foreground">보험료</div>
                            <div className="font-semibold text-foreground">
                              ₩{(scenario.premium / 1000).toFixed(0)}K
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">손해율</div>
                            <div className="font-semibold text-foreground">
                              {scenario.lossRatio}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Bottom Section: Simulation History */}
              {simulationHistory.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-base font-semibold text-foreground mb-4">시뮬레이션 실행 이력</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Simulation ID</th>
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">상품명</th>
                          <th className="text-right py-2 px-3 font-semibold text-muted-foreground">위험률(%)</th>
                          <th className="text-right py-2 px-3 font-semibold text-muted-foreground">사업비(%)</th>
                          <th className="text-right py-2 px-3 font-semibold text-muted-foreground">해지율(%)</th>
                          <th className="text-right py-2 px-3 font-semibold text-muted-foreground">할인율(%)</th>
                          <th className="text-right py-2 px-3 font-semibold text-muted-foreground">VNB(원)</th>
                          <th className="text-right py-2 px-3 font-semibold text-muted-foreground">마진률(%)</th>
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">생성 시간</th>
                          <th className="text-center py-2 px-3 font-semibold text-muted-foreground">삭제</th>
                          <th className="text-center py-2 px-3 font-semibold text-muted-foreground">제출</th>
                          <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Best</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Original Baseline Row - Gray highlighted for comparison */}
                        {originalScenario && (
                          <tr className="bg-muted/60 border-b-2 border-border">
                            <td className="py-2 px-3 font-mono text-muted-foreground font-semibold">Original</td>
                            <td className="py-2 px-3 text-muted-foreground italic">기준값</td>
                            <td className="py-2 px-3 text-right text-muted-foreground font-medium">{originalScenario.riskRate.toFixed(1)}</td>
                            <td className="py-2 px-3 text-right text-muted-foreground font-medium">{originalScenario.expense.toFixed(1)}</td>
                            <td className="py-2 px-3 text-right text-muted-foreground font-medium">{originalScenario.lapseRate.toFixed(1)}</td>
                            <td className="py-2 px-3 text-right text-muted-foreground font-medium">{originalScenario.discountRate.toFixed(1)}</td>
                            <td className="py-2 px-3 text-right font-semibold text-muted-foreground">
                              ₩{(originalScenario.vnb / 1000).toFixed(1)}K
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-muted-foreground">
                              {originalScenario.marginRate.toFixed(1)}%
                            </td>
                            <td className="py-2 px-3 text-left text-muted-foreground text-[10px]">-</td>
                            <td className="py-2 px-3 text-center text-muted-foreground text-[10px]">-</td>
                            <td className="py-2 px-3 text-center text-muted-foreground text-[10px]">-</td>
                            <td className="py-2 px-3 text-center text-muted-foreground text-[10px]">-</td>
                          </tr>
                        )}
                        {simulationHistory.map((sim, idx) => {
                          // Calculate delta from original
                          const vnbDelta = originalScenario ? sim.vnb - originalScenario.vnb : 0
                          const marginDelta = originalScenario ? sim.marginRate - originalScenario.marginRate : 0
                          return (
                          <tr key={idx} className="border-b border-border hover:bg-secondary/50">
                            <td className="py-2 px-3 font-mono text-primary">{sim.simulationId}</td>
                            <td className="py-2 px-3 text-foreground">{sim.productName}</td>
                            <td className="py-2 px-3 text-right text-foreground">
                              {sim.riskRate.toFixed(1)}
                              {originalScenario && sim.riskRate !== originalScenario.riskRate && (
                                <span className={`ml-1 text-[9px] ${sim.riskRate < originalScenario.riskRate ? 'text-green-600' : 'text-red-500'}`}>
                                  ({sim.riskRate < originalScenario.riskRate ? '' : '+'}{(sim.riskRate - originalScenario.riskRate).toFixed(1)})
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right text-foreground">
                              {sim.expense.toFixed(1)}
                              {originalScenario && sim.expense !== originalScenario.expense && (
                                <span className={`ml-1 text-[9px] ${sim.expense < originalScenario.expense ? 'text-green-600' : 'text-red-500'}`}>
                                  ({sim.expense < originalScenario.expense ? '' : '+'}{(sim.expense - originalScenario.expense).toFixed(1)})
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right text-foreground">
                              {sim.lapseRate.toFixed(1)}
                              {originalScenario && sim.lapseRate !== originalScenario.lapseRate && (
                                <span className={`ml-1 text-[9px] ${sim.lapseRate < originalScenario.lapseRate ? 'text-green-600' : 'text-red-500'}`}>
                                  ({sim.lapseRate < originalScenario.lapseRate ? '' : '+'}{(sim.lapseRate - originalScenario.lapseRate).toFixed(1)})
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right text-foreground">
                              {sim.discountRate.toFixed(1)}
                              {originalScenario && sim.discountRate !== originalScenario.discountRate && (
                                <span className={`ml-1 text-[9px] ${sim.discountRate > originalScenario.discountRate ? 'text-green-600' : 'text-red-500'}`}>
                                  ({sim.discountRate > originalScenario.discountRate ? '+' : ''}{(sim.discountRate - originalScenario.discountRate).toFixed(1)})
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-primary">
                              +₩{(sim.vnb / 1000).toFixed(1)}K
                              {originalScenario && vnbDelta !== 0 && (
                                <span className={`ml-1 text-[9px] ${vnbDelta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  ({vnbDelta > 0 ? '+' : ''}{(vnbDelta / 1000).toFixed(1)}K)
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-green-600">
                              +{sim.marginRate.toFixed(1)}%
                              {originalScenario && marginDelta !== 0 && (
                                <span className={`ml-1 text-[9px] ${marginDelta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  ({marginDelta > 0 ? '+' : ''}{marginDelta.toFixed(1)}%)
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-left text-muted-foreground text-[10px]">
                              {sim.timestamp.toLocaleString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSimulation(sim.simulationId)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <Button
                                size="sm"
                                onClick={() => handleSubmitSimulation(sim)}
                                disabled={currentProduct?.submittedSimulation?.simulationId === sim.simulationId}
                                className="h-6 px-2 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Submit
                              </Button>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {currentProduct?.submittedSimulation?.simulationId === sim.simulationId && (
                                <div className="flex items-center justify-center gap-0.5 text-yellow-500">
                                  <Star className="h-3 w-3 fill-yellow-500" />
                                  <span className="text-[9px] font-semibold">BEST</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
