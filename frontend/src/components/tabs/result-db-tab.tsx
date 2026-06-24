import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, Database, CheckCircle2, Clock } from "lucide-react"
import { SecHead, StatCard } from "@/components/vnb-shared"

export function ResultDbTab() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={Save}         label="저장된 MP 예측 건수" value="599만건" sub="5개 보종 합계" />
          <StatCard icon={Database}     label="결과 DB 용량"        value="38GB"   sub="보종단위 적재" />
          <StatCard icon={CheckCircle2} label="집계 완료 보종"      value="4종"    sub="정기보험 적재중" />
          <StatCard icon={Clock}        label="최근 적재"           value="10분 전" sub="배치 자동 실행" />
        </div>

        <Card className="p-5 bg-card border-border">
          <SecHead num={1} title="보종별 MP 예측 결과 저장" desc="보종별 예측 모델이 전체 MP 조합에 대해 산출한 VNB 값을 보종 단위로 적재합니다. 적재 완료된 보종만 집계에 활용됩니다." />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3">보종</th>
                  <th className="text-left py-2 px-3">연결 모델</th>
                  <th className="text-left py-2 px-3">테이블명</th>
                  <th className="text-right py-2 px-3">저장 MP 건수</th>
                  <th className="text-center py-2 px-3">최근 산출일</th>
                  <th className="text-center py-2 px-3">상태</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: "암보험",   model: "M-CANCER-001",  table: "TB_VNB_RESULT_CANCER",  count: "2,847,600", updated: "2026-06-23 06:00", ok: true  },
                  { cat: "종신보험", model: "M-WHOLE-002",   table: "TB_VNB_RESULT_WHOLE",   count: "1,203,400", updated: "2026-06-23 06:05", ok: true  },
                  { cat: "연금보험", model: "M-PENSION-003", table: "TB_VNB_RESULT_PENSION", count: "986,200",   updated: "2026-06-23 06:10", ok: true  },
                  { cat: "건강보험", model: "M-HEALTH-004",  table: "TB_VNB_RESULT_HEALTH",  count: "748,600",   updated: "2026-06-23 06:15", ok: true  },
                  { cat: "정기보험", model: "—",             table: "TB_VNB_RESULT_TERM",    count: "214,400",   updated: "—",               ok: false },
                ].map(r => (
                  <tr key={r.cat} className="border-b border-border hover:bg-secondary/40">
                    <td className="py-2.5 px-3 font-medium text-foreground">{r.cat}</td>
                    <td className="py-2.5 px-3 font-mono text-primary text-xs">{r.model}</td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground text-xs">{r.table}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{r.count}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{r.updated}</td>
                    <td className="py-2.5 px-3 text-center">
                      {r.ok
                        ? <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="h-3 w-3" />적재완료</span>
                        : <span className="inline-flex items-center gap-1 text-amber-500 text-xs"><Clock className="h-3 w-3" />모델 개발 중</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border">
          <SecHead num={2} title="보종별 VNB 집계 결과" desc="MP별 예측 VNB에 실제 판매 믹스(가중치)를 적용해 보종 단위 VNB를 집계합니다. 채널·가입조건별 세부 집계도 함께 확인합니다." />
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3">보종</th>
                  <th className="text-right py-2 px-3">예측 VNB (억)</th>
                  <th className="text-right py-2 px-3">신계약마진율</th>
                  <th className="text-right py-2 px-3">환산 APE (억)</th>
                  <th className="text-center py-2 px-3">판매 믹스 기준</th>
                  <th className="text-center py-2 px-3">집계일</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: "암보험",   vnb: 1847, margin: 24.1, ape: 7652, mix: "최근 3개월 실적", date: "2026-06-23" },
                  { cat: "종신보험", vnb: 923,  margin: 9.8,  ape: 9418, mix: "최근 3개월 실적", date: "2026-06-23" },
                  { cat: "연금보험", vnb: 612,  margin: 14.2, ape: 4310, mix: "최근 3개월 실적", date: "2026-06-23" },
                  { cat: "건강보험", vnb: 1430, margin: 18.7, ape: 7647, mix: "최근 3개월 실적", date: "2026-06-23" },
                  { cat: "정기보험", vnb: null, margin: null, ape: null, mix: "—",            date: "—"          },
                ].map(r => (
                  <tr key={r.cat} className="border-b border-border hover:bg-secondary/40">
                    <td className="py-2.5 px-3 font-medium text-foreground">{r.cat}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">{r.vnb != null ? r.vnb.toLocaleString() : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-green-600">{r.margin != null ? `${r.margin}%` : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground">{r.ape != null ? r.ape.toLocaleString() : <span className="text-muted-foreground">—</span>}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{r.mix}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground text-xs">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border pt-4 space-y-2">
            {[
              { label: "채널 단위 세부 집계",   desc: "GA / 방카 / TM / 대면 × 4개 보종",  status: "완료" },
              { label: "가입조건 단위 세부 집계", desc: "연령대 × 성별 × 보험기간 단위",     status: "완료" },
              { label: "전사 VNB 합산",          desc: "4개 보종 VNB 합계 (정기보험 제외)", status: "완료" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 border border-border">
                <div>
                  <p className="text-xs font-medium text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
                <Badge variant="outline" className="text-[10px] border-green-500 text-green-600">{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
