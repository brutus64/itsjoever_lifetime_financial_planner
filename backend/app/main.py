import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import user, scrape_yaml, scenario
from app.db.db import init_db
from contextlib import asynccontextmanager

@asynccontextmanager #expects yield statement
async def lifespan(app: FastAPI):
    await init_db()
    await scrape_yaml.scraped_db_check()
    print("HELLO!")
    yield #async context, so FastAPI app runs here, before=startup after=shutdown
    print("Shutting down FastAPI application.")
    
    
app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['GET','POST','PUT','DELETE'],
    allow_headers=['*']
)

app.include_router(user.router, prefix='/api')
app.include_router(scenario.router, prefix='/api')

# @app.on_event("startup")
# async def startup_event():
#     await init_db()
#     await scrape_yaml.scraped_db_check()
#     print("HELLO!")

if __name__ == '__main__':
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="info", reload=True)