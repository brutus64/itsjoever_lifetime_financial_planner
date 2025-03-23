import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import user
from backend.app.db.db import init_db

app = FastAPI()

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

app.include_router(user.router, prefix='')

@app.on_event("startup")
async def startup_event():
    await init_db()
    print("HELLO!")

if __name__ == '__main__':
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="info", reload=True)