
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  GripVertical,
  Eye,
  Calculator,
  FileText,
  ArrowRight,
  Target,
} from "lucide-react"
import { useProduct, type ProductBlock } from "@/contexts/product-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

const AVAILABLE_BLOCKS = [
  { type: "main", name: "일반암 주계약", defaultCoverage: "50000000" },
  { type: "main", name: "고액암 주계약", defaultCoverage: "100000000" },
  { type: "rider", name: "표적항암치료 특약", defaultCoverage: "30000000" },
  { type: "rider", name: "암 진단비 특약", defaultCoverage: "20000000" },
  { type: "waiver", name: "납입면제 특약", defaultCoverage: "0" },
]

export function ProductSpecBuilder() {
  const { saveProduct, currentProduct } = useProduct()
  const [productName, setProductName] = useState("뉴 라이프 암보험")
  const [productCode, setProductCode] = useState("")
  const [selectedBlocks, setSelectedBlocks] = useState<ProductBlock[]>([])
  const [showValidation, setShowValidation] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [opportunityInfo, setOpportunityInfo] = useState<{
    productType: string
    targetAge: string
    expectedVnb: number
  } | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Sync with current product when loaded
  useEffect(() => {
    if (currentProduct) {
      setProductName(currentProduct.name)
      setProductCode(currentProduct.productCode || "")
      setSelectedBlocks(currentProduct.blocks || [])
      setIsSaved(!!currentProduct.productCode)
      console.log("[v0] Loaded product data into builder:", currentProduct.productCode, currentProduct.name)
    }
  }, [currentProduct])

  // Listen for opportunity data from portfolio heatmap and duplicate events
  useEffect(() => {
    const handleOpportunityLoad = (event: CustomEvent) => {
      const data = event.detail
      if (data?.productType && data?.targetAge) {
        setOpportunityInfo(data)
        // Auto-generate product name based on opportunity
        setProductName(`신규 ${data.productType} (${data.targetAge} 타겟)`)
        
        // Auto-add relevant blocks based on product type
        if (data.productType.includes("암")) {
          const cancerBlock = AVAILABLE_BLOCKS.find(b => b.name.includes("일반암"))
          if (cancerBlock) {
            setTimeout(() => addBlock(cancerBlock), 100)
          }
        } else if (data.productType.includes("뇌") || data.productType.includes("심장")) {
          // Could add brain/heart specific blocks
        }
      }
    }

    const handleDuplicate = (event: CustomEvent) => {
      const { productId } = event.detail
      if (productId && currentProduct && currentProduct.id === productId) {
        // Duplicate current product - copy all data
        setProductName(`${currentProduct.name} (복사본)`)
        setSelectedBlocks([...currentProduct.blocks])
        setOpportunityInfo(null)
        setIsSaved(false)
        setShowValidation(false)
      }
    }

    window.addEventListener('product-opportunity-data' as any, handleOpportunityLoad as any)
    window.addEventListener('duplicate-product' as any, handleDuplicate as any)
    
    return () => {
      window.removeEventListener('product-opportunity-data' as any, handleOpportunityLoad as any)
      window.removeEventListener('duplicate-product' as any, handleDuplicate as any)
    }
  }, [currentProduct])

  const addBlock = (blockTemplate: (typeof AVAILABLE_BLOCKS)[0]) => {
    const newBlock: ProductBlock = {
      id: `block-${Date.now()}`,
      type: blockTemplate.type as ProductBlock["type"],
      name: blockTemplate.name,
      coverage: blockTemplate.defaultCoverage,
      ageMin: "0",
      ageMax: "80",
      isValid: false,
      validationMessage: undefined,
    }

    // Validate against rules
    validateBlock(newBlock)
    setSelectedBlocks([...selectedBlocks, newBlock])
  }

  const validateBlock = (block: ProductBlock) => {
    const ageMax = Number.parseInt(block.ageMax)
    const ageMin = Number.parseInt(block.ageMin)

    // Simulated rule: max age for cancer insurance is 70
    if (block.name.includes("암") && ageMax > 70) {
      block.isValid = false
      block.validationMessage = "경고: 해당 담보의 Rule Definition상 최대 가입 나이는 70세입니다."
    } else if (ageMin >= ageMax) {
      block.isValid = false
      block.validationMessage = "최소 나이는 최대 나이보다 작아야 합니다."
    } else {
      block.isValid = true
      block.validationMessage = undefined
    }
  }

  const updateBlock = (
    id: string,
    field: keyof ProductBlock,
    value: string
  ) => {
    const updated = selectedBlocks.map((block) => {
      if (block.id === id) {
        const updatedBlock = { ...block, [field]: value }
        validateBlock(updatedBlock)
        return updatedBlock
      }
      return block
    })
    setSelectedBlocks(updated)
  }

  const removeBlock = (id: string) => {
    setSelectedBlocks(selectedBlocks.filter((b) => b.id !== id))
  }

  const handlePreview = () => {
    setShowPreview(true)
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

  const handleSubmitProduct = () => {
    if (!productName) return

    setShowValidation(true)
    const allValid = selectedBlocks.every((b) => b.isValid)
    if (!allValid || selectedBlocks.length === 0) return

    // Calculate estimated VNB based on coverage amounts
    const totalCoverage = selectedBlocks.reduce(
      (sum, block) => sum + Number.parseInt(block.coverage || "0"),
      0,
    )
    const estimatedVnb = Math.round(totalCoverage * 0.08) // 8% of total coverage as rough estimate

    // Generate product code only if it doesn't exist
    let codeToSave = productCode
    if (!productCode) {
      // Generate unique 상품설계ID (PDID, Product Design ID) with format PD-YYYYMMDD-HHmm
      const now = new Date()
      const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
      const timePart = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`
      codeToSave = `PD-${datePart}-${timePart}`
      setProductCode(codeToSave)
    }

    const saved = saveProduct({
      name: productName,
      productCode: codeToSave,
      blocks: selectedBlocks,
      estimatedVnb,
      category: "헬스케어보장",
      owner: "박재영",
      description: "AI 자동 생성 상품",
    })

    alert(`해당 상품명(${productName})/${codeToSave})가 확정되며 수정 불가합니다.`)

    // Navigate to product summary page
    const event = new CustomEvent('navigate-to-dashboard', {
      detail: {
        dashboardId: 'product-summary',
        productId: saved?.id ?? currentProduct?.id,
      }
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="h-full flex flex-col gap-4 p-6 overflow-auto bg-background">
      {/* Opportunity Info Banner */}
      {opportunityInfo && (
        <Alert className="border-primary/30 bg-primary/10">
          <Target className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <span className="font-semibold">포트폴리오 기회 발견:</span> {opportunityInfo.productType} ({opportunityInfo.targetAge}) 타겟 상품 설계 중. 예상 VNB: ₩{opportunityInfo.expectedVnb.toLocaleString()}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 flex-1 min-h-0">
      {/* Left Panel: Block Palette */}
      <Card className="w-64 p-4 bg-card border-border flex-shrink-0">
        <h3 className="text-lg font-semibold mb-3 text-foreground">담보 블록</h3>
        <p className="text-xs text-muted-foreground mb-4">
          드래그하여 우측에 추가하세요
        </p>

        <div className="space-y-2">
          {AVAILABLE_BLOCKS.map((block, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => addBlock(block)}
              className="w-full p-3 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-left transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {block.name}
                  </div>
                  <Badge
                    variant="outline"
                    className="mt-1 text-xs border-primary/50 text-primary"
                  >
                    {block.type === "main" && "주계약"}
                    {block.type === "rider" && "특약"}
                    {block.type === "waiver" && "면제"}
                  </Badge>
                </div>
                <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Center Panel: Product Design Canvas */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 p-6 bg-card border-border overflow-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 max-w-md">
                <Label className="text-sm text-muted-foreground mb-2">
                  상품명
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    disabled={!!productCode}
                    className={`bg-secondary border-border text-foreground text-lg font-semibold ${
                      productCode ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    placeholder="상품명을 입력하세요"
                  />
                  {productCode && (
                    <span className="text-sm font-mono text-primary whitespace-nowrap">
                      (상품설계ID: {productCode})
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitProduct}
                  disabled={selectedBlocks.length === 0}
                  className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>

            {/* Success Message */}
            {isSaved && (
              <Alert className="border-green-500 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-600 font-medium">
                  상품 설계가 저장되었습니다! 이제 VNB 시뮬레이터와 자동 문서 생성기에서 사용할 수 있습니다.
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Navigation */}
            {currentProduct && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  다음 단계
                </h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-white hover:bg-blue-50 border-blue-300"
                    onClick={() => {
                      // This would trigger navigation to VNB Simulator
                      const event = new CustomEvent('navigate-to-dashboard', { 
                        detail: { dashboardId: 'vnb-simulator' }
                      })
                      window.dispatchEvent(event)
                    }}
                  >
                    <Calculator className="h-3 w-3 mr-2" />
                    VNB 시뮬레이터
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-white hover:bg-blue-50 border-blue-300"
                    onClick={() => {
                      const event = new CustomEvent('navigate-to-dashboard', { 
                        detail: { dashboardId: 'auto-doc' }
                      })
                      window.dispatchEvent(event)
                    }}
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    자동 문서 생성
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Product Blocks */}
          <div className="space-y-4">
            {selectedBlocks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                <Plus className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm">
                  왼쪽 팔레트에서 담보 블록을 선택하여 추가하세요
                </p>
              </div>
            ) : (
              selectedBlocks.map((block, idx) => (
                <div key={block.id}>
                  <Card
                    className={`p-4 bg-secondary border-2 transition-colors ${
                      showValidation && !block.isValid
                        ? "border-destructive"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-6 cursor-move" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {idx + 1}.
                            </span>
                            <span className="text-base font-semibold text-foreground">
                              {block.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs border-primary/50 text-primary"
                            >
                              {block.type === "main" && "주계약"}
                              {block.type === "rider" && "특약"}
                              {block.type === "waiver" && "면제"}
                            </Badge>
                          </div>
                          <Button
                            onClick={() => removeBlock(block.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              가입금액 (원)
                            </Label>
                            <Input
                              value={block.coverage}
                              onChange={(e) =>
                                updateBlock(block.id, "coverage", e.target.value)
                              }
                              className="bg-background border-border text-foreground mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              최소 가입 나이
                            </Label>
                            <Input
                              value={block.ageMin}
                              onChange={(e) =>
                                updateBlock(block.id, "ageMin", e.target.value)
                              }
                              className="bg-background border-border text-foreground mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              최대 가입 나이
                            </Label>
                            <Input
                              value={block.ageMax}
                              onChange={(e) =>
                                updateBlock(block.id, "ageMax", e.target.value)
                              }
                              className="bg-background border-border text-foreground mt-1"
                            />
                          </div>
                        </div>

                        {/* Validation Message */}
                        {showValidation && !block.isValid && (
                          <Alert className="mt-3 border-destructive bg-destructive/10">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <AlertDescription className="text-destructive text-sm">
                              {block.validationMessage}
                            </AlertDescription>
                          </Alert>
                        )}

                        {showValidation && block.isValid && (
                          <div className="mt-3 flex items-center gap-2 text-green-500 text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>유효한 설정입니다</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Right Panel: AI Guidance */}
      <Card className="w-80 p-4 bg-card border-border flex-shrink-0 overflow-auto">
        <h3 className="text-lg font-semibold mb-3 text-foreground">
          AI 가이드
        </h3>

        <div className="space-y-3">
          <Alert className="border-primary/30 bg-primary/10">
            <AlertDescription className="text-sm text-foreground">
              <div className="font-semibold mb-1">포트폴리오 매핑</div>
              <p className="text-xs text-muted-foreground">
                현재 설계한 상품은 30-40대 여성 타겟 고액암 보장 영역에
                적합합니다. 기대 VNB: 8,200
              </p>
            </AlertDescription>
          </Alert>

          <div className="p-3 bg-secondary rounded-lg border border-border">
            <div className="text-sm font-medium text-foreground mb-2">
              Rule 검증 현황
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">가입 한도 확인 완료</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">사업비 구조 적용 완료</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">서비스 정보 로딩 완료</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-secondary rounded-lg border border-border">
            <div className="text-sm font-medium text-foreground mb-2">
              추천 설정
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">납입 기간:</span> 20년납
                권장
              </div>
              <div>
                <span className="font-medium text-foreground">보험 기간:</span> 80세
                만기
              </div>
              <div>
                <span className="font-medium text-foreground">위험률:</span> 3.5%
                적용
              </div>
            </div>
          </div>

          {selectedBlocks.length > 0 && (
            <div className="pt-3 border-t border-border">
              <div className="text-sm font-medium text-foreground mb-2">
                구성 요약
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>총 {selectedBlocks.length}개 담보 구��</div>
                <div>
                  주계약: {selectedBlocks.filter((b) => b.type === "main").length}
                  개
                </div>
                <div>
                  특약: {selectedBlocks.filter((b) => b.type === "rider").length}개
                </div>
                <div>
                  면제: {selectedBlocks.filter((b) => b.type === "waiver").length}개
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      </div>
    </div>
  )
}
