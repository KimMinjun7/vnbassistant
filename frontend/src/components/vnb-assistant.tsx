import { useState } from "react"
import { Database, FlaskConical, Save, Brain, Activity, BarChart2, Download } from "lucide-react"
import { TrainingDbTab }  from "@/components/tabs/training-db-tab"
import { PredictionTab }  from "@/components/tabs/prediction-tab"
import { ResultDbTab }    from "@/components/tabs/result-db-tab"
import { ModelDevTab }    from "@/components/tabs/model-dev-tab"
import { SimulationTab }  from "@/components/tabs/simulation-tab"
import { AggregationTab } from "@/components/tabs/aggregation-tab"
import { OutputTab }      from "@/components/tabs/output-tab"

type TabId = "training-db" | "prediction-db" | "result-db" | "model-dev" | "simulation" | "dashboard" | "output"

const TABS: { id: TabId; label: string; icon: typeof Database }[] = [
  { id: "training-db",   label: "학습용 DB",        icon: Database       },
  { id: "prediction-db", label: "예측용 DB",         icon: FlaskConical   },
  { id: "result-db",     label: "예측결과 저장 DB",  icon: Save           },
  { id: "model-dev",     label: "예측모델 개발",     icon: Brain          },
  { id: "simulation",    label: "시뮬레이션 및 집계", icon: Activity       },
  { id: "dashboard",     label: "대시보드",          icon: BarChart2      },
  { id: "output",        label: "출력",              icon: Download       },
]

export function VnbAssistant() {
  const [activeTab, setActiveTab] = useState<TabId>("training-db")
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">VNB Assistant</h2>
            <p className="text-xs text-muted-foreground">AI 기반 VNB 예측 모델 학습·시뮬레이션·집계 서비스</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 px-4 border-b border-border bg-card overflow-x-auto flex-shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === "training-db"   && <TrainingDbTab />}
        {activeTab === "prediction-db" && <PredictionTab />}
        {activeTab === "result-db"     && <ResultDbTab />}
        {activeTab === "model-dev"     && <ModelDevTab />}
        {activeTab === "simulation"    && <SimulationTab />}
        {activeTab === "dashboard"     && <AggregationTab />}
        {activeTab === "output"        && <OutputTab />}
      </div>
    </div>
  )
}
