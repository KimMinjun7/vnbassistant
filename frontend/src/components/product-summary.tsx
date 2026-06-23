
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useProduct } from "@/contexts/product-context"
import { Edit3, Package, Calendar, User, TrendingUp, Eye, FileText, ChevronRight, CheckCircle2, Calculator } from "lucide-react"
import { useState } from "react"

export function ProductSummary() {
  const { currentProduct, loadProduct } = useProduct()
  const [showPreview, setShowPreview] = useState(false)

  if (!currentProduct) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-background">
        <Card className="p-8 bg-card border-border border-dashed">
          <div className="text-center text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">상품을 선택해주세요</p>
          </div>
        </Card>
      </div>
    )
  }

  const handleEditProduct = () => {
    // Load product and navigate to product builder with data
    loadProduct(currentProduct.id)
    const event = new CustomEvent('navigate-to-dashboard', { 
      detail: { 
        dashboardId: 'product-builder',
        productId: currentProduct.id
      }
    })
    window.dispatchEvent(event)
  }

  const handleOpenVnbSimulator = () => {
    // Load product and navigate to VNB simulator with data
    loadProduct(currentProduct.id)
    const event = new CustomEvent('navigate-to-dashboard', { 
      detail: { 
        dashboardId: 'vnb-simulator',
        productId: currentProduct.id
      }
    })
    window.dispatchEvent(event)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-auto bg-background">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                {currentProduct.name}
                <Badge variant="outline" className="font-mono text-sm">
                  상품설계ID: {currentProduct.productCode || currentProduct.id.slice(-8)}
                </Badge>
              </h2>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="gap-2 border-primary text-primary hover:bg-primary/10"
            >
              <Eye className="h-4 w-4" />
              미리보기
            </Button>
            <Button
              onClick={handleEditProduct}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Edit3 className="h-4 w-4" />
              담보 구성 수정
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          상품 요약 정보 및 담보 구성 상세
        </p>
      </div>

      {/* Product Info Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">생성일자</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {formatDate(currentProduct.createdAt)}
          </p>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">상품 오너</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {currentProduct.owner}
          </p>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">분류</span>
          </div>
          <Badge 
            variant="secondary"
            className={`text-xs ${
              currentProduct.category === "헬스케어보장" ? "bg-blue-100 text-blue-800" :
              currentProduct.category === "종신보험" ? "bg-green-100 text-green-800" :
              currentProduct.category === "연금저축보험" ? "bg-purple-100 text-purple-800" :
              "bg-gray-100 text-gray-800"
            }`}
          >
            {currentProduct.category}
          </Badge>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">예상 VNB</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {currentProduct.estimatedVnb 
              ? `${currentProduct.estimatedVnb.toLocaleString()}억 원`
              : "미산출"}
          </p>
        </Card>
      </div>

      {/* Product Description */}
      <Card className="p-4 bg-card border-border mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-2">상품 개요</h3>
        <p className="text-sm text-muted-foreground">
          {currentProduct.description || "상품 설명이 없습니다."}
        </p>
      </Card>

      {/* Submitted Simulation Data - Only show if submitted */}
      {currentProduct.submittedSimulation && (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              승인된 수익성 분석 결과
            </h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleOpenVnbSimulator}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Calculator className="h-3 w-3" />
                VNB 시뮬레이션
              </Button>
              <Badge className="bg-primary text-primary-foreground">최종 제출</Badge>
            </div>
          </div>
          
          <Card className="p-4 bg-card border-border mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-primary font-semibold">
                {currentProduct.submittedSimulation.simulationId}
              </span>
              <span className="text-[10px] text-muted-foreground">
                제출일: {new Date(currentProduct.submittedSimulation.submittedAt).toLocaleString('ko-KR')}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-secondary p-3 rounded">
                <div className="text-xs text-muted-foreground mb-1">VNB</div>
                <div className="text-2xl font-bold text-primary">
                  +₩{(currentProduct.submittedSimulation.vnb / 1000).toFixed(1)}K
                </div>
              </div>
              <div className="bg-secondary p-3 rounded">
                <div className="text-xs text-muted-foreground mb-1">마진율</div>
                <div className="text-2xl font-bold text-green-600">
                  +{currentProduct.submittedSimulation.marginRate.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="bg-secondary/50 p-2 rounded">
                <div className="text-muted-foreground mb-1">위험률</div>
                <div className="font-semibold text-foreground">{currentProduct.submittedSimulation.riskRate.toFixed(1)}%</div>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <div className="text-muted-foreground mb-1">사업비</div>
                <div className="font-semibold text-foreground">{currentProduct.submittedSimulation.expense.toFixed(1)}%</div>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <div className="text-muted-foreground mb-1">해지율</div>
                <div className="font-semibold text-foreground">{currentProduct.submittedSimulation.lapseRate.toFixed(1)}%</div>
              </div>
              <div className="bg-secondary/50 p-2 rounded">
                <div className="text-muted-foreground mb-1">할인률</div>
                <div className="font-semibold text-foreground">{currentProduct.submittedSimulation.discountRate.toFixed(1)}%</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">영업 보험료:</span>
                <span className="font-semibold text-foreground">
                  ₩{currentProduct.submittedSimulation.premium.toLocaleString()} 원
                </span>
              </div>
            </div>
          </Card>

          <p className="text-xs text-muted-foreground">
            이 시뮬레이션은 상품기획자가 최종 승인한 수익성 분석 결과입니다.
          </p>
        </Card>
      )}

      {/* Submitted Documents Data */}
      {currentProduct.submittedDocuments && Object.keys(currentProduct.submittedDocuments).length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              제출된 최종 문서
            </h3>
            <Badge className="bg-green-600 text-white">승인됨</Badge>
          </div>
          <div className="space-y-3">
            {Object.entries(currentProduct.submittedDocuments).map(([key, doc]) => (
              <Card key={key} className="p-4 bg-card border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-semibold text-foreground">{doc.documentName}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    제출: {new Date(doc.submittedAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 pl-6">
                  최종 승인된 문서 데이터가 저장되었습니다.
                </div>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            총 {Object.keys(currentProduct.submittedDocuments).length}개의 문서가 최종 제출되었습니다.
          </p>
        </Card>
      )}

      {/* Document Generation Data */}
      {currentProduct.documentData && (
        <Card className="p-6 bg-card border-border mb-6">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            생성된 문서
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {currentProduct.documentData.generatedDocuments.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2 p-3 bg-secondary rounded border border-border">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-foreground">{doc}</span>
                <Badge variant="outline" className="ml-auto text-xs bg-transparent">완료</Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            생성 일시: {new Date(currentProduct.documentData.generatedAt).toLocaleString('ko-KR')}
          </p>
        </Card>
      )}

      {/* Coverage Blocks */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">담보 구성</h3>
        <div className="space-y-3">
          {currentProduct.blocks.map((block) => (
            <Card 
              key={block.id} 
              className="p-4 bg-secondary border-border"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        block.type === "main" ? "bg-blue-100 text-blue-800 border-blue-300" :
                        block.type === "rider" ? "bg-green-100 text-green-800 border-green-300" :
                        "bg-purple-100 text-purple-800 border-purple-300"
                      }`}
                    >
                      {block.type === "main" ? "주계약" : block.type === "rider" ? "특약" : "보험료 면제"}
                    </Badge>
                    <span className="font-medium text-foreground">{block.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">가입 금액: </span>
                      <span className="text-foreground font-medium">{block.coverage}원</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">가입 연령: </span>
                      <span className="text-foreground font-medium">
                        {block.ageMin}세 ~ {block.ageMax}세
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              상품 상세 미리보기
            </DialogTitle>
            <DialogDescription className="sr-only">
              상품의 상세 정보를 미리 볼 수 있습니다
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 p-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Home</span>
              <ChevronRight className="h-3 w-3" />
              <span>History</span>
              <ChevronRight className="h-3 w-3" />
              <span>{currentProduct.category}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{currentProduct.productCode}</span>
            </div>

            {/* Header Area - The Command Bar */}
            <Card className="p-6 bg-secondary border-border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {currentProduct.name} <span className="text-lg text-muted-foreground">(v1.0)</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground">
                      Product ID: <span className="font-mono font-semibold text-primary">{currentProduct.productCode}</span>
                    </span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      Status: Approved
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                    이 상품의 모든 로직/가정을 복사하여 새로운 상품설계ID를 생성합니다.
              </p>
            </Card>

            {/* Section A - Product Identity */}
            <Card className="p-6 bg-card border-border">
              <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                [Section A] Product Identity (기본 정보)
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2 font-medium text-foreground">3종 / 건강보험 / 갱신형</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Target Segment:</span>
                  <span className="ml-2 font-medium text-foreground">30~40세 여성 (Focus Group)</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sales Channel:</span>
                  <span className="ml-2 font-medium text-foreground">GA, TM, CM (Omni-channel)</span>
                </div>
              </div>
            </Card>

            {/* Section B - Key Logic & Structure */}
            <Card className="p-6 bg-card border-border">
              <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                [Section B] Key Logic & Structure (핵심 구조)
              </h4>
              <div className="space-y-3">
                <div className="bg-secondary p-3 rounded">
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">주계약:</span> 일반암 진단비 (5,000만 원)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">핵심 특약:</p>
                  <ul className="space-y-1 ml-4">
                    <li className="text-sm text-foreground">• 표적항암약물허가치료 (5,000만 원)</li>
                    <li className="text-sm text-foreground">• 다빈치로봇수술비 (1,000만 원)</li>
                  </ul>
                </div>
                <div className="bg-secondary p-3 rounded">
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">Rule Set:</span> Rule-2026-Cancer-Std (가입한도/연령 제한 로직)
                  </p>
                </div>
              </div>
            </Card>

            {/* Section C - Financial Performance */}
            <Card className="p-6 bg-card border-border">
              <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                [Section C] Financial Performance (수익성 지표)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <p className="text-xs text-muted-foreground mb-1">VNB (Total)</p>
                  <p className="text-lg font-bold text-green-700">154억 원</p>
                  <p className="text-xs text-muted-foreground">(마진율 +12.4%)</p>
                </div>
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <p className="text-xs text-muted-foreground mb-1">BEP (손익분기)</p>
                  <p className="text-lg font-bold text-blue-700">7년 차</p>
                  <p className="text-xs text-muted-foreground">(업계 평균 대비 1.5년 빠름)</p>
                </div>
                <div className="col-span-2 bg-secondary p-4 rounded">
                  <div className="text-sm flex items-center gap-2">
                    <span className="font-semibold text-foreground">Risk Score:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Low</Badge>
                    <span className="text-muted-foreground">(해지율 민감도 안정적)</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section D - Asset Link */}
            <Card className="p-6 bg-card border-border">
              <h4 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                [Section D] Asset Link (연계 문서)
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-secondary rounded hover:bg-secondary/80 cursor-pointer">
                  <FileText className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-foreground">사업방법서.pdf</span>
                  <Badge variant="outline" className="text-xs ml-auto">Generated</Badge>
                </div>
                <div className="flex items-center gap-2 p-2 bg-secondary rounded hover:bg-secondary/80 cursor-pointer">
                  <FileText className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-foreground">약관_v1.0.pdf</span>
                  <Badge variant="outline" className="text-xs ml-auto">Generated</Badge>
                </div>
                <div className="flex items-center gap-2 p-2 bg-secondary rounded hover:bg-secondary/80 cursor-pointer">
                  <FileText className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-foreground">산출기초서.pdf</span>
                  <Badge variant="outline" className="text-xs ml-auto">Generated</Badge>
                </div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
