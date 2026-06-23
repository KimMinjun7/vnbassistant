
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProduct, type SavedProduct } from "@/contexts/product-context"
import {
  Package,
  Calendar,
  User,
  Copy,
  FileText,
  Calculator,
  ChevronRight,
  BarChart2,
  Database,
  Target,
  Grid3x3,
  Brain,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProductDetailViewProps {
  productId: string
}

export function ProductDetailView({ productId }: ProductDetailViewProps) {
  const { savedProducts, loadProduct } = useProduct()
  const [product, setProduct] = useState<SavedProduct | null>(null)
  const [duplicated, setDuplicated] = useState(false)

  useEffect(() => {
    const foundProduct = savedProducts.find(p => p.id === productId)
    if (foundProduct) {
      setProduct(foundProduct)
    }
  }, [productId, savedProducts])

  const handleDuplicate = () => {
    if (!product) return
    
    // Load the product and trigger duplicate
    loadProduct(product.id)
    
    const event = new CustomEvent('duplicate-product', { 
      detail: { productId: product.id }
    })
    window.dispatchEvent(event)
    
    // Navigate to product builder
    setTimeout(() => {
      const navEvent = new CustomEvent('navigate-to-dashboard', { 
        detail: { dashboardId: 'product-builder' }
      })
      window.dispatchEvent(navEvent)
    }, 100)
    
    setDuplicated(true)
  }

  const navigateToVnbSimulator = () => {
    if (!product) return
    loadProduct(product.id)
    const event = new CustomEvent('navigate-to-dashboard', { 
      detail: { dashboardId: 'vnb-simulator' }
    })
    window.dispatchEvent(event)
  }

  const navigateToAutoDoc = () => {
    if (!product) return
    loadProduct(product.id)
    const event = new CustomEvent('navigate-to-dashboard', { 
      detail: { dashboardId: 'auto-doc' }
    })
    window.dispatchEvent(event)
  }

  const navigateToVnbDashboard = () => {
    if (!product) return
    loadProduct(product.id)
    const event = new CustomEvent('navigate-to-dashboard', {
      detail: { dashboardId: 'vnb-dashboard' }
    })
    window.dispatchEvent(event)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (!product) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center text-muted-foreground">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">상품을 찾을 수 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-auto bg-background gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-7 w-7 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">{product.name}</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(product.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {product.owner}
            </div>
            <Badge variant="outline" className="font-mono">
              {product.id.slice(-10).toUpperCase()}
            </Badge>
          </div>
        </div>
        <Button
          onClick={handleDuplicate}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Copy className="h-4 w-4 mr-2" />
          복제하여 새 상품 만들기
        </Button>
      </div>

      {/* Duplicate Alert */}
      {duplicated && (
        <Alert className="border-green-500 bg-green-500/10">
          <Copy className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            상품이 복사되었습니다. 상품 설계 도구로 이동하여 수정 후 저장하세요.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Info Cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">기본 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">상품 분류</span>
              <Badge 
                variant="secondary"
                className={`text-xs ${
                  product.category === "헬스케어보장" ? "bg-blue-100 text-blue-800" :
                  product.category === "종신보험" ? "bg-green-100 text-green-800" :
                  product.category === "연금저축보험" ? "bg-purple-100 text-purple-800" :
                  "bg-gray-100 text-gray-800"
                }`}
              >
                {product.category}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">담보 수</span>
              <span className="text-sm font-semibold text-foreground">{product.blocks.length}개</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">예상 VNB</span>
              <span className="text-sm font-semibold text-foreground">
                {product.estimatedVnb ? `₩${product.estimatedVnb.toLocaleString()}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">상품 오너</span>
              <span className="text-sm font-semibold text-foreground">{product.owner}</span>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">상품 개요</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description || "상품 설명이 없습니다."}
          </p>
        </Card>
      </div>

      {/* Coverage Blocks */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">담보 구성</h3>
        <div className="space-y-3">
          {product.blocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border"
            >
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    block.type === "main"
                      ? "default"
                      : block.type === "rider"
                        ? "secondary"
                        : "outline"
                  }
                  className="shrink-0"
                >
                  {block.type === "main" ? "주계약" : block.type === "rider" ? "특약" : "면책"}
                </Badge>
                <div>
                  <div className="font-medium text-foreground text-sm">{block.name}</div>
                  <div className="text-xs text-muted-foreground">
                    가입금액: ₩{Number.parseInt(block.coverage || "0").toLocaleString()} | 
                    가입연령: {block.ageMin}~{block.ageMax}세
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* VNB Assistant Dashboard Detail */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">VNB Assistant 대시보드 구현</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Agent 화면 공간의 VNB Assistant 영역에서 결산 실적과 예측 집계를 같은 조건으로 비교하고, 입력 조건별 VNB를 즉시 시각화합니다.
            </p>
          </div>
          <Button variant="outline" onClick={navigateToVnbDashboard} className="shrink-0">
            <BarChart2 className="h-4 w-4 mr-2" />
            대시보드 열기
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-5">
          {[
            { icon: Database, title: "VNB 결산 DB 집계", desc: "월·분기 결산 기준 실적 VNB, APE, 마진율을 집계합니다." },
            { icon: BarChart2, title: "동일가입조건 Assistant 집계", desc: "결산 DB와 같은 가입조건 키로 예측 VNB를 재집계합니다." },
            { icon: Target, title: "사용자 조건 예측·집계", desc: "보종·채널·연령·성별·가입금액 입력값으로 VNB를 예측합니다." },
            { icon: Grid3x3, title: "주요 판매속성별 히트맵", desc: "채널·상품·연령대별 수익성 집중 구간을 색상으로 표시합니다." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 rounded-lg border border-border bg-secondary/40">
              <Icon className="h-4 w-4 text-primary mb-3" />
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">결산 DB vs Assistant 집계</span>
              <Badge variant="outline" className="text-[10px]">동일가입조건</Badge>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: "VNB 결산 DB", value: "178억", tone: "text-muted-foreground" },
                { label: "VNB Assistant 예측", value: "184억", tone: "text-primary" },
                { label: "차이", value: "+6억 / MAPE 3.4%", tone: "text-green-600" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={`font-mono font-semibold ${row.tone}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">판매속성별 히트맵 예시</span>
              <Badge variant="outline" className="text-[10px]">채널 × 보종</Badge>
            </div>
            <div className="grid grid-cols-5 gap-1 text-[10px]">
              {["", "암", "종신", "연금", "건강"].map((h) => (
                <div key={h} className="text-center text-muted-foreground py-1">{h}</div>
              ))}
              {[
                ["GA", "92", "64", "38", "81"],
                ["방카", "71", "88", "52", "60"],
                ["TM", "58", "42", "74", "49"],
              ].flatMap((row) => row.map((cell, i) => (
                <div
                  key={`${row[0]}-${i}`}
                  className={`rounded py-1.5 text-center font-mono ${
                    i === 0 ? "text-muted-foreground" : Number(cell) >= 80 ? "bg-green-500/80 text-white" : Number(cell) >= 60 ? "bg-green-400/60 text-foreground" : Number(cell) >= 45 ? "bg-yellow-400/60 text-foreground" : "bg-red-400/50 text-foreground"
                  }`}
                >
                  {cell}
                </div>
              )))}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-base font-semibold text-foreground mb-4">다음 단계</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="justify-between bg-white hover:bg-blue-50 border-blue-300"
            onClick={navigateToVnbSimulator}
          >
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              VNB 시뮬레이터
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="justify-between bg-white hover:bg-blue-50 border-blue-300"
            onClick={navigateToAutoDoc}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              자동 문서 생성
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
