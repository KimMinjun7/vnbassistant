# VNB Assistant

> 신한라이프 보험 상품의 **VNB(Value of New Business) 예측·시뮬레이션·집계** AI 초자동화 플랫폼

**라이브 데모**: https://KimMinjun7.github.io/vnbassistant/

---

## 목차

1. [개요](#개요)
2. [주요 기능](#주요-기능)
3. [기술 스택](#기술-스택)
4. [프로젝트 구조](#프로젝트-구조)
5. [환경별 실행 방법](#환경별-실행-방법)
   - [내부 개발](#내부-개발-local)
   - [Docker](#docker)
   - [GitHub Pages](#github-pages)
6. [환경 변수](#환경-변수)
7. [API 엔드포인트](#api-엔드포인트)
8. [배포 흐름](#배포-흐름)

---

## 개요

VNB Assistant는 신한라이프 상품개발팀이 VNB 예측 모델을 학습·운영하고, 집계 결과를 시뮬레이션하여 보고서로 출력하는 통합 웹 플랫폼입니다.

- 백엔드 API 없이도 **로컬 Mock 데이터**로 모든 화면이 동작합니다.
- 실 운영 시 Python FastAPI 백엔드와 연동하여 실시간 예측·시뮬레이션이 가능합니다.

---

## 주요 기능

| # | 메뉴 | 설명 |
|---|----|------|
| 1 | **학습용 DB** | 408개 설명변수 관리, 학습 데이터 생성, 품질 지표 모니터링 |
| 2 | **예측용 DB** | 보종별 MP DB 생성, 개별 VNB 즉시 예측 |
| 3 | **예측결과 저장 DB** | 보종별 예측 결과 적재 및 집계 현황 조회 |
| 4 | **VNB예측모델 개발** | 모델 학습·성능 모니터링, SHAP 변수 영향도, 재학습 트리거 관리 |
| 5 | **시뮬레이션 및 집계** | 집계 단위별 VNB 조회, 가입조건 시뮬레이션, 변경 영향 분석 |
| 6 | **대시보드** | 드래그앤드롭 위젯 그리드, 사용자 정의 차트 빌더, 히트맵 |
| 7 | **출력** | Excel(.xls) / PDF 보고서 생성, 출력 이력 관리 |

### AI 어시스턴트

화면 우하단 챗봇 버튼을 누르면 우측에서 AI 어시스턴트 패널이 슬라이드로 열립니다. 현재 탭에 따라 추천 질문이 자동 변경됩니다.

---

## 기술 스택

### 프론트엔드

| 항목 | 버전 |
|------|------|
| React | 19 |
| TypeScript | 5.7 |
| Vite | 6 |
| Tailwind CSS | 3 |
| shadcn/ui | — |
| Recharts | 3.9 |
| react-grid-layout | 2.2 |
| react-router-dom | 7 |
| react-day-picker | 10 |
| date-fns | 4.4 |

### 백엔드

| 항목 | 버전 |
|------|------|
| Python | 3.11+ |
| FastAPI | 0.138 |
| Uvicorn | 0.49 |
| Pydantic | 2.13 |

---

## 프로젝트 구조

```
vnbassistant/
├── frontend/                    # React + Vite 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── center-workspace.tsx  # 탭 라우팅 및 레이아웃
│   │   │   │   ├── data-sidebar.tsx      # 좌측 네비게이션 사이드바
│   │   │   │   ├── right-panel.tsx       # AI 어시스턴트 챗봇 패널
│   │   │   │   └── welcome-screen.tsx    # 초기 웰컴 화면
│   │   │   ├── tabs/
│   │   │   │   ├── training-db-tab.tsx   # 학습용 DB
│   │   │   │   ├── prediction-tab.tsx    # 예측용 DB
│   │   │   │   ├── result-db-tab.tsx     # 예측결과 저장 DB
│   │   │   │   ├── model-dev-tab.tsx     # VNB예측모델 개발
│   │   │   │   ├── simulation-tab.tsx    # 시뮬레이션 및 집계
│   │   │   │   ├── aggregation-tab.tsx   # 대시보드 (드래그앤드롭 위젯)
│   │   │   │   └── output-tab.tsx        # 출력
│   │   │   ├── products/
│   │   │   │   ├── product-spec-builder.tsx  # 상품 설계 도구
│   │   │   │   ├── portfolio-heatmap.tsx     # 포트폴리오 히트맵
│   │   │   │   └── product-analysis-list.tsx # 상품 목록
│   │   │   ├── tools/
│   │   │   │   └── vnb-simulator.tsx     # VNB 시뮬레이터
│   │   │   └── proposal/                 # 제안서 섹션 컴포넌트
│   │   ├── pages/
│   │   │   ├── Home.tsx                  # 메인 레이아웃 (사이드바·작업공간·AI패널)
│   │   │   └── Proposal.tsx              # 제안서 전용 페이지
│   │   └── contexts/
│   │       └── product-context.tsx       # 상품 선택 전역 상태
│   ├── .env.development         # 내부 개발용 환경 변수
│   ├── .env.production          # Docker 배포용 환경 변수
│   ├── .env.github              # GitHub Pages 배포용 환경 변수
│   └── vite.config.ts
├── backend/                     # Python FastAPI 백엔드
│   ├── app/
│   │   ├── main.py              # FastAPI 앱 진입점, CORS 설정
│   │   └── routers/
│   │       ├── prediction.py    # POST /api/predict
│   │       └── simulation.py    # POST /api/simulate
│   └── requirements.txt
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Pages 자동 배포 워크플로
└── 기능정의서.md
```

---

## 환경별 실행 방법

### 내부 개발 (Local)

**백엔드 실행** (선택)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**프론트엔드 실행**

```bash
cd frontend
npm install
npm run dev
```

> 접속 주소: http://localhost:3000

---

### Docker

```bash
docker compose up --build
```

| 서비스 | 포트 | 설명 |
|--------|------|------|
| frontend | 3000 | Nginx + React 빌드 결과물 서빙 |
| backend | 8100 | FastAPI (내부 8000 → 외부 8100 매핑) |

---

### GitHub Pages

`main` 브랜치에 push하면 GitHub Actions가 자동으로 빌드·배포합니다.  
백엔드 없이 정적 Mock 데이터로 동작합니다.

```bash
cd frontend
npm install
npm run build:github
# 결과: frontend/dist/
```

---

## 환경 변수

| 파일 | 용도 | 주요 변수 |
|------|------|-----------|
| `.env.development` | `npm run dev` | `BACKEND_URL=http://localhost:8100` |
| `.env.production` | `npm run build:docker` | `BACKEND_URL=http://backend:8000` |
| `.env.github` | `npm run build:github` | `VITE_BASE_PATH=/vnbassistant/` |

> `VITE_` 접두사가 없는 변수는 Vite 클라이언트에 노출되지 않으며, `vite.config.ts`의 서버 프록시 설정에만 사용됩니다.

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/health` | 헬스 체크 |
| `POST` | `/api/predict` | 보종·가입조건 입력 → VNB 예측 |
| `POST` | `/api/simulate` | 시뮬레이션 파라미터 → 보험료·VNB 산출 |

API 문서(Swagger UI): http://localhost:8100/docs

---

## 배포 흐름

```
git push → main
    │
    └─ GitHub Actions (deploy.yml)
           │
           ├─ actions/checkout@v4
           ├─ actions/setup-node@v4 (Node 20)
           ├─ npm ci --legacy-peer-deps
           ├─ npm run build:github   ← .env.github 기반, base=/vnbassistant/
           └─ actions/deploy-pages@v4
                    │
                    └─ https://KimMinjun7.github.io/vnbassistant/
```

---

## 기능 정의서

상세 기능 정의는 [`기능정의서.md`](기능정의서.md)를 참고하세요.
