from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import csv
import subprocess

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# IN-MEMORY ORDER BOOK
# ---------------------------

orders_db = {
    "RELIANCE": {
        "buy": [],
        "sell": []
    },
    "TCS": {
        "buy": [],
        "sell": []
    },
    "INFY": {
        "buy": [],
        "sell": []
    }
}

# ---------------------------
# MODELS
# ---------------------------

class OrderRequest(BaseModel):
    stockSymbol: str
    quantity: int
    price: float
    isBuy: bool


class QuestionRequest(BaseModel):
    question: str


# ---------------------------
# ORDERS
# ---------------------------

@app.get("/orders")
def get_orders():
    return orders_db


@app.post("/order")
def place_order(order: OrderRequest):

    if order.stockSymbol not in orders_db:

        orders_db[order.stockSymbol] = {
            "buy": [],
            "sell": []
        }

    new_order = {
        "id": len(
            orders_db[order.stockSymbol]["buy"]
        ) + len(
            orders_db[order.stockSymbol]["sell"]
        ) + 1,

        "stockSymbol": order.stockSymbol,
        "quantity": order.quantity,
        "price": order.price,
        "isBuy": order.isBuy
    }

    if order.isBuy:

        orders_db[
            order.stockSymbol
        ]["buy"].append(
            new_order
        )

    else:

        orders_db[
            order.stockSymbol
        ]["sell"].append(
            new_order
        )

    return {
        "message": "Order Added Successfully"
    }


# ---------------------------
# TRADES
# ---------------------------

@app.get("/trades")
def get_trades():

    trades = []

    try:

        with open(
            "../../backend/database/trades.csv",
            "r"
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:

                trades.append({
                    "buyOrderId": int(
                        row["BuyOrderID"]
                    ),
                    "sellOrderId": int(
                        row["SellOrderID"]
                    ),
                    "stockSymbol": row["Stock"],
                    "quantity": int(
                        row["Quantity"]
                    ),
                    "price": float(
                        row["Price"]
                    ),
                    "timestamp": row["Timestamp"]
                })

    except Exception as e:

        print(e)

    return trades


# ---------------------------
# ANALYTICS
# ---------------------------

@app.get("/analytics")
def get_analytics():

    total_trades = 0
    total_volume = 0
    total_price = 0

    stocks = set()

    volume_by_stock = {}

    try:

        with open(
            "../../backend/database/trades.csv",
            "r"
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:

                total_trades += 1

                stock = row["Stock"]

                qty = int(
                    row["Quantity"]
                )

                price = float(
                    row["Price"]
                )

                total_volume += qty

                total_price += price

                stocks.add(stock)

                if stock not in volume_by_stock:

                    volume_by_stock[
                        stock
                    ] = 0

                volume_by_stock[
                    stock
                ] += qty

    except Exception as e:

        print(e)

    average_price = (
        total_price / total_trades
        if total_trades > 0
        else 0
    )

    return {
        "total_trades": total_trades,
        "total_volume": total_volume,
        "average_price": average_price,
        "stocks_tracked": len(stocks),

        "volume_by_stock": [
            {
                "stock": stock,
                "volume": volume
            }
            for stock, volume
            in volume_by_stock.items()
        ]
    }


# ---------------------------
# AI CHAT
# ---------------------------

@app.post("/ask")
def ask_ai(request: QuestionRequest):

    result = subprocess.run(
        [
            "python",
            "../chatbot_api.py",
            request.question
        ],
        capture_output=True,
        text=True
    )

    return {
        "answer": result.stdout.strip()
    }