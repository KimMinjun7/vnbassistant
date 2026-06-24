
import { useEffect } from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  FileCheck,
  Package,
  Bot,
  Lightbulb,
  ArrowUpRight,
  Zap,
  Edit3,
  Save,
  FileType,
  Calculator,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useProduct } from "@/contexts/product-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface DocumentStatus {
  name: string
  status: "pending" | "generating" | "complete" | "error"
  progress: number
  aiGenerated: boolean
}

interface Document {
  title: string
  status: string
  description: string
  sections: {
    title: string
    content: string[]
  }[]
}

export function AutoDocGenerator() {
  const { savedProducts, currentProduct, loadProduct, updateProduct } = useProduct()
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

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

  const handleNavigateToVnbSimulator = () => {
    if (!currentProduct?.id) return
    const event = new CustomEvent('navigate-to-dashboard', { 
      detail: { 
        dashboardId: 'vnb-simulator',
        productId: currentProduct.id
      }
    })
    window.dispatchEvent(event)
  }

  const handleSubmitDocument = (documentIndex: number, documentName: string) => {
    if (!currentProduct?.id || !currentProduct?.productCode) {
      console.log("[v0] Cannot submit: No product or product code")
      return
    }

    // Get the current submitted documents or initialize empty object
    const submittedDocs = currentProduct.submittedDocuments || {}
    
    // Save the document data with submitted flag
    submittedDocs[`doc_${documentIndex}`] = {
      documentName,
      data: documentData,
      submittedAt: new Date(),
      submitted: true // Mark as officially submitted
    }

    updateProduct(currentProduct.id, {
      submittedDocuments: submittedDocs
    })

    // Mark document as complete in local state
    setDocuments((prev) =>
      prev.map((d, i) =>
        i === documentIndex ? { ...d, status: "complete" as const, progress: 100 } : d
      )
    )

    console.log("[v0] Submitted document:", documentName, "for product:", currentProduct.productCode)
    alert(`${documentName}가 제출되었습니다.`)
  }
  const [documents, setDocuments] = useState<DocumentStatus[]>([
    { name: "사업방법서", status: "pending", progress: 0, aiGenerated: true },
    { name: "보험약관", status: "pending", progress: 0, aiGenerated: true },
    { name: "상품설명서", status: "pending", progress: 0, aiGenerated: true },
    { name: "보험료율 산출서", status: "pending", progress: 0, aiGenerated: false },
    { name: "계리검증 보고서", status: "pending", progress: 0, aiGenerated: false },
  ])
  
  // Document data state for editing - all documents (default to 0 if no product code)
  const [documentData, setDocumentData] = useState({
    // 사업방법서 (0)
    minAge: "0",
    maxAge: "0",
    maturityAge: "0",
    paymentPeriods: "0",
    minCoverage: "0",
    maxCoverage: "0",
    generalCancerRate: "0",
    highCostCancerRate: "0",
    maxSurgeryAmount: "0",
    riskRate: "0",
    expectedInterestRate: "0",
    expectedExpenseRate: "0",
    riskSurcharge: "0",
    exemptionDays: "0",
    reductionYears: "0",
    reductionRate: "0",
    
    // 보험약관 (1)
    cancerDiagnosisRate: "0",
    exemptionPeriod: "0",
    reductionPeriod: "0",
    reductionPercent: "0",
    
    // 상품설명서 (2)
    targetAge: "0",
    renewalAge: "0",
    renewalPremium: "0",
    renewalIncrease: "0",
    
    // 보험료율 산출서 (3)
    mortalityTable: "0",
    riskTableYear: "0",
    safetyMargin: "0",
    regulationRate: "0",
    contractExpense: "0",
    maintenanceExpense: "0",
    
    // 계리검증 보고서 (4)
    productCode: "0",
    vnbAmount: "0",
    profitMargin: "0",
    targetMargin: "0",
    lapseImpact: "0",
    lossImpact: "0",
  })

  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState<number>(0)

  // Sync document completion status from submitted documents
  useEffect(() => {
    if (currentProduct?.submittedDocuments) {
      setDocuments((prev) =>
        prev.map((doc, idx) => {
          const docData = currentProduct.submittedDocuments?.[`doc_${idx}`]
          // Only mark as complete if explicitly submitted
          return docData?.submitted
            ? { ...doc, status: "complete" as const, progress: 100 }
            : doc
        })
      )
    }
  }, [currentProduct?.submittedDocuments])

  // Populate document data from product blocks and VNB submission
  useEffect(() => {
    if (currentProduct?.productCode && currentProduct?.blocks) {
      const blocks = currentProduct.blocks
      const vnbData = currentProduct.submittedSimulation
      
      // Calculate min/max ages from blocks
      const ages = blocks.map(b => ({
        min: parseInt(b.ageMin) || 0,
        max: parseInt(b.ageMax) || 0
      })).filter(a => a.min > 0 && a.max > 0)
      
      const minAge = ages.length > 0 ? Math.min(...ages.map(a => a.min)) : 0
      const maxAge = ages.length > 0 ? Math.max(...ages.map(a => a.max)) : 0
      
      // Get coverage amounts
      const coverages = blocks.map(b => parseInt(b.coverage) || 0).filter(c => c > 0)
      const minCoverage = coverages.length > 0 ? Math.min(...coverages) : 0
      const maxCoverage = coverages.length > 0 ? Math.max(...coverages) : 0
      
      // Main contract and riders info
      const mainContracts = blocks.filter(b => b.type === "main")
      const riders = blocks.filter(b => b.type === "rider")
      
      setDocumentData({
        // 사업방법서 (0)
        minAge: minAge.toString(),
        maxAge: maxAge.toString(),
        maturityAge: (maxAge + 10).toString(),
        paymentPeriods: "10년/15년/20년",
        minCoverage: (minCoverage / 10000).toString() + "만원",
        maxCoverage: (maxCoverage / 10000).toString() + "만원",
        generalCancerRate: mainContracts.find(m => m.name.includes("일반암"))?.coverage ? "100" : "0",
        highCostCancerRate: mainContracts.find(m => m.name.includes("고액암"))?.coverage ? "150" : "0",
        maxSurgeryAmount: riders.find(r => r.name.includes("항암"))?.coverage ? "500" : "0",
        riskRate: vnbData?.riskRate?.toFixed(2) || "0",
        expectedInterestRate: vnbData?.discountRate?.toFixed(2) || "0",
        expectedExpenseRate: vnbData?.expense?.toFixed(2) || "0",
        riskSurcharge: "10",
        exemptionDays: "90",
        reductionYears: "2",
        reductionRate: "50",
        
        // 보험약관 (1)
        cancerDiagnosisRate: "100",
        exemptionPeriod: "90",
        reductionPeriod: "1",
        reductionPercent: "50",
        
        // 상품설명서 (2)
        targetAge: minAge >= 30 && maxAge <= 50 ? "3040" : "전연���",
        renewalAge: "40",
        renewalPremium: vnbData?.premium ? (vnbData.premium / 10000).toFixed(0) : "0",
        renewalIncrease: "1.8",
        
        // 보험료율 산출서 (3)
        mortalityTable: "KIDI-2024",
        riskTableYear: "2026",
        safetyMargin: "95",
        regulationRate: vnbData?.discountRate?.toFixed(2) || "2.25",
        contractExpense: "350",
        maintenanceExpense: vnbData?.expense?.toFixed(1) || "5.0",
        
        // 계리검증 보고서 (4)
        productCode: currentProduct.productCode,
        vnbAmount: vnbData?.vnb ? (vnbData.vnb / 1000).toFixed(0) : "0",
        profitMargin: vnbData?.marginRate?.toFixed(1) || "0",
        targetMargin: "10",
        lapseImpact: vnbData?.lapseRate ? (-vnbData.lapseRate).toFixed(0) : "0",
        lossImpact: "-25",
      })
      
      console.log("[v0] Populated document data from product:", currentProduct.productCode)
    }
  }, [currentProduct?.productCode, currentProduct?.blocks, currentProduct?.submittedSimulation])

  const handleSaveDocumentData = () => {
    if (!currentProduct?.id) return
    
    setIsEditMode(false)
    
    // Save the updated document data to product (without marking as submitted)
    const submittedDocs = currentProduct.submittedDocuments || {}
    const existingDoc = submittedDocs[`doc_${selectedDocumentIndex}`]
    
    submittedDocs[`doc_${selectedDocumentIndex}`] = {
      documentName: documents[selectedDocumentIndex]?.name || '',
      data: documentData,
      submittedAt: existingDoc?.submittedAt,
      submitted: existingDoc?.submitted || false // Keep existing submitted status
    }
    
    updateProduct(currentProduct.id, {
      submittedDocuments: submittedDocs
    })
    
    console.log("[v0] Updated document data:", documents[selectedDocumentIndex]?.name)
    alert("문서 내용이 업데이트되었습니다.")
  }

  const startGeneration = () => {
    setIsGenerating(true)

    // Simulate document generation
    documents.forEach((doc, idx) => {
      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((d, i) =>
            i === idx ? { ...d, status: "generating" as const } : d
          )
        )

        // Simulate progress
        const progressInterval = setInterval(() => {
          setDocuments((prev) =>
            prev.map((d, i) => {
              if (i === idx && d.progress < 100) {
                return { ...d, progress: Math.min(d.progress + 10, 100) }
              }
              return d
            })
          )
        }, 150)

        setTimeout(() => {
          clearInterval(progressInterval)
          setDocuments((prev) =>
            prev.map((d, i) =>
              i === idx
                ? { ...d, status: "complete" as const, progress: 100 }
                : d
            )
          )

          if (idx === documents.length - 1) {
            setIsGenerating(false)
            
            // Save document generation data to current product
            if (currentProduct?.id) {
              updateProduct(currentProduct.id, {
                documentData: {
                  generatedDocuments: documents.map(d => d.name),
                  generatedAt: new Date(),
                }
              })
            }
          }
        }, 2000)
      }, idx * 2200)
    })
  }

  const completedCount = documents.filter((d) => d.status === "complete").length
  const totalCount = documents.length

  // Generate contextual AI recommendations
  const generateAIRecommendations = () => {
    const recommendations = []

    if (!currentProduct) {
      return [{
        priority: "high",
        title: "상품 설계 필요",
        message: "문서 생성을 위해 먼저 상품을 설계하고 저장해야 합니다.",
        action: "상품 설계 도구에서 담보 구성 및 저장"
      }]
    }

    if (completedCount === 0) {
      recommendations.push({
        priority: "high",
        title: "문서 생성 시작 준비 완료",
        message: `${currentProduct.name} (${currentProduct.blocks.length}개 담보) 기반으로 ${totalCount}개 문서를 자동 생성합니다.`,
        action: "문서 생성 버튼을 눌러 시작하세요"
      })
      
      recommendations.push({
        priority: "medium",
        title: "AI 생성 문서 3종",
        message: "사업방법서, 보험약관, 상품설명서는 AI������� 자동 작성합니다. 평균 생성 시간 30초.",
        action: "생성 후 검증 결과 탭에서 법규 준수 확인"
      })
    } else if (completedCount < totalCount) {
      recommendations.push({
        priority: "medium",
        title: `문서 생성 진행 중 (${completedCount}/${totalCount})`,
        message: "AI가 상품 사양서를 분석하여 규제 요구사항에 맞는 문서를 생성하고 있습니다.",
        action: "생성 완료까지 대기"
      })
    } else {
      recommendations.push({
        priority: "high",
        title: "문서 생성 완료",
        message: `${totalCount}개 문서가 모두 생성되었습니다. 검증 결과를 확인하세요.`,
        action: "검증 결과 탭에서 법규 준수 여부 확인"
      })

      recommendations.push({
        priority: "medium",
        title: "제출 서류 준비 완료",
        message: "생성된 문서를 다운로드하여 금융감독원 제출 준비가 완료되었습니다.",
        action: "각 문서를 다운로드하여 내부 검토 진행"
      })

      recommendations.push({
        priority: "low",
        title: "상품 수정 시 재생성 필요",
        message: "상품 설계를 변경하면 문서를 다시 생성해야 합니다.",
        action: "VNB 시뮬레이터에서 수익성 최적화 검토"
      })
    }

    return recommendations
  }

  const aiRecommendations = generateAIRecommendations()

  return (
    <div className="h-full flex gap-4 p-6 overflow-auto bg-background">
      {/* Left Panel: Controls */}
      <Card className="w-80 flex-shrink-0 bg-card border-border overflow-visible">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              문서 생성
            </h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateToProductBuilder}
                disabled={!currentProduct?.productCode}
                className="h-7 w-7 p-0"
                title="상품 설계 도구"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateToVnbSimulator}
                disabled={!currentProduct?.productCode}
                className="h-7 w-7 p-0"
                title="VNB 시뮬레이터"
              >
                <Calculator className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Product Selection */}
          {savedProducts.length > 0 ? (
            <div className="mb-6 pb-4 border-b border-border">
              <Label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" />
                상품 선택
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
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentProduct && (
                <div className="mt-2 p-3 bg-primary/10 border border-primary/30 rounded text-xs space-y-1">
                  <div className="font-semibold text-foreground">
                    {currentProduct.name}
                  </div>
                  {currentProduct.productCode && (
                    <div className="font-mono text-primary text-[10px]">
                      상품설계ID: {currentProduct.productCode}
                    </div>
                  )}
                  <div className="text-muted-foreground">
                    {currentProduct.blocks.length}개 담보 구성
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Alert className="mb-4 border-yellow-500/30 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 text-xs">
                상품 설계 도구에서 먼저 상품을 설계하고 저장��세요.
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={startGeneration}
            disabled={isGenerating || !currentProduct}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                문서 생성 시작
              </>
            )}
          </Button>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">완료된 문서</span>
            <Badge variant="outline" className="border-primary/50 text-primary">
              {completedCount}/{totalCount}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          {documents.map((doc, idx) => (
            <Card
              key={idx}
              className={`p-3 border-2 transition-colors cursor-pointer ${
                doc.status === "complete"
                  ? "bg-green-500/10 border-green-500/30"
                  : doc.status === "generating"
                    ? "bg-primary/10 border-primary/30"
                    : doc.status === "error"
                      ? "bg-destructive/10 border-destructive/30"
                      : "bg-secondary border-border"
              }`}
              onClick={() => setSelectedDocumentIndex(idx)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {doc.status === "complete" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : doc.status === "generating" ? (
                    <Clock className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                  ) : doc.status === "error" ? (
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {doc.name}
                      </span>
                      {doc.aiGenerated && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1 border-primary/50 text-primary flex-shrink-0"
                        >
                          AI
                        </Badge>
                      )}
                    </div>
                    {doc.status === "generating" && (
                      <div className="flex items-center gap-2">
                        <Progress value={doc.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground flex-shrink-0">{doc.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {doc.status === "complete" && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <FileType className="h-5 w-5 text-red-500" />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs bg-transparent hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        alert(`${doc.name} PDF 다운로드`)
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {completedCount === totalCount && totalCount > 0 && (
          <Alert className="mt-4 border-green-500/30 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-sm text-foreground">
              모든 문서 생성이 완료되었습니다!
            </AlertDescription>
          </Alert>
        )}

        {/* AI Recommendations */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              AI 추천
            </h4>
            <p className="text-[10px] text-muted-foreground mt-1">
              문서 생성 상태 기반 Next Action 추천
            </p>
          </div>

          <div className="space-y-3">
            {aiRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  rec.priority === 'high'
                    ? 'bg-red-500/10 border-red-500/30'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-4 ${
                      rec.priority === 'high'
                        ? 'border-red-500 text-red-500'
                        : rec.priority === 'medium'
                        ? 'border-yellow-500 text-yellow-500'
                        : 'border-blue-500 text-blue-500'
                    }`}
                  >
                    {rec.priority === 'high' ? '긴급' : rec.priority === 'medium' ? '중요' : '검토'}
                  </Badge>
                  <Lightbulb className={`h-3 w-3 ${
                    rec.priority === 'high'
                      ? 'text-red-500'
                      : rec.priority === 'medium'
                      ? 'text-yellow-500'
                      : 'text-blue-500'
                  }`} />
                </div>

                <h4 className="text-xs font-semibold text-foreground mb-1">
                  {rec.title}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                  {rec.message}
                </p>

                <div className="flex items-start gap-2 p-2 bg-background/50 rounded border border-border">
                  <ArrowUpRight className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[10px] font-medium text-muted-foreground mb-0.5">
                      추천 액션
                    </div>
                    <div className="text-[11px] text-foreground">
                      {rec.action}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Center Panel: Preview */}
      <Card className="flex-1 p-4 bg-card border-border overflow-auto min-w-0">
        {/* Product Header */}
        {currentProduct && (
          <div className="mb-4 p-4 bg-secondary rounded-lg border border-border">
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
          </div>
        )}
        
        <Tabs defaultValue="preview" className="h-full flex flex-col">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="preview">문서 미리보기</TabsTrigger>
            <TabsTrigger value="validation">검증 결과</TabsTrigger>
            <TabsTrigger value="comparison">버전 비교</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 mt-4 overflow-auto">
            <div className="prose prose-invert max-w-none">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {documents[selectedDocumentIndex].name} (자동 생성)
                  </h3>
                  {selectedDocumentIndex === 1 && (
                    <div className="text-xs text-muted-foreground">
                      문서 상태: Draft (v1.0) | 특이사항: 표적항암 정의 최신 개정 반영됨
                    </div>
                  )}
                  {selectedDocumentIndex === 2 && (
                    <div className="text-xs text-muted-foreground">
                      문서 상태: Review Needed | 타겟: 소비자 (3040 세대)
                    </div>
                  )}
                  {selectedDocumentIndex === 3 && (
                    <div className="text-xs text-muted-foreground">
                      문서 상태: Calculated | 검증: Math Engine Verified
                    </div>
                  )}
                  {selectedDocumentIndex === 4 && (
                    <div className="text-xs text-muted-foreground">
                      문서 상태: Passed | VNB 마진: High (12.4%)
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {isEditMode ? (
                    <Button 
                      size="sm" 
                      onClick={handleSaveDocumentData}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      저장하기
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsEditMode(true)}
                        disabled={!currentProduct?.productCode}
                        className="border-primary text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        문서 수정
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitDocument(selectedDocumentIndex, documents[selectedDocumentIndex]?.name || '')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={!currentProduct?.productCode}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Submit
                      </Button>
                    </>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    AI Generated
                  </div>
                </div>
              </div>

              {selectedDocumentIndex === 1 && (
                <>
                  <Alert className="mb-4 border-blue-500/30 bg-blue-500/10">
                    <FileCheck className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-sm text-foreground">
                      고객과의 법적 계약 내용. 분쟁 소지가 없도록 AI가 표준 약관과 비교하여 작성했습니다.
                    </AlertDescription>
                  </Alert>

                  <Card className="p-4 bg-secondary border-border text-sm mb-4">
                    <h4 className="font-semibold text-foreground mb-3">
                      [제3관 보험금의 지급]
                    </h4>
                    <div className="text-foreground/90 leading-relaxed space-y-2">
                      <p className="font-medium">제15조 (암 진단비의 지급)</p>
                      <p>
                        회사는 피보험자가 보험기간 중 보장개시일 이후에 '암'으로 진단 확정되었을 때, 최초 1회에 한하여 가입금액의{" "}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.cancerDiagnosisRate}
                            onChange={(e) => setDocumentData({...documentData, cancerDiagnosisRate: e.target.value})}
                            className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="font-semibold text-primary">{documentData.cancerDiagnosisRate}</span>
                        )}
                        %를 지급한다.
                      </p>
                      <p>
                        단, 계약일로부터{" "}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.exemptionPeriod}
                            onChange={(e) => setDocumentData({...documentData, exemptionPeriod: e.target.value})}
                            className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="font-semibold text-primary">{documentData.exemptionPeriod}</span>
                        )}
                        일이 지난 다음 날부터 보장하며(면책기간),{" "}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.reductionPeriod}
                            onChange={(e) => setDocumentData({...documentData, reductionPeriod: e.target.value})}
                            className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="font-semibold text-primary">{documentData.reductionPeriod}</span>
                        )}
                        년 미만 진단 시{" "}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.reductionPercent}
                            onChange={(e) => setDocumentData({...documentData, reductionPercent: e.target.value})}
                            className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="font-semibold text-primary">{documentData.reductionPercent}</span>
                        )}
                        %를 감액 지급한다.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 bg-secondary border-border text-sm mb-4">
                    <h4 className="font-semibold text-foreground mb-3">
                      [제5관 특약 사항 - 표적항암약물허가치료]
                    </h4>
                    <div className="text-foreground/90 leading-relaxed space-y-2">
                      <p className="font-medium">제24조 (정의)</p>
                      <p>
                        '표적항암약물허가치료'라 함은 암세포의 특정 분자를 표적하는 약물을 사용하여 식약처 허가 범위 내에서 투여하는 것을 말하며, 호르몬 치료 등은 제외한다.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        (관련 법규: Ref-K2025-Onco-03 준용)
                      </p>
                    </div>
                  </Card>
                </>
              )}

              {selectedDocumentIndex === 2 && (
                <>
                  <Alert className="mb-4 border-blue-500/30 bg-blue-500/10">
                    <FileCheck className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-sm text-foreground">
                      고객에게 보여지는 핵심 요약본. 불완전 판매 방지를 위해 주의사항이 강조되어 있습니다.
                    </AlertDescription>
                  </Alert>

                  <Card className="p-4 bg-secondary border-border text-sm mb-4">
                    <h4 className="font-semibold text-foreground mb-3">
                      [핵심 상품 특징]
                    </h4>
                    <div className="text-foreground/90 leading-relaxed space-y-2">
                      <p>
                        <span className="font-medium">•{" "}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.targetAge}
                            onChange={(e) => setDocumentData({...documentData, targetAge: e.target.value})}
                            className="inline-block w-20 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="text-primary">{documentData.targetAge}</span>
                        )}
                        {" "}맞춤 설계:</span> 초기 보험료 부담을 낮추고, 암 발병률이 급증하는 구간에 보장을 집중했습니다.
                      </p>
                      <p>
                        <span className="font-medium">• 최신 의료기술 보장:</span> 고가의 '표적항암치료', '카티(CAR-T) 항암치료'까지 든든하게 보장합니다.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 bg-secondary border-border text-sm mb-4">
                    <h4 className="font-semibold text-foreground mb-3">
                      [가입 시 유의사항 (필수 설명)]
                    </h4>
                    <div className="text-foreground/90 leading-relaxed space-y-3">
                      <div>
                        <p className="font-medium mb-1">갱신형 상품 안내:</p>
                        <p>
                          이 상품은 갱신형으로 운영되며, 갱신 시 피보험자의 나이 증가 및 위험률 상승에 따라 보험료가 인상될 수 있습니다.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          (예시:{" "}
                          {isEditMode ? (
                            <input
                              type="text"
                              value={documentData.renewalAge}
                              onChange={(e) => setDocumentData({...documentData, renewalAge: e.target.value})}
                              className="inline-block w-12 px-1 py-0 bg-background border border-primary rounded text-center"
                            />
                          ) : (
                            <span className="font-semibold text-primary">{documentData.renewalAge}</span>
                          )}
                          세 가입 시{" "}
                          {isEditMode ? (
                            <input
                              type="text"
                              value={documentData.renewalPremium}
                              onChange={(e) => setDocumentData({...documentData, renewalPremium: e.target.value})}
                              className="inline-block w-12 px-1 py-0 bg-background border border-primary rounded text-center"
                            />
                          ) : (
                            <span className="font-semibold text-primary">{documentData.renewalPremium}</span>
                          )}
                          만 원 → 50세 갱신 시{" "}
                          {isEditMode ? (
                            <input
                              type="text"
                              value={documentData.renewalIncrease}
                              onChange={(e) => setDocumentData({...documentData, renewalIncrease: e.target.value})}
                              className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                            />
                          ) : (
                            <span className="font-semibold text-primary">{documentData.renewalIncrease}</span>
                          )}
                          만 원 예상)
                        </p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">해지환급금 예시:</p>
                        <p>
                          본 상품은 무배당 순수보장형으로, 만기 시 환급금이 없거나 납입한 보험료보다 적을 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {selectedDocumentIndex === 3 && (
                <>
                  <Alert className="mb-4 border-blue-500/30 bg-blue-500/10">
                    <FileCheck className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-sm text-foreground">
                      계리 수식과 적용 기초율이 명시된 기술 문서입니다. (가장 복잡한 부분이나 AI가 자동 매핑함)
                    </AlertDescription>
                  </Alert>

                  <Card className="p-4 bg-secondary border-border text-sm mb-4">
                    <h4 className="font-semibold text-foreground mb-3">
                      [1. 적용 기초율]
                    </h4>
                    <div className="text-foreground/90 leading-relaxed space-y-2">
                      <p>
                        <span className="font-medium">• ��정 사망률:</span> 제10회 경험생명표(
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.mortalityTable}
                            onChange={(e) => setDocumentData({...documentData, mortalityTable: e.target.value})}
                            className="inline-block w-24 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="text-primary font-semibold">{documentData.mortalityTable}</span>
                        )}
                        ) 남/녀 구분 적용
                      </p>
                      <p>
                        <span className="font-medium">• 예정 위험률:</span> Risk-Table-
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.riskTableYear}
                            onChange={(e) => setDocumentData({...documentData, riskTableYear: e.target.value})}
                            className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="text-primary font-semibold">{documentData.riskTableYear}</span>
                        )}
                        -CA (암발생률) *{" "}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.safetyMargin}
                            onChange={(e) => setDocumentData({...documentData, safetyMargin: e.target.value})}
                            className="inline-block w-12 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="text-primary font-semibold">{documentData.safetyMargin}</span>
                        )}
                        % (안전할증 미반영)
                      </p>
                      <p>
                        <span className="font-medium">• 예정 이율:</span> 연{" "}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.regulationRate}
                            onChange={(e) => setDocumentData({...documentData, regulationRate: e.target.value})}
                            className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="text-primary font-semibold">{documentData.regulationRate}</span>
                        )}
                        % (감독규정 Reg-2026-Interest 준수)
                      </p>
                      <p>
                        <span className="font-medium">• 예정 사업비:</span>
                      </p>
                      <div className="ml-6 space-y-1">
                        <p>- 계약체결비(α):{" "}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.contractExpense}
                            onChange={(e) => setDocumentData({...documentData, contractExpense: e.target.value})}
                            className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="text-primary font-semibold">{documentData.contractExpense}</span>
                        )}
                        % (표준해약환급금 내)</p>
                        <p>- 유지비(β): 보험료의{" "}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.maintenanceExpense}
                            onChange={(e) => setDocumentData({...documentData, maintenanceExpense: e.target.value})}
                            className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="text-primary font-semibold">{documentData.maintenanceExpense}</span>
                        )}
                        %</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-secondary border-border text-sm mb-4">
                    <h4 className="font-semibold text-foreground mb-3">
                      [2. 보험료 산출식 (공식)]
                    </h4>
                    <div className="text-foreground/90 leading-relaxed space-y-3">
                      <div className="bg-background/50 p-4 rounded border border-border text-center">
                        <p className="text-base">
                          $$P_x = \frac{'{ A_x + \\alpha \\cdot \\ddot{a}_{x:\\overline{m}|} + \\gamma \\cdot \\ddot{a}_{x:\\overline{n}|} }'}{'{ \\ddot{a}_{x:\\overline{n}|} - \\beta\' }'}$$
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        (주: 위 LaTeX 수식은 시스템에서 표준 기수법(Commutation Function)을 적용��여 자동 생성됨)
                      </p>
                    </div>
                  </Card>
                </>
              )}

              {selectedDocumentIndex === 4 && (
                <>
                  <Alert className="mb-4 border-green-500/30 bg-green-500/10">
                    <FileCheck className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-sm text-foreground">
                      박 부장님이 경영진 보고 때 들고 가실 <span className="font-semibold">'내부 감사용 성적표'</span>입니다.
                    </AlertDescription>
                  </Alert>

                  <Card className="p-4 bg-secondary border-border text-sm mb-4">
                    <h4 className="font-semibold text-foreground mb-3">
                      [검증 개요]
                    </h4>
                    <div className="text-foreground/90 leading-relaxed space-y-2">
                      <p>
                        <span className="font-medium">대상 상품:</span>{" "}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.productCode}
                            onChange={(e) => setDocumentData({...documentData, productCode: e.target.value})}
                            className="inline-block w-32 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="text-primary font-semibold">{documentData.productCode}</span>
                        )}
                        {" "}(뉴 라이프 암보험)
                      </p>
                      <p>
                        <span className="font-medium">검증 일시:</span> 2026.02.06 20:15:33 (By AI Actuary Agent)
                      </p>
                    </div>
                  </Card>

                  <Card className="p-4 bg-secondary border-border text-sm mb-4">
                    <h4 className="font-semibold text-foreground mb-3">
                      [수익성 및 리스크 분석 결과]
                    </h4>
                    <div className="text-foreground/90 leading-relaxed space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">• VNB (신계약 가치):</span>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.vnbAmount}
                            onChange={(e) => setDocumentData({...documentData, vnbAmount: e.target.value})}
                            className="inline-block w-20 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="text-green-500 font-bold">{documentData.vnbAmount}</span>
                        )}
                        <span className="text-green-500 font-bold">억 원</span>
                        <span className="text-xs text-muted-foreground">(예상 판매량 1만 건 기준)</span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">• Profit Margin:</span>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.profitMargin}
                            onChange={(e) => setDocumentData({...documentData, profitMargin: e.target.value})}
                            className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="text-green-500 font-bold">{documentData.profitMargin}</span>
                        )}
                        <span className="text-green-500 font-bold">%</span>
                        <span className="text-xs text-green-600">(목표{" "}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.targetMargin}
                            onChange={(e) => setDocumentData({...documentData, targetMargin: e.target.value})}
                            className="inline-block w-12 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          documentData.targetMargin
                        )}
                        % 상회 → Pass)</span>
                      </div>

                      <div>
                        <p className="font-medium mb-2">• Sensitivity Test (민감도 분석):</p>
                        <div className="ml-6 space-y-2 bg-background/50 p-3 rounded border border-border">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm">해지율 10% 상승 시:</span>
                            <span className="text-yellow-600 font-medium">VNB{" "}
                            {isEditMode ? (
                              <input
                                type="text"
                                value={documentData.lapseImpact}
                                onChange={(e) => setDocumentData({...documentData, lapseImpact: e.target.value})}
                                className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                              />
                            ) : (
                              documentData.lapseImpact
                            )}
                            억 원</span>
                            <span className="text-xs text-muted-foreground">(허용 범위 내)</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm">손해율 10% 상승 시:</span>
                            <span className="text-orange-600 font-medium">VNB{" "}
                            {isEditMode ? (
                              <input
                                type="text"
                                value={documentData.lossImpact}
                                onChange={(e) => setDocumentData({...documentData, lossImpact: e.target.value})}
                                className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                              />
                            ) : (
                              documentData.lossImpact
                            )}
                            억 원</span>
                            <span className="text-xs text-orange-600">(Warning: 손해율 관리에 주의 요망)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">• 현금흐름(CF) 검증:</span>
                        <span className="text-green-600">보험기간{" "}
                        {isEditMode ? (
                          <input
                            type="text"
                            value={documentData.maxAge}
                            onChange={(e) => setDocumentData({...documentData, maxAge: e.target.value})}
                            className="inline-block w-16 px-1 py-0 bg-background border border-primary rounded text-center"
                          />
                        ) : (
                          <span className="font-semibold">{documentData.maxAge}</span>
                        )}
                        세까지 적립금 결손 구간 없음</span>
                        <Badge variant="outline" className="border-green-500 text-green-500 text-xs bg-transparent">Pass</Badge>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {selectedDocumentIndex === 0 && (
                <Card className="p-4 bg-secondary border-border text-sm">
                  <h4 className="font-semibold text-foreground mb-2">
                    1. 상품 개요
                  </h4>
                  <p className="text-foreground/90 leading-relaxed mb-4">
                    본 상품은 암 진단 및 치료에 따른 경제적 부담을 경감하기 위한
                    보장성 보험입니다. 일반암, 고액암 진단 시 보험금을 지급하며,
                    표적항암치료 등 최신 치료법에 대한 보장을 포함합니다.
                  </p>
                </Card>
              )}

              {selectedDocumentIndex === 0 && (
                <Card className="p-4 bg-secondary border-border text-sm">
                  <h4 className="font-semibold text-foreground mb-2">
                    편집 가능 필드 (수정 가능)
                  </h4>

                  <h4 className="font-semibold text-foreground mb-2">
                    2. 주요 보장 내용
                  </h4>
                  <ul className="list-disc list-inside text-foreground/90 space-y-1 mb-4">
                    <li className="flex items-center gap-2">
                      일반암 진단비: 가입금액의 
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={documentData.generalCancerRate}
                          onChange={(e) => setDocumentData({...documentData, generalCancerRate: e.target.value})}
                          className="w-16 h-6 px-2 text-xs inline-block mx-1"
                        />
                      ) : (
                        <span className="font-semibold">{documentData.generalCancerRate}</span>
                      )}
                      %
                    </li>
                    <li className="flex items-center gap-2">
                      고액암 진단비: 가입금액의 
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={documentData.highCostCancerRate}
                          onChange={(e) => setDocumentData({...documentData, highCostCancerRate: e.target.value})}
                          className="w-16 h-6 px-2 text-xs inline-block mx-1"
                        />
                      ) : (
                        <span className="font-semibold">{documentData.highCostCancerRate}</span>
                      )}
                      %
                    </li>
                    <li className="flex items-center gap-2">
                      표적항암치료비: 실손보상 방식
                    </li>
                    <li className="flex items-center gap-2">
                      암 수술비: 회당 최대 
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={documentData.maxSurgeryAmount}
                          onChange={(e) => setDocumentData({...documentData, maxSurgeryAmount: e.target.value})}
                          className="w-20 h-6 px-2 text-xs inline-block mx-1"
                        />
                      ) : (
                        <span className="font-semibold">{documentData.maxSurgeryAmount}</span>
                      )}
                      만원
                    </li>
                  </ul>

                  <h4 className="font-semibold text-foreground mb-2">
                    3. 가입 조건
                  </h4>
                  <div className="text-foreground/90 space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-24">가입 연령:</span> 
                      만 {isEditMode ? (
                        <Input
                          type="number"
                          value={documentData.minAge}
                          onChange={(e) => setDocumentData({...documentData, minAge: e.target.value})}
                          className="w-16 h-6 px-2 text-xs inline-block"
                        />
                      ) : (
                        <span className="font-semibold">{documentData.minAge}</span>
                      )}
                      세 ~ {isEditMode ? (
                        <Input
                          type="number"
                          value={documentData.maxAge}
                          onChange={(e) => setDocumentData({...documentData, maxAge: e.target.value})}
                          className="w-16 h-6 px-2 text-xs inline-block"
                        />
                      ) : (
                        <span className="font-semibold">{documentData.maxAge}</span>
                      )}
                      세
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-24">보험 기간:</span> 
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={documentData.maturityAge}
                          onChange={(e) => setDocumentData({...documentData, maturityAge: e.target.value})}
                          className="w-16 h-6 px-2 text-xs inline-block"
                        />
                      ) : (
                        <span className="font-semibold">{documentData.maturityAge}</span>
                      )}
                      세 만기
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-24">납입 기간:</span> 
                      {isEditMode ? (
                        <Input
                          value={documentData.paymentPeriods}
                          onChange={(e) => setDocumentData({...documentData, paymentPeriods: e.target.value})}
                          className="w-40 h-6 px-2 text-xs inline-block"
                        />
                      ) : (
                        <span>{documentData.paymentPeriods}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-24">가입 금액:</span> 
                      {isEditMode ? (
                        <>
                          <Input
                            value={documentData.minCoverage}
                            onChange={(e) => setDocumentData({...documentData, minCoverage: e.target.value})}
                            className="w-24 h-6 px-2 text-xs inline-block"
                          />
                          ~ 
                          <Input
                            value={documentData.maxCoverage}
                            onChange={(e) => setDocumentData({...documentData, maxCoverage: e.target.value})}
                            className="w-24 h-6 px-2 text-xs inline-block"
                          />
                        </>
                      ) : (
                        <span>{documentData.minCoverage} ~ {documentData.maxCoverage}</span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-semibold text-foreground mb-2">
                    4. 보험료 산출 기초
                  </h4>
                  <div className="text-foreground/90 space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-32">위험률:</span> 
                      {isEditMode ? (
                        <Input
                          value={documentData.riskRate}
                          onChange={(e) => setDocumentData({...documentData, riskRate: e.target.value})}
                          className="flex-1 h-6 px-2 text-xs"
                        />
                      ) : (
                        <span>{documentData.riskRate}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-32">예정이율:</span> 
                      연 {isEditMode ? (
                        <Input
                          type="number"
                          step="0.1"
                          value={documentData.expectedInterestRate}
                          onChange={(e) => setDocumentData({...documentData, expectedInterestRate: e.target.value})}
                          className="w-20 h-6 px-2 text-xs inline-block"
                        />
                      ) : (
                        <span className="font-semibold">{documentData.expectedInterestRate}</span>
                      )}
                      %
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-32">예정사업비율:</span> 
                      {isEditMode ? (
                        <Input
                          type="number"
                          step="0.1"
                          value={documentData.expectedExpenseRate}
                          onChange={(e) => setDocumentData({...documentData, expectedExpenseRate: e.target.value})}
                          className="w-20 h-6 px-2 text-xs inline-block"
                        />
                      ) : (
                        <span className="font-semibold">{documentData.expectedExpenseRate}</span>
                      )}
                      %
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium w-32">예정위험률할증:</span> 
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={documentData.riskSurcharge}
                          onChange={(e) => setDocumentData({...documentData, riskSurcharge: e.target.value})}
                          className="w-20 h-6 px-2 text-xs inline-block"
                        />
                      ) : (
                        <span className="font-semibold">{documentData.riskSurcharge}</span>
                      )}
                      %
                    </div>
                  </div>

                  <h4 className="font-semibold text-foreground mb-2">
                    5. 면책 및 감액 규정
                  </h4>
                  <p className="text-foreground/90 leading-relaxed mb-2 flex items-center gap-1 flex-wrap">
                    계약일로부터 
                    {isEditMode ? (
                      <Input
                        type="number"
                        value={documentData.exemptionDays}
                        onChange={(e) => setDocumentData({...documentData, exemptionDays: e.target.value})}
                        className="w-16 h-6 px-2 text-xs inline-block mx-1"
                      />
                    ) : (
                      <span className="font-semibold mx-1">{documentData.exemptionDays}</span>
                    )}
                    일 이내 암 진단 시 면책 적용. 계약일로부터
                    {isEditMode ? (
                      <Input
                        type="number"
                        value={documentData.reductionYears}
                        onChange={(e) => setDocumentData({...documentData, reductionYears: e.target.value})}
                        className="w-16 h-6 px-2 text-xs inline-block mx-1"
                      />
                    ) : (
                      <span className="font-semibold mx-1">{documentData.reductionYears}</span>
                    )}
                    년 이내 일반암 진단 시 
                    {isEditMode ? (
                      <Input
                        type="number"
                        value={documentData.reductionRate}
                        onChange={(e) => setDocumentData({...documentData, reductionRate: e.target.value})}
                        className="w-16 h-6 px-2 text-xs inline-block mx-1"
                      />
                    ) : (
                      <span className="font-semibold mx-1">{documentData.reductionRate}</span>
                    )}
                    % 감액 지급.
                  </p>

                  <h4 className="font-semibold text-foreground mb-2">
                    6. 해지환급금
                  </h4>
                  <p className="text-foreground/90 leading-relaxed">
                    본 상품은 순수보장성 상품으로 보험료 납입 기간 중 해지
                    시 해지환급금이 없거나 매우 적습니다. 납입 완료 후 해지 시
                    납입 보험료의 일부를 환급합니다.
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="validation" className="flex-1 mt-4 overflow-auto">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                AI 검증 결과
              </h3>

              <Alert className="border-green-500/30 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-sm text-foreground">
                  <div className="font-semibold mb-1">법규 준수 검증 통과</div>
                  <div className="text-xs text-muted-foreground">
                    보험업법, 약관심사기준, 상품개발 가이드라인 준수 확인
                  </div>
                </AlertDescription>
              </Alert>

              <Alert className="border-green-500/30 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-sm text-foreground">
                  <div className="font-semibold mb-1">용어 정합성 검증 통과</div>
                  <div className="text-xs text-muted-foreground">
                    약관 용어와 사업방법서 용어 일치 확인
                  </div>
                </AlertDescription>
              </Alert>

              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-sm text-foreground">
                  <div className="font-semibold mb-1">주의 사항 1개</div>
                  <div className="text-xs text-muted-foreground">
                    면책기간 90일은 업계 평균보다 길어 마케팅 시 불리할 수
                    있습니다.
                  </div>
                </AlertDescription>
              </Alert>

              <Card className="p-4 bg-secondary border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  상세 검증 항목
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">
                      가입 나이 범위 검증
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">
                      보험금 지급 한도 검증
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">
                      보험료 산출 로직 검증
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">
                      면책/감액 규정 검증
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">
                      해지환급금 산출 검증
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="flex-1 mt-4 overflow-auto">
            <div className="text-center py-16 text-muted-foreground">
              <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                이전 버전과 ��교할 문서를 선택하세요
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
