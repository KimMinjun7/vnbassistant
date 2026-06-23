
import React, { createContext, useContext, useState, type ReactNode } from "react"

export interface ProductBlock {
  id: string
  type: "main" | "rider" | "waiver"
  name: string
  coverage: string
  ageMin: string
  ageMax: string
  isValid?: boolean
  validationMessage?: string
}

export interface ProfitabilityIssue {
  factor: string          // e.g. "위험률", "사업비", "해지율"
  severity: "high" | "medium" | "low"
  description: string
  impact: number          // VNB impact in 억원
  recommendation: string
}

export interface SavedProduct {
  id: string
  name: string
  productCode?: string
  blocks: ProductBlock[]
  createdAt: Date
  estimatedVnb?: number
  owner: string
  description: string
  category: "헬스케어보장" | "종신보험" | "연금저축보험" | "기타"
  // Existing product management fields
  isExisting?: boolean            // true = 보유상품, false/undefined = 신규 설계
  profitabilityStatus?: "high" | "medium" | "low"
  profitabilityIssues?: ProfitabilityIssue[]
  targetAgeGroup?: string         // e.g. "30대"
  productType?: string            // e.g. "일반암보험"
  vnbSimulationData?: {
    baseScenario: any
    conservativeScenario: any
    aggressiveScenario: any
    calculatedAt: Date
  }
  submittedSimulation?: {
    simulationId: string
    riskRate: number
    expense: number
    lapseRate: number
    discountRate: number
    vnb: number
    marginRate: number
    premium: number
    submittedAt: Date
  }
  simulationHistory?: Array<{
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
  }>
  documentData?: {
    generatedDocuments: string[]
    generatedAt: Date
  }
  submittedDocuments?: {
    [key: string]: {
      documentName: string
      data: any
      submittedAt: Date
      submitted?: boolean
    }
  }
  // Improvement recommendations from source product (when duplicated for improvement)
  improvementRecommendations?: ProfitabilityIssue[]
  sourceProductId?: string   // The original product this was derived from
}

interface ProductContextType {
  savedProducts: SavedProduct[]
  currentProduct: SavedProduct | null
  saveProduct: (product: Omit<SavedProduct, 'id' | 'createdAt'>) => SavedProduct
  loadProduct: (productId: string) => void
  deleteProduct: (productId: string) => void
  duplicateProduct: (productId: string) => SavedProduct | null
  updateProduct: (productId: string, updates: Partial<SavedProduct>) => void
  setCurrentProduct: (product: SavedProduct | null) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

// ─── 3 Pre-registered existing products ───────────────────────────────────────
const EXISTING_PRODUCTS: SavedProduct[] = [
  {
    id: "PD_EXIST_001",
    name: "건강든든암보험 2023",
    productCode: "PD-20230101-0900",
    isExisting: true,
    profitabilityStatus: "high",
    targetAgeGroup: "40대",
    productType: "일반암보험",
    category: "헬스케어보장",
    owner: "김민준",
    description: "40~50대 주력 일반암 보장 상품. 업계 최고 수준 VNB 유지 중.",
    createdAt: new Date("2023-01-01"),
    estimatedVnb: 9200,
    profitabilityIssues: [],
    blocks: [
      { id: "b1", type: "main", name: "일반암 진단비", coverage: "50000000", ageMin: "30", ageMax: "60" },
      { id: "b2", type: "rider", name: "고액암 추가 진단비", coverage: "30000000", ageMin: "30", ageMax: "60" },
      { id: "b3", type: "waiver", name: "보험료 납입면제", coverage: "0", ageMin: "30", ageMax: "60" },
    ],
    submittedSimulation: {
      simulationId: "SIM-2023-001",
      riskRate: 95.2,
      expense: 12.5,
      lapseRate: 4.1,
      discountRate: 2.5,
      vnb: 9200,
      marginRate: 18.4,
      premium: 85000,
      submittedAt: new Date("2023-01-15"),
    },
  },
  {
    id: "PD_EXIST_002",
    name: "통합종신보험 플러스",
    productCode: "PD-20210301-0900",
    isExisting: true,
    profitabilityStatus: "low",
    targetAgeGroup: "50대",
    productType: "종신보험",
    category: "종신보험",
    owner: "이수진",
    description: "50~60대 대상 종신보험. 최근 저금리·고해지율로 VNB 급락 중.",
    createdAt: new Date("2021-03-01"),
    estimatedVnb: 3100,
    profitabilityIssues: [
      {
        factor: "해지율",
        severity: "high",
        description: "50대 계약자 해지율이 예정률 대비 32% 초과. 저축성 전환 수요 급증이 원인.",
        impact: -28,
        recommendation: "납입면제 강화 및 중도인출 기능 추가로 유지율 개선 필요",
      },
      {
        factor: "할인율(금리)",
        severity: "high",
        description: "상품 설계 당시 3.5% 적용 금리가 현재 2.1%로 하락. 적립금 운용 수익 감소.",
        impact: -41,
        recommendation: "변액 연계 옵션 또는 금리연동형 구조로 전환 검토",
      },
      {
        factor: "사업비",
        severity: "medium",
        description: "오프라인 채널 의존도 높아 사업비율 경쟁사 대비 3.2%p 높음.",
        impact: -15,
        recommendation: "디지털 채널 전환으로 사업비 절감 및 온라인 전용 상품 설계 고려",
      },
    ],
    blocks: [
      { id: "b1", type: "main", name: "사망보험금", coverage: "100000000", ageMin: "40", ageMax: "65" },
      { id: "b2", type: "rider", name: "재해사망 추가보장", coverage: "50000000", ageMin: "40", ageMax: "65" },
      { id: "b3", type: "rider", name: "CI(치명적질병) 보장", coverage: "30000000", ageMin: "40", ageMax: "65" },
    ],
    submittedSimulation: {
      simulationId: "SIM-2021-003",
      riskRate: 101.8,
      expense: 18.7,
      lapseRate: 9.3,
      discountRate: 2.1,
      vnb: 3100,
      marginRate: 6.2,
      premium: 320000,
      submittedAt: new Date("2021-03-15"),
    },
  },
  {
    id: "PD_EXIST_003",
    name: "노후안심연금보험",
    productCode: "PD-20220601-0900",
    isExisting: true,
    profitabilityStatus: "medium",
    targetAgeGroup: "30대",
    productType: "연금보험",
    category: "연금저축보험",
    owner: "박재영",
    description: "30~40대 노후 준비용 연금 상품. 안정적이나 성장 정체 구간 진입.",
    createdAt: new Date("2022-06-01"),
    estimatedVnb: 5800,
    profitabilityIssues: [
      {
        factor: "위험률",
        severity: "medium",
        description: "장기 생존율 개선으로 연금 지급 기간이 예정 대비 평균 2.3년 증가.",
        impact: -18,
        recommendation: "연금 개시 나이 상향 또는 생존율 재산출 후 보험료 재조정 필요",
      },
      {
        factor: "사업비",
        severity: "low",
        description: "유지 사업비가 업계 평균 대비 1.1%p 높음.",
        impact: -7,
        recommendation: "유지 관련 자동화 시스템 도입으로 유지비 절감 가능",
      },
    ],
    blocks: [
      { id: "b1", type: "main", name: "연금 주계약", coverage: "300000000", ageMin: "25", ageMax: "55" },
      { id: "b2", type: "rider", name: "사망보험금 특약", coverage: "10000000", ageMin: "25", ageMax: "55" },
    ],
    submittedSimulation: {
      simulationId: "SIM-2022-006",
      riskRate: 97.5,
      expense: 14.2,
      lapseRate: 5.8,
      discountRate: 2.3,
      vnb: 5800,
      marginRate: 11.6,
      premium: 150000,
      submittedAt: new Date("2022-06-15"),
    },
  },
]
// ──────────────────────────────────────────────────────────────────────────────

export function ProductProvider({ children }: { children: ReactNode }) {
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>(EXISTING_PRODUCTS)
  const [currentProduct, setCurrentProduct] = useState<SavedProduct | null>(null)

  const saveProduct = (product: Omit<SavedProduct, 'id' | 'createdAt'>) => {
    const newProduct: SavedProduct = {
      ...product,
      category: product.category || "헬스케어보장",
      id: `PD${Date.now()}`,
      createdAt: new Date(),
    }
    setSavedProducts(prev => [newProduct, ...prev])
    setCurrentProduct(newProduct)
    return newProduct
  }

  const loadProduct = (productId: string) => {
    const product = savedProducts.find(p => p.id === productId)
    if (product) {
      setCurrentProduct(product)
    }
  }

  const deleteProduct = (productId: string) => {
    setSavedProducts(prev => prev.filter(p => p.id !== productId))
    if (currentProduct?.id === productId) {
      setCurrentProduct(null)
    }
  }

  const duplicateProduct = (productId: string): SavedProduct | null => {
    const product = savedProducts.find(p => p.id === productId)
    if (!product) return null

    // Generate 상품설계ID (PDID) with format PD-YYYYMMDD-HHmm
    const now = new Date()
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`
    const timePart = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`
    const newProductCode = `PD-${datePart}-${timePart}`

    const duplicatedProduct: SavedProduct = {
      ...product,
      id: `PD${Date.now()}`,
      name: `${product.name} (개선안)`,
      productCode: newProductCode,
      isExisting: false,
      profitabilityStatus: undefined,
      // Keep original issues as improvement recommendations
      improvementRecommendations: product.profitabilityIssues || [],
      sourceProductId: product.id,
      profitabilityIssues: [],
      createdAt: new Date(),
    }

    setSavedProducts(prev => [duplicatedProduct, ...prev])
    setCurrentProduct(duplicatedProduct)
    return duplicatedProduct
  }

  const updateProduct = (productId: string, updates: Partial<SavedProduct>) => {
    setSavedProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, ...updates } : p)
    )
    if (currentProduct?.id === productId) {
      setCurrentProduct({ ...currentProduct, ...updates })
    }
  }

  return (
    <ProductContext.Provider
      value={{
        savedProducts,
        currentProduct,
        saveProduct,
        loadProduct,
        deleteProduct,
        duplicateProduct,
        updateProduct,
        setCurrentProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProduct() {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider")
  }
  return context
}
