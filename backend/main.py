"""
Interview Arcade — FastAPI Application Entry Point
Mounts routers, enables CORS, enforces security exception shielding, and serves frontend static files.
"""

from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from backend.core.config import settings
from backend.core.database import engine, Base
import backend.models  # Registers all models

# Include API routers
from backend.api.auth import router as auth_router
from backend.api.games import router as games_router
from backend.api.dashboard import router as dashboard_router
from backend.api.learning import router as learning_router
from backend.api.feedback import router as feedback_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if not present
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Handcrafted technical interview arcade with server-verified scoring and learning paths.",
    lifespan=lifespan
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi import HTTPException


# Security exception shield: never leak internal stack traces or database errors
@app.exception_handler(Exception)
async def generic_exception_shield(request: Request, exc: Exception):
    if isinstance(exc, (HTTPException, StarletteHTTPException)):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    if isinstance(exc, RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors()}
        )
    # Log internal error server-side
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server-side error occurred. Technical logs have been recorded."}
    )


# Health check endpoint
@app.get("/api/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


# Include V1 Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(games_router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_V1_PREFIX)
app.include_router(learning_router, prefix=settings.API_V1_PREFIX)
app.include_router(feedback_router, prefix=settings.API_V1_PREFIX)

# Static file serving: Serve frontend directly from project root
project_root = Path(__file__).resolve().parent.parent

if (project_root / "index.html").exists():
    app.mount("/css", StaticFiles(directory=project_root / "css"), name="css")
    app.mount("/js", StaticFiles(directory=project_root / "js"), name="js")
    if (project_root / "tests").exists():
        app.mount("/tests", StaticFiles(directory=project_root / "tests"), name="tests")
    if (project_root / "assets").exists():
        app.mount("/assets", StaticFiles(directory=project_root / "assets"), name="assets")

    @app.get("/")
    def serve_frontend_index():
        return FileResponse(project_root / "index.html")
