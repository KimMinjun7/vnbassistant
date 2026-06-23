
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProduct } from "@/contexts/product-context"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Package, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"

export function ProductAnalysisList() {
  const { savedProducts, loadProduct } = useProduct()

  const recentProducts = [...savedProducts]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20)

  const handleViewProduct = (productId: string) => {
    loadProduct(productId)
    const event = new CustomEvent("navigate-to-dashboard", {
      detail: { dashboardId: "product-summary", productId },
    })
    window.dispatchEvent(event)
  }

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date))

  const profitabilityConfig = {
    high:   { label: "고수익", icon: TrendingUp,   className: "bg-green-100 text-green-800 border-green-300" },
    medium: { label: "중수익", icon: Minus,         className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    low:    { label: "저수익", icon: TrendingDown,  className: "bg-red-100 text-red-800 border-red-300" },
  }

  const categoryClassName: Record<string, string> = {
    "헬스케어보장":  "bg-blue-100 text-blue-800",
    "종신보험":      "bg-green-100 text-green-800",
    "연금저축보험":  "bg-purple-100 text-purple-800",
    "기타":          "bg-gray-100 text-gray-800",
  }

  // Summary stats
  const existingCount = recentProducts.filter(p => p.isExisting).length
  const newCount      = recentProducts.filter(p => !p.isExisting).length
  const lowProfitCount = recentProducts.filter(p => p.profitabilityStatus === "low").length

  return (
    <div className="h-full flex flex-col p-6 overflow-auto bg-background">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">상품 분석 히스토리</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          보유상품 및 신규 설계 상품 수익성 현황 (최대 20개)
        </p>

        {/* Summary row */}
        <div className="flex gap-4">
          {[
            { label: "보유상품", value: existingCount, className: "bg-primary/10 border-primary/30 text-primary" },
            { label: "신규 설계", value: newCount, className: "bg-secondary border-border text-muted-foreground" },
            { label: "수익성 개선 필요", value: lowProfitCount, icon: AlertTriangle, className: "bg-red-500/10 border-red-500/30 text-red-600" },
          ].map(({ label, value, icon: Icon, className }) => (
            <div key={label} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${className}`}>
              {Icon && <Icon className="h-4 w-4" />}
              <span className="text-sm font-semibold">{value}</span>
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {recentProducts.length === 0 ? (
        <Card className="flex-1 flex items-center justify-center bg-card border-border border-dashed">
          <div className="text-center text-muted-foreground p-8">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">저장된 상품이 없습니다</p>
            <p className="text-sm">상품 설계 도구에서 새로운 상품을 만들어보세요</p>
          </div>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">상품명</TableHead>
                <TableHead className="w-[160px]">상품설계ID (PDID)</TableHead>
                <TableHead className="w-[80px]">구분</TableHead>
                <TableHead className="w-[90px]">수익성</TableHead>
                <TableHead className="w-[80px] text-right">VNB</TableHead>
                <TableHead>개요</TableHead>
                <TableHead className="w-[110px]">등록일</TableHead>
                <TableHead className="w-[90px]">오너</TableHead>
                <TableHead className="w-[110px]">분류</TableHead>
                <TableHead className="w-[90px] text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentProducts.map((product) => {
                const profCfg = product.profitabilityStatus
                  ? profitabilityConfig[product.profitabilityStatus]
                  : null
                const ProfIcon = profCfg?.icon
                const issueCount = product.profitabilityIssues?.length ?? 0

                return (
                  <TableRow
                    key={product.id}
                    className={`hover:bg-secondary/50 ${product.profitabilityStatus === "low" ? "bg-red-500/5" : ""}`}
                  >
                    {/* Name */}
                    <TableCell className="font-medium text-foreground">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleViewProduct(product.id)}
                          className="text-primary hover:underline text-left leading-snug"
                        >
                          {product.name}
                        </button>
                        {product.profitabilityStatus === "low" && issueCount > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-[10px] text-red-500">{issueCount}개 이슈 발견</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* PDID */}
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {product.productCode || product.id.slice(-8).toUpperCase()}
                      </Badge>
                    </TableCell>

                    {/* 구분: 보유 vs 신규 */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${product.isExisting ? "border-primary/50 text-primary bg-primary/10" : "border-muted-foreground/40 text-muted-foreground"}`}
                      >
                        {product.isExisting ? "보유" : "신규"}
                      </Badge>
                    </TableCell>

                    {/* Profitability */}
                    <TableCell>
                      {profCfg && ProfIcon ? (
                        <Badge variant="outline" className={`text-xs gap-1 ${profCfg.className}`}>
                          <ProfIcon className="h-3 w-3" />
                          {profCfg.label}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* VNB */}
                    <TableCell className="text-right text-sm font-mono">
                      {product.estimatedVnb
                        ? <span className={product.estimatedVnb < 5000 ? "text-red-500" : product.estimatedVnb > 8000 ? "text-green-600" : "text-yellow-600"}>
                            {(product.estimatedVnb / 1000).toFixed(1)}K
                          </span>
                        : <span className="text-muted-foreground">-</span>
                      }
                    </TableCell>

                    {/* Description */}
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {product.description || `${product.blocks.length}개 담보 구성`}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(product.createdAt)}
                    </TableCell>

                    {/* Owner */}
                    <TableCell className="text-sm text-foreground">
                      {product.owner}
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${categoryClassName[product.category] ?? "bg-gray-100 text-gray-800"}`}>
                        {product.category}
                      </Badge>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProduct(product.id)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        확인
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
