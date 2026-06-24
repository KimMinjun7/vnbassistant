
import { useState, useEffect } from "react"
import { X, FileText, Code, Calculator, Download, Database, FlaskConical, Save, Brain, Activity, BarChart2, Wand2, BarChart3, Package, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ContractorList } from "@/components/contractor-list"
import { PortfolioHeatmap } from "@/components/portfolio-heatmap"
import { ProductSpecBuilder } from "@/components/product-spec-builder"
import { VnbSimulator } from "@/components/vnb-simulator"
import { AutoDocGenerator } from "@/components/auto-doc-generator"
import { VnbAssistant, TrainingDbTab, PredictionTab, ResultDbTab, ModelDevTab, AggregationTab, OutputTab, SimulationTab } from "@/components/vnb-assistant"
import { WelcomeScreen } from "@/components/welcome-screen"
import { ProductAnalysisList } from "@/components/product-analysis-list"
import { ProductDetailView } from "@/components/product-detail-view"
import { ProductSummary } from "@/components/product-summary"

function getTabIcon(nodeId: string): LucideIcon {
  if (nodeId.startsWith("training-db"))  return Database
  if (nodeId.startsWith("prediction-db")) return FlaskConical
  if (nodeId.startsWith("result-db"))    return Save
  if (nodeId.startsWith("model-dev"))    return Brain
  if (nodeId === "simulation")           return Activity
  if (nodeId === "vnb-dashboard" || nodeId === "output-result" || nodeId === "dashboard") return BarChart2
  if (nodeId === "output")               return Download
  if (nodeId === "product-builder")      return Wand2
  if (nodeId === "vnb-simulator")        return BarChart3
  if (nodeId === "product-analysis-list" || nodeId === "product-summary" || nodeId === "product-detail") return Package
  if (nodeId === "portfolio-heatmap")    return BarChart2
  return FileText
}

interface Tab {
  id: string
  title: string
  type: "document" | "code"
  nodeId: string
  inputs?: SimulationInputs
  result?: SimulationResult | null
  productId?: string
}

interface SimulationInputs {
  age: string
  gender: string
  amount: string
  duration: string
  insurancePeriod: string
  paymentPeriod: string
  paymentMethod: string
  riskRate: string
  expectedRate: string
  maintenanceCost: string
}

interface SimulationResult {
  premium: number | null
  vnb: number | null
  details: {
    label: string
    value: string
  }[]
}

interface CenterWorkspaceProps {
  selectedNode: { id: string; name: string; type: string } | null
  tabs: Tab[]
  activeTabId: string | null
  onCalculate: (tabId: string, inputs: SimulationInputs) => void
  onTabChange: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onNavigateToDashboard?: (dashboardId: string) => void
}

export function CenterWorkspace({
  selectedNode,
  tabs,
  activeTabId,
  onCalculate,
  onTabChange,
  onTabClose,
  onNavigateToDashboard
}: CenterWorkspaceProps) {
  // JSON data for document variables
  const [documentVariables, setDocumentVariables] = useState({
    additional_payment_limit: 200,
    payment_processing_days: 30,
    insurance_fee: 200,
    base_premium_rate: 0.08
  })

  const [codeContent, setCodeContent] = useState(
    JSON.stringify(documentVariables, null, 2)
  )

  const [calculatorFormula, setCalculatorFormula] = useState("PV = (CF / (1 + r)) * N) - I")
  const [conditionInput, setConditionInput] = useState("납입금액")
  const [conditionValue, setConditionValue] = useState("100,000")

  // Update document variables when JSON is edited
  const handleCodeContentChange = (value: string) => {
    setCodeContent(value)
    try {
      const parsed = JSON.parse(value)
      setDocumentVariables(parsed)
    } catch (e) {
      // Invalid JSON, don't update variables
      console.log("[v0] Invalid JSON format")
    }
  }

  // Get current tab's inputs or use defaults
  const activeTab = tabs.find(t => t.id === activeTabId)
  const defaultInputs: SimulationInputs = {
    age: "35",
    gender: "male",
    amount: "100000",
    duration: "12",
    insurancePeriod: "20",
    paymentPeriod: "20",
    paymentMethod: "monthly",
    riskRate: "3.5",
    expectedRate: "2.5",
    maintenanceCost: "5",
  }

  const [inputs, setInputs] = useState<SimulationInputs>(
    activeTab?.inputs || defaultInputs
  )

  // Sync inputs when active tab changes
  useEffect(() => {
    if (activeTab) {
      setInputs(activeTab.inputs || defaultInputs)
    }
  }, [activeTabId])

  const handleInputChange = (field: keyof SimulationInputs, value: string) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  const handleCalculate = () => {
    if (activeTabId) {
      onCalculate(activeTabId, inputs)
    }
  }

  const handlePdfDownload = () => {
    // PDF download functionality
    console.log("[v0] PDF 다운로드 시작:", activeTab?.title)
    alert(`${activeTab?.title} PDF 다운로드를 시작합니다.`)
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Tab Bar */}
      <div className="flex border-b border-border bg-muted/50 min-h-[44px]">
        {tabs.length === 0 ? (
          <div className="flex items-center px-4 py-2 text-sm text-muted-foreground">
            VNB Assistant - VNB 예측·시뮬레이션·집계 플랫폼
          </div>
        ) : (
          tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer transition-colors ${activeTabId === tab.id
                  ? "bg-card text-foreground border-b-2 border-b-primary"
                  : "text-muted-foreground hover:bg-secondary"
                }`}
              onClick={() => onTabChange(tab.id)}
            >
              {(() => { const Icon = getTabIcon(tab.nodeId); return <Icon className="h-4 w-4" /> })()}
              <span className="text-sm">{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose(tab.id)
                }}
                className="ml-2 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Route by nodeId */}
        {tabs.length === 0 ? (
          <WelcomeScreen onNavigate={(dashboardId) => onNavigateToDashboard?.(dashboardId)} />
        ) : activeTab?.nodeId.startsWith("training-db") ? (
          <TrainingDbTab />
        ) : activeTab?.nodeId.startsWith("prediction-db") ? (
          <PredictionTab />
        ) : activeTab?.nodeId.startsWith("result-db") ? (
          <ResultDbTab />
        ) : activeTab?.nodeId.startsWith("model-dev") ? (
          <ModelDevTab />
        ) : activeTab?.nodeId === "simulation" ? (
          <SimulationTab />
        ) : activeTab?.nodeId === "vnb-dashboard" || activeTab?.nodeId === "output-result" || activeTab?.nodeId === "dashboard" ? (
          <AggregationTab />
        ) : activeTab?.nodeId === "output" ? (
          <OutputTab />
        ) : activeTab?.nodeId === "portfolio-heatmap" ? (
          <PortfolioHeatmap />
        ) : activeTab?.nodeId === "product-builder" ? (
          <ProductSpecBuilder />
        ) : activeTab?.nodeId === "vnb-simulator" ? (
          <VnbSimulator />
        ) : activeTab?.nodeId === "auto-doc" ? (
          <AutoDocGenerator />
        ) : activeTab?.nodeId === "vnb-assistant" ? (
          <VnbAssistant />
        ) : activeTab?.nodeId === "product-analysis-list" ? (
          <ProductAnalysisList />
        ) : activeTab?.nodeId === "product-summary" ? (
          <ProductSummary />
        ) : activeTab?.nodeId === "product-detail" && activeTab?.productId ? (
          <ProductDetailView productId={activeTab.productId} />
        ) : activeTab?.nodeId === "contractor-list" ? (
          <ContractorList />
        ) : (
          <>
            {/* Document Work Area */}
            <div className="flex-1 p-4 overflow-auto border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">문서 작업 영역</h3>
                </div>
                <Button
                  onClick={handlePdfDownload}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF 다운로드
                </Button>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 min-h-[120px]">
                <div className="prose prose-invert max-w-none text-sm">
                  <h3 className="text-lg font-bold text-foreground mt-6 mb-3">제1장 총칙</h3>

                  <h4 className="font-semibold text-foreground mt-4">제1조 (목적)</h4>
                  <p className="text-foreground/90">
                    본 약관은 계약자와 보험회사(이하 "회사"라 합니다) 간에 체결되는 보험계약에 관하여 보험금 지급 및 보험료 납입 등 제반 사항을 정함을 목적으로 합니다.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">제2조 (용어의 정의)</h4>
                  <p className="text-foreground/90">
                    본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
                  </p>
                  <ul className="list-disc list-inside text-foreground/90 space-y-1">
                    <li>"계약자"라 함은 회사와 보험계약을 체결하고 보험료를 납입할 의무를 부담하는 자를 말합니다.</li>
                    <li>"피보험자"라 함은 보험사고의 대상이 되는 자를 말합니다.</li>
                    <li>"보험수익자"라 함은 보험사고 발생 시 보험금을 지급받는 자를 말합니다.</li>
                    <li>"추가납입"이라 함은 계약자가 기본보험료 외에 임의로 납입하는 보험료를 말합니다.</li>
                  </ul>

                  <h3 className="text-lg font-bold text-foreground mt-6 mb-3">제2장 보험료 및 납입</h3>

                  <h4 className="font-semibold text-foreground mt-4">제3조 (보험료의 납입 및 적용)</h4>
                  <p className="text-foreground/90"><strong>제1항</strong><br />
                    계약자는 회사가 정한 방법에 따라 보험료를 정해진 납입기일까지 납입하여야 합니다.
                  </p>
                  <p className="text-foreground/90"><strong>제2항</strong><br />
                    보험료 납입이 지연될 경우 회사는 약관에서 정한 바에 따라 보험계약의 효력 제한 또는 해지를 할 수 있습니다.
                  </p>
                  <p className="text-foreground/90"><strong>제3항</strong><br />
                    보험료는 보험 게시일(보험계약의 효력이 발생한 날)로부터 적용됩니다.
                  </p>
                  <p className="text-foreground/90"><strong>제4항</strong><br />
                    보험료 납입 금액 및 납입 주기는 계약 체결 시 약정한 내용에 따르며, 변경이 필요한 경우 회사의 승인을 받아야 합니다.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">제4조 (추가 납입)</h4>
                  <p className="text-foreground/90"><strong>제1항</strong><br />
                    계약자는 기본보험료 외에 회사가 허용하는 범위 내에서 추가 납입을 할 수 있습니다.
                  </p>
                  <p className="text-foreground/90"><strong>제2항</strong><br />
                    추가 납입 한도는 기본보험료 총액의 <span className="bg-primary/20 text-primary px-1 rounded font-semibold">{documentVariables.additional_payment_limit}</span>% 이내로 합니다.
                  </p>
                  <p className="text-foreground/90"><strong>제3항</strong><br />
                    추가 납입된 보험료는 계약자의 적립금에 반영되며, 회사가 정한 이율에 따라 운용됩니다.
                  </p>
                  <p className="text-foreground/90"><strong>제4항</strong><br />
                    회사는 시장 상황 또는 회사의 운용 정책에 따라 추가 납입 가능 여부 및 한도를 변경할 수 있으며, 변경 시 계약자에게 사전 통지합니다.
                  </p>

                  <h3 className="text-lg font-bold text-foreground mt-6 mb-3">제3장 보험금 지급</h3>

                  <h4 className="font-semibold text-foreground mt-4">제5조 (보험금 지급 사유)</h4>
                  <p className="text-foreground/90">
                    회사는 다음 각 호의 사유가 발생한 경우 보험수익자에게 약정한 보험금을 지급합니다.
                  </p>
                  <ul className="list-decimal list-inside text-foreground/90 space-y-1">
                    <li>피보험자의 사망</li>
                    <li>약관에서 정한 질병 또는 상해 발생</li>
                    <li>만기 도래 시 적립금 지급 사유 발생</li>
                  </ul>

                  <h4 className="font-semibold text-foreground mt-4">제6조 (보험금 청구 절차)</h4>
                  <p className="text-foreground/90"><strong>제1항</strong><br />
                    보험금 청구 시 보험수익자는 회사가 정한 청구서류를 제출하여야 합니다.
                  </p>
                  <p className="text-foreground/90"><strong>제2항</strong><br />
                    회사는 서류 접수일로부터 <span className="bg-primary/20 text-primary px-1 rounded font-semibold">{documentVariables.payment_processing_days}</span>일 이내에 보험금 지급 여부를 결정하고 지급합니다.
                  </p>
                  <p className="text-foreground/90"><strong>제3항</strong><br />
                    지급 사유에 대한 조사 필요 시 지급 기한은 연장될 수 있습니다.
                  </p>

                  <h3 className="text-lg font-bold text-foreground mt-6 mb-3">제4장 계약의 변경 및 해지</h3>

                  <h4 className="font-semibold text-foreground mt-4">제7조 (계약 내용 변경)</h4>
                  <p className="text-foreground/90">
                    계약자는 보험기간 중 다음 사항에 대해 변경을 요청할 수 있습니다.
                  </p>
                  <ul className="list-decimal list-inside text-foreground/90 space-y-1">
                    <li>보험료 납입 방식</li>
                    <li>보험수익자 지정 또는 변경</li>
                    <li>추가 납입 여부</li>
                  </ul>
                  <p className="text-foreground/90">
                    단, 회사의 ��사 결과에 따라 변경이 제한될 수 있습니다.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">제8조 (계약 해지)</h4>
                  <p className="text-foreground/90"><strong>제1항</strong><br />
                    계약자는 언제든지 계약 해지를 요청할 수 있습니다.
                  </p>
                  <p className="text-foreground/90"><strong>제2항</strong><br />
                    해지 시 회사는 약관에 따라 해지환급금을 지급합니다.
                  </p>
                  <p className="text-foreground/90"><strong>제3항</strong><br />
                    해지환급금은 납입 보험료보다 적거나 없을 수 있습니다.
                  </p>

                  <h3 className="text-lg font-bold text-foreground mt-6 mb-3">제5장 기타 사항</h3>

                  <h4 className="font-semibold text-foreground mt-4">제9조 (분쟁 해결)</h4>
                  <p className="text-foreground/90">
                    본 계약과 관련하여 분쟁이 발생한 경우 회사와 계약자는 상호 협의하여 해결하도록 노력하며, 협의가 이루어지지 않을 경우 관계 법령에 따릅니다.
                  </p>

                  <h4 className="font-semibold text-foreground mt-4">제10조 (준거법)</h4>
                  <p className="text-foreground/90">
                    본 약관은 대한민국 법률을 준거법으로 합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Code Editor Area */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">DB 코드 편집기</h3>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs bg-transparent">
                    코드편집기
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent">
                    데이터수정
                  </Button>
                </div>
              </div>
              <Textarea
                value={codeContent}
                onChange={(e) => handleCodeContentChange(e.target.value)}
                className="font-mono text-sm bg-muted border-border min-h-[80px] text-foreground"
                placeholder="JSON 형식으로 데이터를 입력하세요"
              />
            </div>

            {/* Calculator Area */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">룰 작성 & 수식 계산 작업 영역</h3>
              </div>

              {/* Input Parameters */}
              <div className="grid grid-cols-5 gap-3 mb-4">
                <div>
                  <Label className="text-xs text-muted-foreground">가입연령</Label>
                  <Input
                    value={inputs.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="bg-muted border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">성별</Label>
                  <Select
                    value={inputs.gender}
                    onValueChange={(v) => handleInputChange("gender", v)}
                  >
                    <SelectTrigger className="bg-muted border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="male">남성</SelectItem>
                      <SelectItem value="female">여성</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">가입금액</Label>
                  <Input
                    value={inputs.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className="bg-muted border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">경과기간</Label>
                  <Input
                    value={inputs.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    className="bg-muted border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">보험기간</Label>
                  <Input
                    value={inputs.insurancePeriod}
                    onChange={(e) => handleInputChange("insurancePeriod", e.target.value)}
                    className="bg-muted border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 mb-4">
                <div>
                  <Label className="text-xs text-muted-foreground">납입기간</Label>
                  <Input
                    value={inputs.paymentPeriod}
                    onChange={(e) => handleInputChange("paymentPeriod", e.target.value)}
                    className="bg-muted border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">납입방법</Label>
                  <Select
                    value={inputs.paymentMethod}
                    onValueChange={(v) => handleInputChange("paymentMethod", v)}
                  >
                    <SelectTrigger className="bg-muted border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="monthly">월납</SelectItem>
                      <SelectItem value="yearly">연납</SelectItem>
                      <SelectItem value="single">일시납</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">위험예정율 (%)</Label>
                  <Input
                    value={inputs.riskRate}
                    onChange={(e) => handleInputChange("riskRate", e.target.value)}
                    className="bg-muted border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">예정이율 (%)</Label>
                  <Input
                    value={inputs.expectedRate}
                    onChange={(e) => handleInputChange("expectedRate", e.target.value)}
                    className="bg-muted border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">예정유지비 (%)</Label>
                  <Input
                    value={inputs.maintenanceCost}
                    onChange={(e) => handleInputChange("maintenanceCost", e.target.value)}
                    className="bg-muted border-border text-foreground"
                  />
                </div>
              </div>

              {/* Condition & Formula */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">조건 설정 IF</Label>
                  <div className="flex gap-2">
                    <Input
                      value={conditionInput}
                      onChange={(e) => setConditionInput(e.target.value)}
                      className="bg-muted border-border text-foreground"
                      placeholder="조건명"
                    />
                    <Input
                      value={conditionValue}
                      onChange={(e) => setConditionValue(e.target.value)}
                      className="bg-muted border-border text-foreground"
                      placeholder="값"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">수식</Label>
                  <Input
                    value={calculatorFormula}
                    onChange={(e) => setCalculatorFormula(e.target.value)}
                    className="bg-muted border-border font-mono text-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-foreground border-border bg-transparent">
                    저장
                  </Button>
                  <Button onClick={handleCalculate} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    미리보기 생성 →
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
