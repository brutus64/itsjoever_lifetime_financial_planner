import uvicorn
from starlette.middleware.sessions import SessionMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api import user, scrape_yaml, scenario, import_export, simulation
from app.db.db import init_db
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
load_dotenv()
from pyinstrument import Profiler

@asynccontextmanager #expects yield statement
async def lifespan(app: FastAPI):
    await init_db()
    await scrape_yaml.scraped_db_check()
    print("HELLO!")
    yield #async context, so FastAPI app runs here, before=startup after=shutdown
    print("Shutting down FastAPI application.")
    
    
app = FastAPI(lifespan=lifespan)

# @app.middleware("http")
# async def route_profiling_middleware(request: Request, call_next):
#     profiler = cProfile.Profile()
#     profiler.enable()
#     start_time = time.perf_counter()
    
#     response = await call_next(request)
    
#     process_time = time.perf_counter() - start_time
#     profiler.disable()
#     s = io.StringIO()
#     ps = pstats.Stats(profiler, stream=s).sort_stats('cumulative')
#     ps.print_stats()
    
#     logging.info(f"Route {request.url.path} took {process_time:.4f} seconds")
#     logging.info(f"Performance profile for {request.url.path}:\n{s.getvalue()}")
#     return response

origins = [
    f"http://{os.getenv('FRONTEND_HOSTNAME')}:{os.getenv('FRONTEND_PORT')}",
    f"http://{os.getenv('FRONTEND_ADDR')}:{os.getenv('FRONTEND_PORT')}"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

#max age defaults to 2 weeks
app.add_middleware(
    SessionMiddleware,
    secret_key="haha_random_key123821",
    session_cookie="session",
    max_age=86400,
    same_site="none",
    https_only=False,
    path="/"
)

PROFILING = False

if PROFILING:
    @app.middleware("http")
    async def profile_request(request: Request, call_next):
        profiler = Profiler()
        profiler.start()
        response = await call_next(request)
        profiler.stop()
        print(profiler.output_text())
        return response

# @app.middleware('http')
# async def auth_check(request: Request, call_next):
#     public_path = [
#         '/api/login',
#         '/docs',
#         '/openapi.json',
#         '/redoc'
#     ]
#     #need to check if a session id exists and if it matches, otherwise reject, but if path is to login then everything is fine since we'll ahve to assign one
#     if request.url.path.startswith("/api") and request.url.path not in public_path:
#         session_id = request.session.get("session_id")
#         if not session_id:
#             return JSONResponse(status_code=401, content={"detail": "Not authenticated"})
#     return await call_next(request)


#fastapi middleware is checked in reverse

app.include_router(user.router, prefix='/api')
app.include_router(simulation.router, prefix='/api/simulation')
app.include_router(scenario.router, prefix='/api/scenarios')
app.include_router(import_export.router, prefix='/api/scenarios')

if __name__ == '__main__':
    uvicorn.run("app.main:app", host=os.getenv("SERVER_ADDR"), port=int(os.getenv("SERVER_PORT")), log_level="info", reload=True)