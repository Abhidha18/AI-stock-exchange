from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# ORDER MODEL
# ---------------------------

class OrderRequest(BaseModel):
    stockSymbol: str
    quantity: int
    price: float
    isBuy: bool

# ---------------------------
# CHAT MODEL
# ---------------------------

class QuestionRequest(BaseModel):
    question: str

# ---------------------------
# GET ORDERS
# ---------------------------

@app.get("/orders")
def get_orders():
    return {
        "RELIANCE": {
            "buy": [
                {
                    "id": 1,
                    "stockSymbol": "RELIANCE",
                    "quantity": 100,
                    "price": 2500,
                    "isBuy": True
                }
            ],
            "sell": [
                {
                    "id": 2,
                    "stockSymbol": "RELIANCE",
                    "quantity": 40,
                    "price": 2490,
                    "isBuy": False
                }
            ]
        }
    }

# ---------------------------
# GET TRADES
# ---------------------------

@app.get("/trades")
def get_trades():
    return [
        {
            "buyOrderId": 1,
            "sellOrderId": 2,
            "stockSymbol": "RELIANCE",
            "quantity": 40,
            "price": 2500,
            "timestamp": "2026-06-07T10:00:00"
        }
    ]

# ---------------------------
# GET ANALYTICS
# ---------------------------

@app.get("/analytics")
def get_analytics():
    return {
        "total_trades": 999,
        "total_volume": 888,
        "average_price": 777,
        "stocks_tracked": 666
    }

# ---------------------------
# PLACE ORDER
# ---------------------------

@app.post("/order")
def place_order(order: OrderRequest):

    print("Received Order:")
    print(order)

    return {
        "message": "Order received"
    }

# ---------------------------
# AI CHAT
# ---------------------------

@app.post("/ask")
def ask_ai(request: QuestionRequest):

    import subprocess

    result = subprocess.run(
        [
            "python",
            "../chatbot_api.py",
            request.question
        ],
        capture_output=True,
        text=True
    )

    print("STDOUT:")
    print(result.stdout)

    print("STDERR:")
    print(result.stderr)

    return {
        "answer": result.stdout
    }