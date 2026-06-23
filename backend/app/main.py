from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import simulation, prediction

app = FastAPI(
    title="VNB Assistant API",
    description="신한라이프 AI 초자동화 플랫폼 백엔드",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulation.router, prefix="/api/simulate", tags=["simulation"])
app.include_router(prediction.router, prefix="/api/predict", tags=["prediction"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
