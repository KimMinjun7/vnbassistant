
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, TrendingUp, Target, AlertTriangle, ArrowUpRight, Lightbulb, ChevronRight, BarChart3 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useProduct, type ProfitabilityIssue } from "@/contexts/product-context"

interface HeatmapCell {
  row: string
  col: string
  vnb: number | null
  profitability: "high" | "medium" | "low" | "empty"
  category?: string
  existingProductId?: string   // links to a pre-registered product
  isExisting?: boolean
}

const ageGroups = ["20대", "30대", "40대", "50대", "60대", "70대+"]
const productTypes = ["일반암보험", "고액암보험", "뇌/심장보험", "종신보험", "연금보험"]

// Deterministic heatmap data — 3 existing products anchor specific cells;
// other cells are static to avoid hydration issues.
const HEATMAP_DATA: HeatmapCell[] = [
  // 일반암보험
  { row: "일반암보험", col: "20대", vnb: 6200, profitability: "medium", category: "헬스케어보장" },
  { row: "일반암보험", col: "30대", vnb: 7800, profitability: "medium", category: "헬스케어보장" },
  { row: "일반암보험", col: "40대", vnb: 9200, profitability: "high",   category: "헬스케어보장", existingProductId: "PD_EXIST_001", isExisting: true },
  { row: "일반암보험", col: "50대", vnb: 4200, profitability: "low",    category: "헬스케어보장" },
  { row: "일반암보험", col: "60대", vnb: null, profitability: "empty",  category: "헬스케어보장" },
  { row: "일반암보험", col: "70대+", vnb: null, profitability: "empty", category: "헬스케어보장" },
  // 고액암보험
  { row: "고액암보험", col: "20대", vnb: null, profitability: "empty",  category: "헬스케어보장" },
  { row: "고액암보험", col: "30대", vnb: 5100, profitability: "medium", category: "헬스케어보장" },
  { row: "고액암보험", col: "40대", vnb: 8600, profitability: "high",   category: "헬스케어보장" },
  { row: "고액암보험", col: "50대", vnb: 7200, profitability: "medium", category: "헬스케어보장" },
  { row: "고액암보험", col: "60대", vnb: null, profitability: "empty",  category: "헬스케어보장" },
  { row: "고액암보험", col: "70대+", vnb: null, profitability: "empty", category: "헬스케어보장" },
  // 뇌/심장보험
  { row: "뇌/심장보험", col: "20대", vnb: null, profitability: "empty",  category: "헬스케어보장" },
  { row: "뇌/심장보험", col: "30대", vnb: 4800, profitability: "low",    category: "헬스케어보장" },
  { row: "뇌/심장보험", col: "40대", vnb: 6500, profitability: "medium", category: "헬스케어보장" },
  { row: "뇌/심장보험", col: "50대", vnb: 7100, profitability: "medium", category: "헬스케어보장" },
  { row: "뇌/심장보험", col: "60대", vnb: 3800, profitability: "low",    category: "헬스케어보장" },
  { row: "뇌/심장보험", col: "70대+", vnb: null, profitability: "empty", category: "헬스케어보장" },
  // 종신보험
  { row: "종신보험", col: "20대", vnb: null, profitability: "empty",  category: "종신보험" },
  { row: "종신보험", col: "30대", vnb: 5400, profitability: "medium", category: "종신보험" },
  { row: "종신보험", col: "40대", vnb: 6100, profitability: "medium", category: "종신보험" },
  { row: "종신보험", col: "50대", vnb: 3100, profitability: "low",    category: "종신보험", existingProductId: "PD_EXIST_002", isExisting: true },
  { row: "종신보험", col: "60대", vnb: null, profitability: "empty",  category: "종신보험" },
  { row: "종신보험", col: "70대+", vnb: null, profitability: "empty", category: "종신보험" },
  // 연금보험
  { row: "연금보험", col: "20대", vnb: 4600, profitability: "low",    category: "연금저축보험" },
  { row: "연금보험", col: "30대", vnb: 5800, profitability: "medium", category: "연금저축보험", existingProductId: "PD_EXIST_003", isExisting: true },
  { row: "연금보험", col: "40대", vnb: 6900, profitability: "medium", category: "연금저축보험" },
  { row: "연금보험", col: "50대", vnb: 4100, profitability: "low",    category: "연금저축보험" },
  { row: "연금보험", col: "60대", vnb: null, profitability: "empty",  category: "연금저축보험" },
  { row: "연금보험", col: "70대+", vnb: null, profitability: "empty", category: "연금저축보험" },
]

export function PortfolioHeatmap() {
  const { savedProducts, loadProduct, duplicateProduct } = useProduct()
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null)

  const getCellData = (product: string, age: string) =>
    HEATMAP_DATA.find((c) => c.row === product && c.col === age)

  const getCellColor = (cell: HeatmapCell) => {
    const base = {
      high:   "bg-green-500/20 hover:bg-green-500/30 border-green-500/40",
      medium: "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/40",
      low:    "bg-red-500/20 hover:bg-red-500/30 border-red-500/40",
      empty:  "bg-muted hover:bg-muted/80 border-muted-foreground/20",
    }[cell.profitability]
    return cell.isExisting ? `${base} ring-2 ring-primary/60` : base
  }

  // Opportunity alerts: low-profit existing + empty cells
  const lowProfitCells = HEATMAP_DATA.filter(c => c.profitability === "low" && c.isExisting)
  const emptyCells = HEATMAP_DATA.filter(c => c.profitability === "empty").slice(0, 3)
  const alerts = [...lowProfitCells, ...emptyCells]

  // Resolve existing product from context
  const getExistingProduct = (id?: string) =>
    id ? savedProducts.find(p => p.id === id) : undefined

  const selectedProduct = selectedCell?.existingProductId
    ? getExistingProduct(selectedCell.existingProductId)
    : undefined

  const handleImproveProduct = (productId: string) => {
    loadProduct(productId)
    const dup = duplicateProduct(productId)
    if (dup) {
      const event = new CustomEvent("navigate-to-dashboard", {
        detail: { dashboardId: "product-builder", productId: dup.id },
      })
      window.dispatchEvent(event)
    }
  }

  const severityColor: Record<string, string> = {
    high:   "text-red-500 border-red-500/40 bg-red-500/10",
    medium: "text-yellow-500 border-yellow-500/40 bg-yellow-500/10",
    low:    "text-blue-500 border-blue-500/40 bg-blue-500/10",
  }
  const severityLabel: Record<string, string> = { high: "심각", medium: "주의", low: "검토" }

  return (
    <div className="h-full flex flex-col p-6 overflow-auto bg-background">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">전략적 포트폴리오 히트맵</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              보유상품 수익성 현황 및 신규 기회 발견 — 테두리 셀은 등록된 보유상품
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm flex-wrap">
          {[
            { color: "bg-green-500/30 border-green-500/40", label: "고수익 (VNB >8,000)" },
            { color: "bg-yellow-500/30 border-yellow-500/40", label: "중수익 (VNB 5,000-8,000)" },
            { color: "bg-red-500/30 border-red-500/40", label: "저수익 (VNB <5,000)" },
            { color: "bg-muted border-muted-foreground/20", label: "상품 공백" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${color} border rounded`} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted border-2 border-primary/60 rounded" />
            <span className="text-muted-foreground">보유상품</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Heatmap Grid */}
        <Card className="flex-1 p-4 bg-card border-border overflow-auto">
          <div className="grid gap-2 min-w-[560px]">
            {/* Header Row */}
            <div className="grid grid-cols-7 gap-2">
              <div />
              {ageGroups.map((age) => (
                <div key={age} className="text-sm font-semibold text-center text-foreground">
                  {age}
                </div>
              ))}
            </div>

            {/* Data Rows */}
            <TooltipProvider>
              {productTypes.map((product) => (
                <div key={product} className="grid grid-cols-7 gap-2">
                  <div className="text-sm font-medium text-foreground flex items-center pr-2">
                    {product}
                  </div>
                  {ageGroups.map((age) => {
                    const cell = getCellData(product, age)
                    if (!cell) return <div key={age} />
                    return (
                      <Tooltip key={`${product}-${age}`}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={`h-16 rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${getCellColor(cell)}`}
                            onClick={() => setSelectedCell(cell)}
                          >
                            {cell.vnb !== null ? (
                              <>
                                <span className="text-xs font-semibold text-foreground">
                                  ₩{(cell.vnb / 1000).toFixed(1)}K
                                </span>
                                {cell.isExisting && (
                                  <span className="text-[9px] text-primary font-medium leading-none">보유</span>
                                )}
                                {!cell.isExisting && <TrendingUp className="h-3 w-3 text-muted-foreground" />}
                              </>
                            ) : (
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover border-border">
                          <div className="text-xs space-y-1">
                            <div className="font-semibold">{product}</div>
                            {cell.category && <div className="text-primary text-[10px]">[{cell.category}]</div>}
                            <div className="text-muted-foreground">{age}</div>
                            {cell.vnb !== null ? (
                              <div>VNB: ₩{cell.vnb.toLocaleString()}</div>
                            ) : (
                              <div className="text-yellow-500">상품 공백 구간</div>
                            )}
                            {cell.isExisting && (
                              <div className="text-primary font-medium">등록된 보유상품</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </TooltipProvider>
          </div>
        </Card>

        {/* Right Panel */}
        <div className="w-80 flex flex-col gap-4 overflow-auto">

          {/* Opportunity / Issue Alerts */}
          <Card className="p-4 bg-card border-border flex-shrink-0">
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              기회 발견 알림
            </h3>
            <div className="space-y-3">
              {alerts.map((cell, idx) => {
                const isLow = cell.profitability === "low" && cell.isExisting
                const ep = getExistingProduct(cell.existingProductId)
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${isLow ? "bg-red-500/10 border-red-500/30" : "bg-primary/10 border-primary/30"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${isLow ? "border-red-500/50 text-red-500" : "border-primary/50 text-primary"}`}
                      >
                        {isLow ? "수익성 개선 필요" : "신규 기회"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{cell.col}</span>
                    </div>
                    <div className="text-xs font-medium text-foreground">
                      {ep ? ep.name : cell.row}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {isLow
                        ? `VNB ₩${cell.vnb?.toLocaleString()} — ${ep?.profitabilityIssues?.[0]?.factor ?? ""} 등 ${ep?.profitabilityIssues?.length ?? 0}개 원인 발견`
                        : `${cell.col} ${cell.row} 구간 상품 부재. 진입 시 VNB 7,000+ 기대`}
                    </p>
                    <Button
                      size="sm"
                      className={`w-full mt-2 text-xs h-7 ${isLow ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                      onClick={() => {
                        if (isLow && cell.existingProductId) {
                          // Show analysis for this cell
                          setSelectedCell(cell)
                        } else {
                          const event = new CustomEvent("navigate-to-dashboard", {
                            detail: { dashboardId: "product-builder" },
                          })
                          window.dispatchEvent(event)
                        }
                      }}
                    >
                      {isLow ? "원인 분석 보기" : "신규 상품 기획"}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Cause Analysis Panel — shown when a low-profit existing product is selected */}
          {selectedCell && selectedProduct && (
            <Card className="p-4 bg-card border-border flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-semibold text-foreground">수익성 저하 원인 분석</h3>
              </div>

              {/* Product info */}
              <div className="mb-3 p-2 bg-secondary rounded-lg">
                <div className="text-xs font-semibold text-foreground">{selectedProduct.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {selectedProduct.productCode} · {selectedCell.col} · VNB ₩{selectedCell.vnb?.toLocaleString()}
                </div>
              </div>

              {/* Issues */}
              {selectedProduct.profitabilityIssues && selectedProduct.profitabilityIssues.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {selectedProduct.profitabilityIssues.map((issue: ProfitabilityIssue, i: number) => (
                    <div key={i} className={`p-3 rounded-lg border ${severityColor[issue.severity]}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[9px] h-4 ${severityColor[issue.severity]}`}>
                          {severityLabel[issue.severity]}
                        </Badge>
                        <span className="text-xs font-semibold">{issue.factor}</span>
                        <span className="text-[10px] ml-auto font-mono">
                          {issue.impact > 0 ? "+" : ""}{issue.impact}억
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed mb-2">{issue.description}</p>
                      <div className="flex items-start gap-1.5 p-2 bg-background/60 rounded border border-border">
                        <Lightbulb className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-foreground leading-relaxed">{issue.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mb-4">분석된 이슈가 없습니다.</p>
              )}

              {/* CTA */}
              <Button
                size="sm"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => handleImproveProduct(selectedProduct.id)}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                개선하여 신규 상품 설계
              </Button>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                현재 상품을 복사하여 상품 설계 도구로 이동합니다
              </p>
            </Card>
          )}

          {/* Plain cell info when non-existing cell selected */}
          {selectedCell && !selectedProduct && (
            <Card className="p-4 bg-card border-border flex-shrink-0">
              <h4 className="text-sm font-semibold mb-2 text-foreground">선택한 구간 정보</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div><span className="font-medium text-foreground">상품:</span> {selectedCell.row}</div>
                <div><span className="font-medium text-foreground">연령대:</span> {selectedCell.col}</div>
                <div>
                  <span className="font-medium text-foreground">VNB:</span>{" "}
                  {selectedCell.vnb !== null ? `₩${selectedCell.vnb.toLocaleString()}` : "상품 없음"}
                </div>
                <div>
                  <span className="font-medium text-foreground">수익성:</span>{" "}
                  {{ high: "고수익", medium: "중수익", low: "저수익", empty: "공백 구간" }[selectedCell.profitability]}
                </div>
              </div>
              {selectedCell.profitability === "empty" && (
                <Button
                  size="sm"
                  className="w-full mt-3 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    const event = new CustomEvent("navigate-to-dashboard", {
                      detail: { dashboardId: "product-builder" },
                    })
                    window.dispatchEvent(event)
                  }}
                >
                  이 구간 신규 상품 기획
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
