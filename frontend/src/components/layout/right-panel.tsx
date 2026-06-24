import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface RightPanelProps {
  isOpen: boolean
  onClose: () => void
  currentDashboard?: string
}

const defaultSuggestedQuestions = [
  "200% 한도로 설정된 코드 보여줘",
  "PV 수익률 계산식 만들어줘",
]

const vnbDashboardQuestions = [
  "전월 대비 VNB 하락 원인 분석해줘",
  "이번 분기 목표 달성 가능성은?",
  "경영진 보고용 VNB 현황 요약해줘",
]

export function RightPanel({ isOpen, onClose, currentDashboard }: RightPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "안녕하세요! VNB 예측·시뮬레이션·집계 관련 질문을 도와드리겠습니다.",
    },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestedQuestions =
    currentDashboard === "dashboard" ? vnbDashboardQuestions : defaultSuggestedQuestions

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isOpen])

  const handleSend = () => {
    if (!input.trim()) return
    const currentInput = input
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: currentInput },
    ])
    setInput("")

    setTimeout(() => {
      const vnbResponses: Record<string, string> = {
        "전월 대비 VNB 하락 원인 분석해줘":
          "전월 대비 VNB 5% 하락의 주요 원인:\n\n**1. 금리 변동 영향 (70%)**\n- 기준금리 0.25%p 인상으로 할인율 상승\n\n**2. 해지율 상승 영향 (30%)**\n- 전월 대비 해지율 2%p 증가\n\n권장: 금리 연동형 상품 설계 검토",
        "이번 분기 목표 달성 가능성은?":
          "현재 추세 기반 분석:\n- 분기 목표: 1,200억 원\n- 현재 달성: 780억 원 (65%)\n\n**기본 시나리오: 82% 달성 예상**\n주간 110억 원 달성 시 목표 초과 가능",
        "경영진 보고용 VNB 현황 요약해줘":
          "**금주 VNB 현황 요약**\n\n1️⃣ 금주 VNB: 215억 원 (목표 대비 107%)\n2️⃣ 신상품 암보험 VNB 15% 증가\n3️⃣ 금리 인상으로 장기 상품 마진 축소 예상",
        "200% 한도로 설정된 코드 보여줘":
          "```\n추가_납입_한도 = 기본보험료 * 2.0\nIF 납입한도 > MAX_LIMIT:\n    return MAX_LIMIT\n```\n사업방법서 제3조 근거입니다.",
        "PV 수익률 계산식 만들어줘":
          "PV 수익률 계산식:\n\n```\nPV = (CF / (1 + r)^n) - I\n```\n- CF: 현금흐름\n- r: 할인율(예정이율)\n- n: 기간\n- I: 초기 투자금액",
      }
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            vnbResponses[currentInput] ??
            `"${currentInput}"에 대한 분석을 시작하겠습니다. 관련 데이터를 수집 중입니다...`,
        },
      ])
    }, 900)
  }

  if (!isOpen) return null

  return (
    <div className="h-full flex flex-col bg-sidebar-background border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI 어시스턴트</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans text-xs">{msg.content}</pre>
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggested questions */}
      <div className="px-3 py-2 border-t border-border flex-shrink-0">
        <div className="flex items-center gap-1 mb-1.5">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-[11px] text-muted-foreground">추천 질문</span>
        </div>
        <div className="flex flex-col gap-1">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setInput(q)}
              className="text-left text-[11px] bg-secondary hover:bg-secondary/70 text-foreground px-2 py-1 rounded-lg transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="메시지를 입력하세요"
            className="text-xs bg-muted border-border text-foreground placeholder:text-muted-foreground h-8"
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
