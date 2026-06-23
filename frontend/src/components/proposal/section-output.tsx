
import { Slide, SlideTitle, SectionHeading, InfoCard, FlowDiagram, Pill, SectionValueBar } from "./proposal-primitives"
import { Download, FileSpreadsheet, FileText, FileJson, Share2, Database } from "lucide-react"

const formats = [
  { icon: <FileSpreadsheet className="h-4 w-4" />, label: "Excel / CSV", desc: "집계 결과 원본 데이터" },
  { icon: <FileText className="h-4 w-4" />, label: "PDF 리포트", desc: "경영 보고용 요약" },
  { icon: <FileJson className="h-4 w-4" />, label: "연계용 데이터 (API)", desc: "타 시스템 자동 연계" },
]

export function SectionOutput() {
  return (
    <Slide id="sec-output" sectionLabel="3.2.5.7 출력" pageLabel="7 / 7">
      <SlideTitle
        eyebrow="3.2.5.7 출력"
        title="예측·집계 결과를 다양한 형식의 파일로 만들어 보고와 시스템 연계에 활용"
        headline="사용자가 선택한 집계 단위·기간·조건의 결과를 화면뿐 아니라 엑셀·PDF·연계용 데이터 형식으로 만들어 줍니다. 출력 이력과 보고서 양식을 관리해 정기 보고와 타 시스템 연계를 표준화하고, 권한·보안 규칙에 맞게 안전하게 내보냅니다."
        keyPoints={[
          "엑셀·PDF·연계용 데이터 출력",
          "보고서 양식 표준화",
          "권한·보안 규칙 기반 안전한 출력",
        ]}
      />

      <div className="grid flex-1 grid-cols-12 gap-4">
        <div className="col-span-6 flex flex-col">
          <SectionHeading icon={<Download className="h-4 w-4" />}>출력 형식 (파일화)</SectionHeading>
          <div className="flex flex-col gap-2">
            {formats.map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {f.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-6 flex flex-col gap-3">
          <div>
            <SectionHeading icon={<Share2 className="h-4 w-4" />}>출력 옵션</SectionHeading>
            <InfoCard accent>
              <div className="flex flex-wrap gap-1">
                <Pill tone="primary">집계 단위 선택</Pill>
                <Pill tone="primary">기간·시점 선택</Pill>
                <Pill tone="primary">결산 실적 vs 예측 비교 포함</Pill>
                <Pill tone="primary">조건 변경 분석 결과 포함</Pill>
              </div>
            </InfoCard>
          </div>
          <div>
            <SectionHeading icon={<Database className="h-4 w-4" />}>출력 이력 & 보고서 양식 관리</SectionHeading>
            <InfoCard>
              출력 요청·결과물 이력을 보존해 다시 만들 수 있고 감사에 대응합니다. 보고서 양식을 표준화해 정기 출력을 자동화합니다.
            </InfoCard>
          </div>
          <InfoCard title="보안·통제 (거버넌스)">
            권한에 따른 출력 제한과 민감정보 가리기(마스킹)로 데이터를 안전하게 내보냅니다.
          </InfoCard>
        </div>

        <div className="col-span-12">
          <SectionHeading icon={<FileText className="h-4 w-4" />}>상세 작업 프로세스 (출력)</SectionHeading>
          <FlowDiagram
            steps={[
              { label: "조건·형식 선택", desc: "집계 단위 · 출력 형식" },
              { label: "집계 결과 조회", desc: "예측결과 DB 조회" },
              { label: "양식 매핑", desc: "보고서/파일 레이아웃" },
              { label: "파일 생성", desc: "엑셀·PDF·연계 데이터" },
              { label: "내려받기·연계", desc: "다운로드 · 시스템 전송" },
              { label: "이력 기록", desc: "출력 로그 · 감사" },
            ]}
          />
        </div>
      </div>

      <SectionValueBar
        value="예측·집계 결과를 엑셀·PDF·연계용 데이터로 표준 파일화해 정기 보고와 타 시스템 연계를 자동화합니다."
        differentiator="권한에 따른 출력 제한·민감정보 가리기와 출력 이력 관리로, 금융권 데이터 보안 요건을 충족하는 안전한 출력을 보장합니다."
      />
    </Slide>
  )
}
