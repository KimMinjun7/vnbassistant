import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { SecHead } from "@/components/vnb-shared"

const OUTPUT_PREVIEW: Record<string, { unit: string; forecast: number; settlement: number }[]> = {
  "보종단위": [
    { unit: "암보험",   forecast: 184, settlement: 178 },
    { unit: "종신보험", forecast: 92,  settlement: 88  },
    { unit: "연금보험", forecast: 61,  settlement: 64  },
    { unit: "건강보험", forecast: 143, settlement: 139 },
    { unit: "정기보험", forecast: 47,  settlement: 45  },
  ],
  "채널단위": [
    { unit: "GA",   forecast: 198, settlement: 191 },
    { unit: "방카", forecast: 142, settlement: 138 },
    { unit: "TM",   forecast: 87,  settlement: 90  },
    { unit: "대면", forecast: 100, settlement: 97  },
  ],
  "상품단위": [
    { unit: "무배당암보험", forecast: 184, settlement: 178 },
    { unit: "통합종신보험", forecast: 92,  settlement: 88  },
    { unit: "변액연금보험", forecast: 61,  settlement: 64  },
    { unit: "건강든든보험", forecast: 143, settlement: 139 },
  ],
  "MIX단위": [
    { unit: "GA × 암보험",    forecast: 92, settlement: 88 },
    { unit: "방카 × 종신보험", forecast: 88, settlement: 86 },
    { unit: "TM × 연금보험",   forecast: 74, settlement: 72 },
    { unit: "대면 × 건강보험", forecast: 88, settlement: 85 },
  ],
  "증번단위": [
    { unit: "암보험",   forecast: 184, settlement: 178 },
    { unit: "종신보험", forecast: 92,  settlement: 88  },
    { unit: "연금보험", forecast: 61,  settlement: 64  },
    { unit: "건강보험", forecast: 143, settlement: 139 },
  ],
}

const OUTPUT_HISTORY = [
  { date: "2026-06-23 09:00", name: "VNB_예측집계_보종단위_2026Q2.xlsx", unit: "보종단위", format: "Excel", size: "1.2MB", quarter: "2026 Q2", status: "완료" },
  { date: "2026-06-20 14:30", name: "VNB_예측집계_채널단위_2026Q2.pdf",  unit: "채널단위", format: "PDF",   size: "3.4MB", quarter: "2026 Q2", status: "완료" },
  { date: "2026-06-17 11:00", name: "VNB_예측집계_상품단위_2026Q2.xlsx", unit: "상품단위", format: "Excel", size: "0.9MB", quarter: "2026 Q2", status: "완료" },
  { date: "2026-06-10 08:00", name: "VNB_예측집계_보종단위_2026Q1.xlsx", unit: "보종단위", format: "Excel", size: "1.1MB", quarter: "2026 Q1", status: "완료" },
  { date: "2026-03-14 16:20", name: "VNB_예측집계_MIX단위_2026Q1.pdf",   unit: "MIX단위",  format: "PDF",   size: "4.1MB", quarter: "2026 Q1", status: "완료" },
]

const EXCEL_SHEETS: Record<string, string[]> = {
  "보종단위": ["요약", "암보험", "종신보험", "연금보험", "건강보험", "정기보험"],
  "채널단위": ["요약", "GA", "방카", "TM", "대면"],
  "상품단위": ["요약", "무배당암보험", "통합종신보험", "변액연금보험", "건강든든보험"],
  "MIX단위":  ["요약", "GA×암보험", "방카×종신", "TM×연금", "대면×건강"],
  "증번단위": ["요약", "보종별 증번 목록"],
}

const PRODUCTS = ["암보험", "종신보험", "연금보험", "건강보험", "정기보험"]

export function OutputTab() {
  const [unit,          setUnit]          = useState("보종단위")
  const [format,        setFormat]        = useState("excel")
  const [year,          setYear]          = useState("2026")
  const [quarter,       setQuarter]       = useState("Q2")
  const [selectedProds, setSelectedProds] = useState<string[]>(["암보험","종신보험","연금보험","건강보험"])
  const [inclChart,     setInclChart]     = useState(true)
  const [inclModel,     setInclModel]     = useState(true)
  const [inclCompare,   setInclCompare]   = useState(true)
  const [inclShap,      setInclShap]      = useState(false)
  const [inclTrend,     setInclTrend]     = useState(false)

  const toggleProd = (p: string) =>
    setSelectedProds(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const previewData = (OUTPUT_PREVIEW[unit] ?? OUTPUT_PREVIEW["보종단위"])
    .filter(r => unit !== "보종단위" || selectedProds.some(p => r.unit.includes(p.replace("보험",""))))

  const totalFcst  = previewData.reduce((s, r) => s + r.forecast, 0)
  const totalSettl = previewData.reduce((s, r) => s + r.settlement, 0)
  const fileName   = `VNB_예측집계_${unit}_${year}${quarter}`
  const tableRows  = previewData.map(r => {
    const diff = r.forecast - r.settlement
    const mape = (Math.abs(diff) / r.settlement * 100).toFixed(1)
    return { ...r, diff, mape }
  })

  const handleDownload = () => {
    if (format === "excel") {
      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8">
          <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>
            <x:ExcelWorksheet><x:Name>${unit}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
          </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        </head>
        <body>
          <table border="1">
            <thead>
              <tr style="background:#003DA5;color:white;font-weight:bold">
                <th>구분</th><th>예측 모델 (억)</th><th>결산 DB (억)</th><th>차이 (억)</th><th>MAPE (%)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows.map(r => `
                <tr>
                  <td>${r.unit}</td>
                  <td align="right">${r.forecast}</td>
                  <td align="right">${r.settlement}</td>
                  <td align="right">${r.diff > 0 ? "+" : ""}${r.diff}</td>
                  <td align="right">${r.mape}%</td>
                </tr>`).join("")}
              <tr style="font-weight:bold;background:#f0f0f0">
                <td>합계</td>
                <td align="right">${totalFcst}</td>
                <td align="right">${totalSettl}</td>
                <td align="right">${totalFcst - totalSettl > 0 ? "+" : ""}${totalFcst - totalSettl}</td>
                <td align="right">${(Math.abs(totalFcst - totalSettl) / totalSettl * 100).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </body></html>`
      const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `${fileName}.xls`
      link.click()
      URL.revokeObjectURL(link.href)
    } else {
      const win = window.open("", "_blank")
      if (!win) return
      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${fileName}</title>
          <style>
            body { font-family: "Noto Sans KR", Arial, sans-serif; font-size: 12px; color: #1a1a2e; padding: 32px; }
            h1 { font-size: 16px; color: #003DA5; margin-bottom: 4px; }
            .meta { font-size: 11px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #003DA5; color: white; padding: 8px 12px; text-align: right; font-size: 11px; }
            th:first-child { text-align: left; }
            td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; font-size: 11px; text-align: right; }
            td:first-child { text-align: left; font-weight: 500; }
            tfoot td { font-weight: bold; background: #f3f4f6; border-top: 2px solid #003DA5; }
            .pos { color: #16a34a; } .neg { color: #dc2626; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>VNB 예측집계 보고서</h1>
          <p class="meta">${year}년 ${quarter} · ${unit} · 보종: ${selectedProds.join(", ")}</p>
          <table>
            <thead>
              <tr><th style="text-align:left">구분</th><th>예측 모델 (억)</th><th>결산 DB (억)</th><th>차이 (억)</th><th>MAPE (%)</th></tr>
            </thead>
            <tbody>
              ${tableRows.map(r => `
                <tr>
                  <td>${r.unit}</td>
                  <td>${r.forecast}</td>
                  <td>${r.settlement}</td>
                  <td class="${r.diff >= 0 ? "pos" : "neg"}">${r.diff > 0 ? "+" : ""}${r.diff}</td>
                  <td>${r.mape}%</td>
                </tr>`).join("")}
            </tbody>
            <tfoot>
              <tr>
                <td>합계</td>
                <td>${totalFcst}</td>
                <td>${totalSettl}</td>
                <td class="${totalFcst - totalSettl >= 0 ? "pos" : "neg"}">${totalFcst - totalSettl > 0 ? "+" : ""}${totalFcst - totalSettl}</td>
                <td>${(Math.abs(totalFcst - totalSettl) / totalSettl * 100).toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </body></html>`)
      win.document.close()
      win.focus()
      setTimeout(() => { win.print() }, 400)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-5 p-6">
        <Card className="p-5 bg-card border-border">
          <SecHead num={1} title="출력 설정" desc="출력 기간, 집계 단위, 보종 범위, 파일 형식을 설정합니다." />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground">기본 설정</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1.5 block">연도</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="bg-secondary border-border text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["2024","2025","2026"].map(y => <SelectItem key={y} value={y}>{y}년</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">분기</Label>
                  <Select value={quarter} onValueChange={setQuarter}>
                    <SelectTrigger className="bg-secondary border-border text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Q1","Q2","Q3","Q4","연간"].map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">집계 단위</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="bg-secondary border-border text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["증번단위","보종단위","상품단위","MIX단위","채널단위"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">출력 형식</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { val: "excel", label: "Excel", sub: ".xlsx" },
                    { val: "pdf",   label: "PDF",   sub: "리포트" },
                  ].map(f => (
                    <button
                      key={f.val}
                      onClick={() => setFormat(f.val)}
                      className={`p-2 rounded-lg border text-center transition-colors ${
                        format === f.val
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <p className="text-xs font-medium">{f.label}</p>
                      <p className="text-[10px]">{f.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground">보종 필터</p>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/40">
                  <input
                    type="checkbox"
                    checked={selectedProds.length === PRODUCTS.length}
                    onChange={e => setSelectedProds(e.target.checked ? [...PRODUCTS] : [])}
                    className="accent-primary"
                  />
                  <span className="text-xs font-medium text-foreground">전체 선택</span>
                </label>
                <div className="h-px bg-border" />
                {PRODUCTS.map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/40">
                    <input type="checkbox" checked={selectedProds.includes(p)} onChange={() => toggleProd(p)} className="accent-primary" />
                    <span className="text-xs text-foreground">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground">포함 항목</p>
              <div className="space-y-1.5">
                {[
                  { label: "예측 모델 VNB 집계",  val: inclModel,   set: setInclModel   },
                  { label: "결산 DB 비교 테이블",  val: inclCompare, set: setInclCompare },
                  { label: "VNB 추이 차트",        val: inclChart,   set: setInclChart   },
                  { label: "분기별 트렌드",        val: inclTrend,   set: setInclTrend   },
                  { label: "SHAP 영향도 분석",     val: inclShap,    set: setInclShap    },
                ].map(({ label, val, set }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-secondary/40">
                    <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} className="accent-primary" />
                    <span className="text-xs text-foreground">{label}</span>
                  </label>
                ))}
              </div>
              {format === "excel" && (
                <div className="mt-2 p-2.5 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-[10px] font-medium text-foreground mb-1.5">Excel 시트 구성</p>
                  <div className="flex flex-wrap gap-1">
                    {(EXCEL_SHEETS[unit] ?? EXCEL_SHEETS["보종단위"]).map(s => (
                      <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {year}년 {quarter} · {unit} · {selectedProds.length}개 보종 ·{" "}
              {[inclModel && "예측집계", inclCompare && "결산비교", inclChart && "차트", inclTrend && "트렌드", inclShap && "SHAP"]
                .filter(Boolean).join(" + ")}
            </p>
            <Button className="h-8 text-xs px-5" onClick={handleDownload} disabled={selectedProds.length === 0}>
              <Download className="h-3.5 w-3.5 mr-1.5" />파일 생성 및 다운로드
            </Button>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border">
          <SecHead num={2} title="결과 미리보기" desc={`${year}년 ${quarter} · ${unit} 기준 예측 모델 결과입니다. 파일 생성 전 데이터를 확인하세요.`} />
          {selectedProds.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-xs border border-dashed border-border rounded-lg">
              보종을 1개 이상 선택해주세요
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-3">구분</th>
                    <th className="text-right py-2 px-3">예측 모델 (억)</th>
                    <th className="text-right py-2 px-3">결산 DB (억)</th>
                    <th className="text-right py-2 px-3">차이 (억)</th>
                    <th className="text-right py-2 px-3">MAPE</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map(r => {
                    const diff = r.forecast - r.settlement
                    const mape = (Math.abs(diff) / r.settlement * 100).toFixed(1)
                    return (
                      <tr key={r.unit} className="border-b border-border/50 hover:bg-secondary/40">
                        <td className="py-2.5 px-3 font-medium text-foreground">{r.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-primary">{r.forecast}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{r.settlement}</td>
                        <td className={`py-2.5 px-3 text-right font-mono ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>{diff > 0 ? "+" : ""}{diff}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-foreground">{mape}%</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border font-semibold">
                    <td className="py-2.5 px-3 text-foreground">합계</td>
                    <td className="py-2.5 px-3 text-right font-mono text-primary">{totalFcst}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{totalSettl}</td>
                    <td className={`py-2.5 px-3 text-right font-mono ${totalFcst - totalSettl >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {totalFcst - totalSettl > 0 ? "+" : ""}{totalFcst - totalSettl}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">
                      {(Math.abs(totalFcst - totalSettl) / totalSettl * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-5 bg-card border-border">
          <SecHead num={3} title="출력 이력" desc="이전에 생성된 파일 목록입니다. 재다운로드할 수 있습니다." />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-3">생성일시</th>
                  <th className="text-left py-2 px-3">파일명</th>
                  <th className="text-center py-2 px-3">기간</th>
                  <th className="text-center py-2 px-3">집계 단위</th>
                  <th className="text-center py-2 px-3">형식</th>
                  <th className="text-right py-2 px-3">크기</th>
                  <th className="text-center py-2 px-3">상태</th>
                  <th className="text-center py-2 px-3">다운로드</th>
                </tr>
              </thead>
              <tbody>
                {OUTPUT_HISTORY.map(r => (
                  <tr key={r.date} className="border-b border-border/50 hover:bg-secondary/40">
                    <td className="py-2.5 px-3 font-mono text-muted-foreground text-[11px]">{r.date}</td>
                    <td className="py-2.5 px-3 text-foreground text-[11px] max-w-[200px] truncate">{r.name}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground">{r.quarter}</td>
                    <td className="py-2.5 px-3 text-center"><Badge variant="outline" className="text-[10px]">{r.unit}</Badge></td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground">{r.format}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{r.size}</td>
                    <td className="py-2.5 px-3 text-center"><span className="text-[10px] text-green-600 font-medium">{r.status}</span></td>
                    <td className="py-2.5 px-3 text-center">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"><Download className="h-3 w-3" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
