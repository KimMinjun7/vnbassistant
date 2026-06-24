
import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Database,
  Copy,
  Pencil,
  Trash2,
  Shield,
  GitCompare,
  Plus,
  BarChart3,
  BarChart2,
  Activity,
  Wand2,
  History,
  Package,
  Brain,
  FlaskConical,
  Save,
  Download,
  Badge as BadgeIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useProduct } from "@/contexts/product-context"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TreeNode {
  id: string
  name: string
  type: "product" | "date" | "document" | "dashboard" | "category" | "saved-product" | "ai-design-category"
  children?: TreeNode[]
  icon?: string
  productCode?: string
  category?: string
}

const getCategoryTree = (savedProducts: any[]): TreeNode[] => {
  const healthcareProducts = savedProducts.filter(p => p.category === "헬스케어보장")
  const wholeLifeProducts = savedProducts.filter(p => p.category === "종신보험")
  const pensionProducts = savedProducts.filter(p => p.category === "연금저축보험")

  return [
    {
      id: "db-management",
      name: "DB 관리",
      type: "category",
      icon: "database",
      children: [
        { id: "training-db",   name: "학습용 DB",        type: "dashboard", icon: "dot" },
        { id: "prediction-db", name: "예측용 DB",         type: "dashboard", icon: "dot" },
        { id: "result-db",     name: "예측결과 저장 DB",  type: "dashboard", icon: "dot" },
      ],
    },
    { id: "model-dev",     name: "VNB예측모델 개발",   type: "dashboard", icon: "brain" },
    { id: "simulation",    name: "시뮬레이션 및 집계", type: "dashboard", icon: "activity" },
    { id: "vnb-dashboard", name: "대시보드",           type: "dashboard", icon: "chart" },
    { id: "output",        name: "출력",               type: "dashboard", icon: "download" },
    {
      id: "tools-category",
      name: "기타 도구",
      type: "category",
      icon: "wand",
      children: [
        { id: "product-builder",       name: "상품 설계 도구",  type: "dashboard" },
        { id: "vnb-simulator",         name: "VNB 시뮬레이터", type: "dashboard" },
        { id: "product-analysis-list", name: "상품 목록",       type: "dashboard" },
      ],
    },
    ...(savedProducts.length > 0 ? [{
      id: "saved-products-category",
      name: "저장된 상품",
      type: "category" as const,
      icon: "history",
      children: [
        ...(healthcareProducts.length > 0 ? [{
          id: "cat-healthcare", name: "헬스케어보장", type: "product" as const,
          children: healthcareProducts.map(p => ({ id: p.id, name: p.name, type: "saved-product" as const, productCode: p.id, category: p.category })),
        }] : []),
        ...(wholeLifeProducts.length > 0 ? [{
          id: "cat-whole", name: "종신보험", type: "product" as const,
          children: wholeLifeProducts.map(p => ({ id: p.id, name: p.name, type: "saved-product" as const, productCode: p.id, category: p.category })),
        }] : []),
        ...(pensionProducts.length > 0 ? [{
          id: "cat-pension", name: "연금저축보험", type: "product" as const,
          children: pensionProducts.map(p => ({ id: p.id, name: p.name, type: "saved-product" as const, productCode: p.id, category: p.category })),
        }] : []),
      ],
    }] : []),
  ]
}

function getNodeIcon(node: TreeNode, isExpanded?: boolean) {
  if (node.type === "category") {
    if (node.icon === "wand")     return <Wand2 className="h-4 w-4 text-primary" />
    if (node.icon === "history")  return <History className="h-4 w-4 text-primary" />
    if (node.icon === "brain")    return <Brain className="h-4 w-4 text-primary" />
    if (node.icon === "database") return <Database className="h-4 w-4 text-primary" />
    return <Folder className="h-4 w-4 text-primary" />
  }
  if (node.type === "dashboard") {
    if (node.icon === "dot")      return <span className="w-4 flex items-center justify-center flex-shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 inline-block" /></span>
    if (node.icon === "database") return <Database className="h-4 w-4 text-primary" />
    if (node.icon === "flask")    return <FlaskConical className="h-4 w-4 text-primary" />
    if (node.icon === "save")     return <Save className="h-4 w-4 text-primary" />
    if (node.icon === "brain")    return <Brain className="h-4 w-4 text-primary" />
    if (node.icon === "activity") return <Activity className="h-4 w-4 text-primary" />
    if (node.icon === "chart")    return <BarChart2 className="h-4 w-4 text-primary" />
    if (node.icon === "download") return <Download className="h-4 w-4 text-primary" />
    return <BarChart3 className="h-4 w-4 text-muted-foreground" />
  }
  if (node.type === "saved-product") return <Package className="h-4 w-4 text-primary" />
  if (node.type === "product") return <Database className="h-4 w-4 text-primary" />
  if (node.type === "date") {
    return isExpanded
      ? <FolderOpen className="h-4 w-4 text-primary" />
      : <Folder className="h-4 w-4 text-muted-foreground" />
  }
  return <FileText className="h-4 w-4 text-muted-foreground" />
}

interface TreeItemProps {
  node: TreeNode
  level: number
  onSelect: (node: TreeNode) => void
  selectedId: string | null
  onDuplicate?: (node: TreeNode) => void
}

function TreeItem({ node, level, onSelect, selectedId, onDuplicate }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = node.children && node.children.length > 0

  const handleClick = () => {
    if (hasChildren) setIsExpanded(!isExpanded)
    if (node.type !== "category") onSelect(node)
  }

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer rounded-md hover:bg-secondary transition-colors ${
              selectedId === node.id ? "bg-secondary text-primary" : ""
            } ${node.type === "category" ? "font-semibold" : ""}`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={handleClick}
          >
            {hasChildren ? (
              isExpanded
                ? <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                : <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            ) : (
              <span className="w-3 flex-shrink-0" />
            )}
            <span className="flex-shrink-0">{getNodeIcon(node, isExpanded)}</span>
            <span className="text-sm truncate flex-1">{node.name}</span>
            {node.type === "saved-product" && node.productCode && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 flex-shrink-0">
                {node.productCode.slice(-6).toUpperCase()}
              </Badge>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-popover border-border">
          {node.type === "saved-product" ? (
            <>
              <ContextMenuItem className="gap-2 text-foreground hover:bg-secondary" onClick={() => onDuplicate?.(node)}>
                <Copy className="h-4 w-4" />복제하여 새 상품 만들기
              </ContextMenuItem>
              <ContextMenuItem className="gap-2 text-foreground hover:bg-secondary">
                <Pencil className="h-4 w-4" />상품명 변경
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-border" />
              <ContextMenuItem className="gap-2 text-foreground hover:bg-secondary">
                <GitCompare className="h-4 w-4" />버전 비교
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-border" />
              <ContextMenuItem className="gap-2 text-destructive hover:bg-secondary">
                <Trash2 className="h-4 w-4" />삭제
              </ContextMenuItem>
            </>
          ) : (
            <>
              <ContextMenuItem className="gap-2 text-foreground hover:bg-secondary">
                <Plus className="h-4 w-4" />새 문서 작성
              </ContextMenuItem>
              <ContextMenuItem className="gap-2 text-foreground hover:bg-secondary">
                <Copy className="h-4 w-4" />복제
              </ContextMenuItem>
              <ContextMenuItem className="gap-2 text-foreground hover:bg-secondary">
                <Pencil className="h-4 w-4" />이름 변경
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-border" />
              <ContextMenuItem className="gap-2 text-foreground hover:bg-secondary">
                <Shield className="h-4 w-4" />권한 설정
              </ContextMenuItem>
              <ContextMenuItem className="gap-2 text-foreground hover:bg-secondary">
                <GitCompare className="h-4 w-4" />버전 비교
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-border" />
              <ContextMenuItem className="gap-2 text-destructive hover:bg-secondary">
                <Trash2 className="h-4 w-4" />삭제
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
      {isExpanded && hasChildren && node.children?.map(child => (
        <TreeItem
          key={child.id}
          node={child}
          level={level + 1}
          onSelect={onSelect}
          selectedId={selectedId}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  )
}

interface DataSidebarProps {
  onNodeSelect: (node: TreeNode) => void
  onDocumentOpen: (node: TreeNode) => void
  onToggle: () => void
  isOpen: boolean
}

export function DataSidebar({ onNodeSelect, onDocumentOpen, onToggle, isOpen }: DataSidebarProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { savedProducts, currentProduct, loadProduct } = useProduct()

  const treeData = getCategoryTree(savedProducts)

  const handleSelect = (node: TreeNode) => {
    setSelectedId(node.id)
    onNodeSelect(node)
    if (node.type === "document" || node.type === "dashboard") {
      onDocumentOpen(node)
    }
    if (node.type === "saved-product") {
      loadProduct(node.id)
      window.dispatchEvent(new CustomEvent('navigate-to-dashboard', {
        detail: { dashboardId: 'product-summary', productId: node.id }
      }))
      onDocumentOpen({ id: "product-summary", name: "상품 요약", type: "dashboard" })
    }
  }

  const handleDuplicate = (node: TreeNode) => {
    if (node.type === "saved-product") {
      loadProduct(node.id)
      window.dispatchEvent(new CustomEvent('duplicate-product', { detail: { productId: node.id } }))
      onDocumentOpen({ id: "product-builder", name: "상품 설계 도구", type: "dashboard" })
    }
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-full flex flex-col bg-sidebar-background border-r border-sidebar-border overflow-hidden">

        {/* Toggle button */}
        <div className={`flex items-center border-b border-sidebar-border flex-shrink-0 h-11 ${isOpen ? "justify-between px-3" : "justify-center"}`}>
          {isOpen && (
            <span className="text-sm font-semibold text-foreground select-none">메뉴</span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                {isOpen
                  ? <PanelLeftClose className="h-5 w-5" />
                  : <PanelLeftOpen className="h-5 w-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isOpen ? "사이드바 닫기" : "사이드바 열기"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Collapsed: icon-only nav */}
        {!isOpen && (
          <div className="flex flex-col items-center gap-1 py-3 flex-1">
            {treeData.map(node => (
              <Tooltip key={node.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={onToggle}
                    className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                  >
                    {getNodeIcon(node)}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {node.name}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Expanded: full tree + current product */}
        {isOpen && (
          <>
<div className="flex-1 overflow-auto py-2">
              {treeData.map(node => (
                <TreeItem
                  key={node.id}
                  node={node}
                  level={0}
                  onSelect={handleSelect}
                  selectedId={selectedId}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
