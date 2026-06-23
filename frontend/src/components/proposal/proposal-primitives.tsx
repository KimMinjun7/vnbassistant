
import type React from "react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Slide — 제안서 한 페이지 (A4 가로 비율, 인쇄 시 페이지 분리)            */
/* ------------------------------------------------------------------ */
export function Slide({
  id,
  pageLabel,
  sectionLabel,
  children,
  className,
}: {
  id?: string
  pageLabel: string
  sectionLabel: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      className={cn(
        "proposal-slide relative mx-auto flex w-full max-w-[1120px] flex-col bg-card",
        "min-h-[720px] overflow-visible rounded-lg border border-border shadow-sm",
        className,
      )}
    >
      {/* top accent bar */}
      <div className="flex items-center justify-between border-b border-border bg-secondary px-8 py-3">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1.5 rounded-full bg-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {sectionLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">신한라이프 · 상품 AI 다크팩토리</span>
          <span className="rounded bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            {pageLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-8 py-6">{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* SlideTitle — 상단 헤드라인 + 핵심 포인트(Key Points)                  */
/* ------------------------------------------------------------------ */
export function SlideTitle({
  eyebrow,
  title,
  headline,
  keyPoints,
}: {
  eyebrow: string
  title: string
  headline: string
  keyPoints?: string[]
}) {
  return (
    <header className="mb-4">
      <p className="mb-1 text-sm font-semibold text-primary">{eyebrow}</p>
      <h2 className="text-2xl font-bold leading-tight text-card-foreground text-balance">{title}</h2>
      <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground text-pretty">{headline}</p>

      {keyPoints && keyPoints.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {keyPoints.map((kp, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-xs font-medium text-card-foreground">{kp}</span>
            </div>
          ))}
        </div>
      ) : null}
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* SectionHeading — main section 내부 소제목                            */
/* ------------------------------------------------------------------ */
export function SectionHeading({
  icon,
  children,
}: {
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {icon ? <span className="text-primary">{icon}</span> : null}
      <h3 className="text-sm font-bold uppercase tracking-wide text-card-foreground">{children}</h3>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* InfoCard — 일반 정보 카드                                            */
/* ------------------------------------------------------------------ */
export function InfoCard({
  title,
  children,
  accent,
  className,
}: {
  title?: string
  children: React.ReactNode
  accent?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        accent ? "border-primary/40 bg-primary/5" : "border-border bg-card",
        className,
      )}
    >
      {title ? <p className="mb-2 text-sm font-semibold text-card-foreground">{title}</p> : null}
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* FlowStep — end-to-end 단계 다이어그램 (가로 흐름)                     */
/* ------------------------------------------------------------------ */
export function FlowDiagram({
  steps,
}: {
  steps: { label: string; desc: string; icon?: React.ReactNode }[]
}) {
  return (
    <div className="flex items-stretch gap-2 overflow-x-auto">
      {steps.map((step, i) => (
        <div key={step.label} className="flex flex-1 items-stretch gap-2">
          <div className="flex flex-1 flex-col rounded-lg border border-border bg-secondary p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              {step.icon ? <span className="text-primary">{step.icon}</span> : null}
            </div>
            <p className="text-xs font-bold text-card-foreground">{step.label}</p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">{step.desc}</p>
          </div>
          {i < steps.length - 1 ? (
            <div className="flex items-center self-center text-primary">
              <ArrowRightIcon />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Pill — 작은 태그                                                     */
/* ------------------------------------------------------------------ */
export function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "primary" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "primary" && "bg-primary text-primary-foreground",
        tone === "muted" && "bg-muted text-muted-foreground",
        tone === "default" && "border border-border bg-card text-card-foreground",
      )}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* ScreenshotBackup — 섹션별 실제 화면 백업 슬라이드                      */
/* ------------------------------------------------------------------ */
export function ScreenshotBackup({
  id,
  pageLabel,
  sectionLabel,
  title,
  caption,
  src,
  alt,
  highlights,
}: {
  id?: string
  pageLabel: string
  sectionLabel: string
  title: string
  caption: string
  src: string
  alt: string
  highlights?: string[]
}) {
  return (
    <Slide id={id} pageLabel={pageLabel} sectionLabel={sectionLabel}>
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            화면 백업
          </span>
          <p className="text-sm font-semibold text-primary">{sectionLabel}</p>
        </div>
        <h2 className="mt-1 text-2xl font-bold leading-tight text-card-foreground text-balance">{title}</h2>
        <p className="mt-1 max-w-4xl text-sm leading-relaxed text-muted-foreground text-pretty">{caption}</p>
      </header>

      <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_280px]">
        {/* screenshot */}
        <figure className="overflow-hidden rounded-lg border border-border bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src || "/placeholder.svg"} alt={alt} className="w-full" />
        </figure>

        {/* 화면 설명 highlights */}
        {highlights && highlights.length > 0 ? (
          <aside className="flex flex-col gap-2">
            <SectionHeading>화면 구성 포인트</SectionHeading>
            {highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm leading-snug text-muted-foreground">{h}</p>
              </div>
            ))}
          </aside>
        ) : null}
      </div>
    </Slide>
  )
}

/* ------------------------------------------------------------------ */
/* ValueBox — value / target 강조 박스                                  */
/* ------------------------------------------------------------------ */
export function ValueBox({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* SectionValueBar — 각 섹션 하단의 "기대 가치 + 차별점(Why Us)" 영역     */
/* ------------------------------------------------------------------ */
export function SectionValueBar({
  value,
  differentiator,
}: {
  value: string
  differentiator: string
}) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary px-4 py-2.5">
        <span className="mt-0.5 flex h-5 shrink-0 items-center rounded bg-card px-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Value
        </span>
        <p className="text-xs leading-snug text-muted-foreground">
          <strong className="text-card-foreground">기대 가치</strong> — {value}
        </p>
      </div>
      <div className="flex items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
        <span className="mt-0.5 flex h-5 shrink-0 items-center rounded bg-primary px-1.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
          Why Us
        </span>
        <p className="text-xs leading-snug text-muted-foreground">
          <strong className="text-card-foreground">차별점</strong> — {differentiator}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* JourneyMap — 표지/개요용 end-to-end 여정 (단계 + 산출물 + 가치)         */
/* ------------------------------------------------------------------ */
export function JourneyMap({
  stages,
}: {
  stages: { phase: string; title: string; output: string; icon?: React.ReactNode }[]
}) {
  return (
    <div className="flex items-stretch gap-1.5 overflow-x-auto">
      {stages.map((s, i) => (
        <div key={s.title} className="flex flex-1 items-stretch gap-1.5">
          <div className="flex flex-1 flex-col rounded-lg border border-border bg-card p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wide text-primary">{s.phase}</span>
              {s.icon ? <span className="text-primary">{s.icon}</span> : null}
            </div>
            <p className="text-xs font-bold leading-tight text-card-foreground text-balance">{s.title}</p>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{s.output}</p>
          </div>
          {i < stages.length - 1 ? (
            <div className="flex items-center self-center text-primary/50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* DiffCard — "Why Us" 차별점 카드                                       */
/* ------------------------------------------------------------------ */
export function DiffCard({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4">
      <div className="mb-1.5 flex items-center gap-2">
        {icon ? <span className="text-primary">{icon}</span> : null}
        <p className="text-sm font-bold text-card-foreground text-balance">{title}</p>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}
