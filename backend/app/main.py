import uvicorn
from fastapi import FastAPI
from app.api import user
from app.db.database import init_db

app = FastAPI()

app.include_router(user.router, prefix='')

@app.on_event("startup")
async def startup_event():
    await init_db()
    print("HELLO!")

if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=8000)