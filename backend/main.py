from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import models
from database import engine
from router import api_router
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    yield

app = FastAPI(title="Inventory & Order Management API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html>
        <head>
            <title>Ethara Inventory API</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                    padding: 0; 
                    margin: 0;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
                    color: #333; 
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container { 
                    max-width: 600px; 
                    background: white; 
                    padding: 2.5rem; 
                    border-radius: 12px; 
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
                    text-align: center;
                }
                h1 { color: #6f42c1; margin-top: 0; font-size: 28px; }
                p { font-size: 16px; line-height: 1.5; color: #555; margin-bottom: 25px; }
                .btn { 
                    display: inline-block; 
                    background: #6f42c1; 
                    color: white; 
                    text-decoration: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-weight: bold;
                    transition: background 0.3s;
                }
                .btn:hover { background: #5a32a3; }
                .status {
                    display: inline-block;
                    background: #d4edda;
                    color: #155724;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="status">🟢 API is Online</div>
                <h1>📦 Ethara Inventory Backend</h1>
                <p>Welcome to the backend service. This API powers the inventory tracking, order management, and customer relations system.</p>
                <a href="/docs" class="btn">View API Documentation</a>
            </div>
        </body>
    </html>
    """

app.include_router(api_router)
