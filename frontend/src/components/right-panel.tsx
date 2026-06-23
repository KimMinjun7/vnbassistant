
import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, PanelRightClose, PanelRightOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface SimulationResult {
  premium: number | null
  vnb: number | null
  details: {
    label: string
    value: string
  }[]
}

interface RightPanelProps {
  simulationResult: SimulationResult | null
  isLoading?: boolean
  currentDashboard?: string
  isOpen?: boolean
  onToggle?: () => void
}

const defaultSuggestedQuestions = [
  "200% 한도로 설정된 코드 보여줘",
  "제3조 4항 조건 업데이트해줘",
  "PV 수익률 계산식 만들어줘",
]

const vnbDashboardQuestions = [
  "📉 원인 분석: 전월 대비 VNB가 5% 하락했는데, 주요 원인이 금리 변동 때문인지 해지율 상승 때문인지 분석해줘.",
  "🔮 미래 예측: 현재 추세대로라면 이번 분기 목표 달성 가능성은 몇 %야?",
  "📢 요약 보고: 경영진 보고용으로 금주 VNB 현황과 주요 이슈를 3줄로 요약해줘.",
]

export function RightPanel({ simulationResult, isLoading = false, currentDashboard, isOpen = true, onToggle }: RightPanelProps) {
  // Select questions based on current dashboard
  const suggestedQuestions = currentDashboard === "dashboard" 
    ? vnbDashboardQuestions 
    : defaultSuggestedQuestions
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "안녕하세요! 보험료 산출 및 수식 계산에 대해 도움을 드리겠습니다. 무엇을 도와드릴까요?",
    },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const currentInput = input
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentInput,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate AI response with detailed responses
    setTimeout(() => {
      const vnbResponses: { [key: string]: string } = {
        "📉 원인 분석: 전월 대비 VNB가 5% 하락했는데, 주요 원인이 금리 변동 때문인지 해지율 상승 때문인지 분석해줘.":
          "전월 대비 VNB 5% 하락의 주요 원인을 분석한 결과:\n\n**1. 금리 변동 영향 (70%)**\n- 기준금리 0.25%p 인상으로 할인율 상승\n- 예정이율과 시장금리 gap 확대\n\n**2. 해지율 상승 영향 (30%)**\n- 전월 대비 해지율 2%p 증가\n- 경쟁사 신상품 출시 영향\n\n**권장 조치:**\n- 금리 연동형 상품 설계 검토\n- 고객 유지 프로그램 강화",
        "🔮 미래 예측: 현재 추세대로라면 이번 분기 목표 달성 가능성은 몇 %야?":
          "현재 추세 기반 분기 목표 달성 가능성 분석:\n\n**현황:**\n- 분기 목표: 1,200억 원\n- 현재 달성: 780억 원 (65%)\n- 남은 기간: 4주\n\n**예측 시나리오:**\n- 낙관적: 95% 달성 가능\n- 기본: 82% 달성 예상\n- 보수적: 73% 달성 예상\n\n**종합 판단: 목표 달성 가능성 82%**\n\n주간 평균 110억 원 달성 시 목표 초과 가능",
        "📢 요약 보고: 경영진 보고용으로 금주 VNB 현황과 주요 이슈를 3줄로 요약해줘.":
          "**금주 VNB 현황 요약 (경영진 보고용)**\n\n1️⃣ 금주 VNB: 215억 원 달성 (주간 목표 대비 107%, 전주 대비 +3%)\n\n2️⃣ 주요 성과: 신상품 '무배당 AI 뉴 라이프 암보험' 출시로 암보험 VNB 15% 증가, 목표 판매량 달성\n\n3️⃣ 리스크 이슈: 금리 인상으로 장기 상품 VNB 마진 축소 예상, 갱신형 상품 비중 확대 필요",
      }
      
      const responses: { [key: string]: string } = {
        "200% 한도로 설정된 코드 보여줘":
          "현재 설정된 추가 납입 한도 코드입니다:\n\n```\n추가_납입_한도 = 기본보험료 * 2.0\nIF 납입한도 > MAX_LIMIT:\n    return MAX_LIMIT\n```\n\n이 코드는 사업방법서 제3조에 근거합니다.",
        "제3조 4항 조건 업데이트해줘":
          "제3조 4항 조건을 업데이트하겠습니다.\n\n**현재 조건:**\n- 보험료는 보험 게시일로부터 적용\n\n**수정 가능 항목:**\n1. 적용 시작일 변경\n2. 계산 주기 변경\n3. 예외 조건 추가\n\n어떤 항목을 수정하시겠습니까?",
        "PV 수익률 계산식 만들어줘":
          "PV 수익률 계산식을 생성했습니다:\n\n```\nPV = (CF / (1 + r)^n) - I\n```\n\n**변수 설명:**\n- CF: 현금흐름 (Cash Flow)\n- r: 할인율 (예정이율)\n- n: 기간\n- I: 초기 투자금액\n\n계산기에 적용하시겠습니까?",
      }
      
      const responseContent =
        vnbResponses[currentInput] ||
        responses[currentInput] ||
        `${currentInput}에 대한 분석을 시작하겠습니다. 관련 데이터를 수집 중입니다...`
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
      }

      setMessages((prev) => [...prev, assistantMessage])
    }, 1000)
  }

  const handleSuggestedClick = (question: string) => {
    // Just copy to input field, don't send automatically
    setInput(question)
  }

  if (!isOpen) {
    return (
      <div className="h-full flex flex-col items-center bg-sidebar-background border-l border-sidebar-border">
        <div className="flex items-center justify-center h-11 border-b border-sidebar-border w-full">
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <PanelRightOpen className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-1 py-3">
          <button
            onClick={onToggle}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
            title="AI 어시스턴트"
          >
            <Bot className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-sidebar-background border-l border-sidebar-border">
      {/* Chat Header */}
      <div className="px-4 border-b border-sidebar-border flex items-center justify-between h-11">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">AI 어시스턴트</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <PanelRightClose className="h-5 w-5" />
        </button>
      </div>

      {/* Chat Section - 2/3 */}
      <div className="flex-[2] flex flex-col border-b border-sidebar-border overflow-hidden">

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {message.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                    }`}
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {message.content}
                  </pre>
                </div>
                {message.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        <div className="px-4 py-2 border-t border-sidebar-border">
          <div className="flex items-center gap-1 mb-2">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">추천 대화</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedClick(q)}
                className="text-xs bg-secondary hover:bg-secondary/80 text-foreground px-2 py-1 rounded transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="대화 입력창"
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>


    </div>
  )
}
