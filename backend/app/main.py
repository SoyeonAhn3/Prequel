import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.core.ratelimit import limiter
from app.core.claude_client import AIServiceError
from app.api.users import router as users_router
from app.api.admin import router as admin_router
from app.api.projects import router as projects_router
from app.api.interview import router as interview_router
from app.api.design import router as design_router
from app.api.finalize import router as finalize_router
from app.api.export import router as export_router
from app.api.announcements import router as announcements_router

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(
        structlog.get_config()["wrapper_class"]._min_level
        if hasattr(structlog.get_config().get("wrapper_class", object), "_min_level")
        else 0
    ),
)
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("application_startup")
    yield
    logger.info("application_shutdown")


app = FastAPI(
    title="Prequel API",
    description="AI-powered project kickoff interview service",
    version="0.1.0",
    lifespan=lifespan,
)

# 레이트 리밋: limiter 등록 + 429 핸들러.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(AIServiceError)
async def ai_service_error_handler(request: Request, exc: AIServiceError):
    # Claude 호출 실패(SDK 재시도 후) → 503 + 사용자용 메시지 + 재시도 가능 신호.
    # CORS 미들웨어가 바깥(outermost)이라 이 응답에도 CORS 헤더가 붙는다.
    return JSONResponse(
        status_code=503,
        content={"detail": str(exc), "retryable": True},
    )


# 미들웨어 순서 주의: 나중에 add 한 것이 더 바깥(outermost).
# SlowAPI를 먼저(안쪽), CORS를 나중에(바깥쪽) 추가해야 429 응답에도
# CORS 헤더가 붙어 브라우저가 에러 본문을 읽을 수 있다.
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users_router)
app.include_router(admin_router)
app.include_router(projects_router)
app.include_router(interview_router)
app.include_router(design_router)
app.include_router(finalize_router)
app.include_router(export_router)
app.include_router(announcements_router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
