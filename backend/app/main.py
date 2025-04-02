import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api import user, scrape_yaml, scenario, import_export
from app.db.db import init_db
from contextlib import asynccontextmanager
import time
import logging
import cProfile
import pstats
import io

@asynccontextmanager #expects yield statement
async def lifespan(app: FastAPI):
    await init_db()
    await scrape_yaml.scraped_db_check()
    print("HELLO!")
    yield #async context, so FastAPI app runs here, before=startup after=shutdown
    print("Shutting down FastAPI application.")
    
    
app = FastAPI(lifespan=lifespan)

@app.middleware("http")
async def route_profiling_middleware(request: Request, call_next):
    profiler = cProfile.Profile()
    profiler.enable()
    start_time = time.perf_counter()
    
    response = await call_next(request)
    
    process_time = time.perf_counter() - start_time
    profiler.disable()
    s = io.StringIO()
    ps = pstats.Stats(profiler, stream=s).sort_stats('cumulative')
    ps.print_stats()
    
    logging.info(f"Route {request.url.path} took {process_time:.4f} seconds")
    logging.info(f"Performance profile for {request.url.path}:\n{s.getvalue()}")
    return response

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

app.include_router(user.router, prefix='/api')
app.include_router(scenario.router, prefix='/api/scenario')
app.include_router(import_export.router, prefix='/api/scenario')

if __name__ == '__main__':
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="info", reload=True)