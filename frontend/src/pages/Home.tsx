import { useState, useEffect } from "react"
import { DataSidebar } from "@/components/layout/data-sidebar"
import { CenterWorkspace } from "@/components/layout/center-workspace"
import { RightPanel } from "@/components/layout/right-panel"
import { ProductProvider } from "@/contexts/product-context"

interface SimulationResult {
  premium: number | null
  vnb: number | null
  details: { label: string; value: string }[]
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

interface Tab {
  id: string
  title: string
  type: "document" | "code"
  nodeId: string
  inputs?: SimulationInputs
  result?: SimulationResult | null
  productId?: string
}

const DEFAULT_INPUTS: SimulationInputs = {
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

const DASHBOARD_NAMES: Record<string, string> = {
  // VNB Assistant 섹션
  "training-db":        "학습용 DB",
  "training-db-vars":   "설명변수 DB 관리",
  "training-db-system": "내부 시스템 연계",
  "training-db-gen":    "학습 데이터 생성",
  "training-db-infra":  "인프라 구축",
  "prediction-db":        "예측용 DB",
  "prediction-db-mp":     "MP DB 생성",
  "prediction-db-dataset":"예측 데이터셋 구축",
  "prediction-db-run":    "VNB 예측 수행",
  "result-db":       "예측결과 저장 DB",
  "result-db-store": "결과 저장",
  "result-db-agg":   "결과 집계",
  "model-dev":           "예측모델 개발",
  "model-dev-build":     "모델 구축",
  "model-dev-algo":      "알고리즘 선정",
  "model-dev-shap":      "영향도 분석",
  "model-dev-retrain":   "재학습 체계 구축",
  "model-dev-monitor":   "성능 모니터링",
  "simulation":    "시뮬레이션 및 집계",
  "vnb-dashboard": "대시보드",
  "output":        "출력",
  "output-result": "결과 출력",
  // 기존
  "dashboard":            "VNB 대시보드",
  "portfolio-heatmap":    "포트폴리오 히트맵",
  "product-builder":      "상품 설계 도구",
  "vnb-simulator":        "VNB 시뮬레이터",
  "auto-doc":             "파일 생성",
  "product-analysis-list":"상품 목록",
  "product-summary":      "상품 요약",
  "product-detail":       "상품 상세",
}

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<{ id: string; name: string; type: string } | null>(null)
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  const handleNodeSelect = (node: { id: string; name: string; type: string }) => {
    setSelectedNode(node)
  }

  const handleDocumentOpen = (node: { id: string; name: string; type: string }) => {
    const existingTab = tabs.find((t) => t.nodeId === node.id)
    if (existingTab) {
      setActiveTabId(existingTab.id)
    } else {
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        title: node.name,
        type: "document",
        nodeId: node.id,
        inputs: DEFAULT_INPUTS,
        result: null,
      }
      setTabs([...tabs, newTab])
      setActiveTabId(newTab.id)
    }
  }

  const handleNavigateToDashboard = (dashboardId: string, productId?: string) => {
    const dashboardName = DASHBOARD_NAMES[dashboardId]
    if (!dashboardName) return

    const existingTab = tabs.find((t) => t.nodeId === dashboardId && (!productId || t.productId === productId))
    if (existingTab) {
      setActiveTabId(existingTab.id)
    } else {
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        title: dashboardName,
        type: "document",
        nodeId: dashboardId,
        productId,
        inputs: DEFAULT_INPUTS,
        result: null,
      }
      setTabs([...tabs, newTab])
      setActiveTabId(newTab.id)
    }
  }

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId)
    const tab = tabs.find((t) => t.id === tabId)
    if (tab?.result) setIsLoading(false)
  }

  const handleTabClose = (tabId: string) => {
    const newTabs = tabs.filter((t) => t.id !== tabId)
    setTabs(newTabs)
    if (activeTabId === tabId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[0].id : null)
    }
  }

  const handleCalculate = async (tabId: string, inputs: SimulationInputs) => {
    setIsLoading(true)
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, inputs, result: null } : t)))

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      })
      const result: SimulationResult = await res.json()
      setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, result } : t)))
    } catch {
      // 백엔드 미연결 시 로컬 폴백
      const result = simulatePremiumLocal(inputs)
      setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, result } : t)))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleNavigation = (event: CustomEvent<{ dashboardId: string; productId?: string; opportunityData?: unknown }>) => {
      handleNavigateToDashboard(event.detail.dashboardId, event.detail.productId)
      if (event.detail.opportunityData) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("product-opportunity-data", { detail: event.detail.opportunityData }))
        }, 200)
      }
    }
    window.addEventListener("navigate-to-dashboard" as never, handleNavigation as never)
    return () => window.removeEventListener("navigate-to-dashboard" as never, handleNavigation as never)
  }, [tabs, activeTabId])

  const activeTab = tabs.find((t) => t.id === activeTabId)
  const currentResult = activeTab?.result ?? null

  return (
    <ProductProvider>
      <div className="h-screen flex flex-col bg-background">
        <header className="h-14 bg-card border-b border-border flex items-center px-6 justify-between">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}신한라이프 로고 국문 상하.png`} alt="신한라이프" className="h-10" />
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-lg">VNB Assistant</span>
              <span className="text-xs text-muted-foreground">VNB 예측·시뮬레이션·집계 서비스</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">상품개발팀</span>
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary text-xs font-semibold">김</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden bg-muted/30">
          <div className={`flex-shrink-0 transition-all duration-300 overflow-hidden ${sidebarOpen ? "w-64" : "w-14"}`}>
            <DataSidebar
              onNodeSelect={handleNodeSelect}
              onDocumentOpen={handleDocumentOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
              isOpen={sidebarOpen}
            />
          </div>
          <div className="flex-1 min-w-0 p-3">
            <div className="h-full rounded-xl overflow-hidden shadow-sm border border-border bg-card">
            <CenterWorkspace
              selectedNode={selectedNode}
              tabs={tabs}
              activeTabId={activeTabId}
              onCalculate={handleCalculate}
              onTabChange={handleTabChange}
              onTabClose={handleTabClose}
              onNavigateToDashboard={handleNavigateToDashboard}
            />
            </div>
          </div>
          <div className={`flex-shrink-0 transition-all duration-300 overflow-hidden ${rightPanelOpen ? "w-80" : "w-14"} p-3 pl-0`}>
            <div className="h-full rounded-xl overflow-hidden shadow-sm border border-border bg-card">
            <RightPanel
              simulationResult={currentResult}
              isLoading={isLoading}
              currentDashboard={tabs.find((t) => t.id === activeTabId)?.nodeId}
              isOpen={rightPanelOpen}
              onToggle={() => setRightPanelOpen(!rightPanelOpen)}
            />
            </div>
          </div>
        </div>
      </div>
    </ProductProvider>
  )
}

function simulatePremiumLocal(inputs: SimulationInputs): SimulationResult {
  const age = parseFloat(inputs.age) || 35
  const amount = parseFloat(inputs.amount) || 100000
  const insurancePeriod = parseFloat(inputs.insurancePeriod) || 20
  const paymentPeriod = parseFloat(inputs.paymentPeriod) || 20
  const riskRate = parseFloat(inputs.riskRate) / 100 || 0.035
  const expectedRate = parseFloat(inputs.expectedRate) / 100 || 0.025
  const maintenanceCost = parseFloat(inputs.maintenanceCost) / 100 || 0.05

  const ageFactor = 1 + (age - 30) * 0.02
  const periodFactor = insurancePeriod / paymentPeriod
  const riskFactor = 1 + riskRate * 2
  const randomVariation = 0.95 + Math.random() * 0.1
  const basePremium = amount * ageFactor * riskFactor * 0.08 * randomVariation
  const adjustedPremium = basePremium * periodFactor * (1 + maintenanceCost)
  const monthlyPremium = Math.round(adjustedPremium / 12 / 100) * 100
  const yearlyPremium = Math.round(adjustedPremium / 100) * 100
  const discountFactor = 1 / (1 + expectedRate)
  const pvFactor = (1 - Math.pow(discountFactor, insurancePeriod)) / expectedRate
  const vnb = Math.round(yearlyPremium * pvFactor * 0.15)

  return {
    premium: inputs.paymentMethod === "monthly" ? monthlyPremium : yearlyPremium,
    vnb,
    details: [
      { label: "PV 수익률 계산식", value: "PV = (CF/(1+r))-I" },
      { label: "CF", value: "현금흐름" },
      { label: "r", value: "할인율" },
      { label: "I", value: "초기 투자비용" },
    ],
  }
}
