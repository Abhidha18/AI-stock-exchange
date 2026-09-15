# Stock Exchange Matching Engine

A high-performance C++ simulation of a stock exchange matching engine that processes buy and sell orders using **price-time priority**, maintains live order books, executes trades, and records trade history.

The project is designed to model the core backend infrastructure behind an electronic stock exchange, with a modular architecture that can be extended with market analytics and an AI-powered RAG assistant.

---

## Overview

In an electronic stock exchange, thousands of buy and sell orders arrive continuously. The exchange must determine which orders can be matched, execute trades according to well-defined rules, and maintain the remaining orders in the order book.

This project implements that core process from scratch in **C++**.

The engine supports:

* Buy and sell orders
* Multiple stocks
* Price-time priority
* Order book management
* Trade execution
* Partial order fills
* Remaining quantity management
* Trade history
* Market analytics
* Modular service-based architecture

---

## Key Features

### 1. Price-Time Priority

Orders are matched according to the standard exchange principle:

**Best price first → Earliest order first**

For buy orders:

> Higher price has higher priority.

For sell orders:

> Lower price has higher priority.

If two orders have the same price, the order submitted earlier gets priority.

This ensures deterministic and fair order matching.

---

### 2. Order Book

Each stock maintains its own order book containing active buy and sell orders.

Conceptually:

```text
                 ORDER BOOK
        ┌─────────────────────────┐
 BUY    │  Price     Quantity      │
        │  105.00       100        │
        │  104.50       250        │
        │  104.00       150        │
        ├─────────────────────────┤
        │  103.50       100        │
        │  103.00       200        │
 SELL   │  102.50       150        │
        └─────────────────────────┘
```

The engine continuously evaluates the best available buy and sell orders to determine whether a trade can occur.

---

### 3. Trade Matching

A buy and sell order can be matched when their prices cross.

For example:

```text
BUY:
Price = ₹100
Quantity = 100

SELL:
Price = ₹99
Quantity = 60
```

Since:

```text
Buy Price >= Sell Price
₹100 >= ₹99
```

the orders can be matched.

The resulting trade:

```text
Trade Price    = ₹99
Trade Quantity = 60
```

The buy order now has:

```text
Remaining Quantity = 40
```

The sell order is completely filled and removed from the order book.

---

### 4. Partial Fills

The engine supports orders whose quantities do not match exactly.

Example:

```text
BUY  : 100 shares @ ₹150
SELL :  40 shares @ ₹149
```

Execution:

```text
Trade = 40 shares @ ₹149
```

Remaining order:

```text
BUY = 60 shares @ ₹150
```

The remaining quantity stays in the order book and can be matched against subsequent sell orders.

---

### 5. Multiple Stocks

The engine supports separate order books for different stocks.

For example:

```text
AAPL
MSFT
GOOG
TSLA
```

Each symbol maintains an independent set of buy and sell orders.

This prevents orders belonging to different securities from being incorrectly matched.

---

## Architecture

The project follows a modular architecture separating the core matching logic from supporting services.

```text
                    ┌──────────────────┐
                    │   Incoming Order │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Matching Engine  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │    Order Book    │
                    │                  │
                    │  BUY     SELL    │
                    └────────┬─────────┘
                             │
                     Price-Time Matching
                             │
                             ▼
                    ┌──────────────────┐
                    │      Trade       │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     ┌──────────────────┐          ┌──────────────────┐
     │  Trade History   │          │ Market Analytics │
     └──────────────────┘          └──────────────────┘
```

---

## Project Structure

```text
stock-exchange-matching-engine/
│
├── include/
│   ├── models/
│   │   ├── Order.h
│   │   └── Trade.h
│   │
│   ├── engine/
│   │   ├── OrderBook.h
│   │   └── MatchingEngine.h
│   │
│   └── services/
│       ├── TradeHistory.h
│       └── MarketAnalytics.h
│
├── src/
│   ├── models/
│   │   ├── Order.cpp
│   │   └── Trade.cpp
│   │
│   ├── engine/
│   │   ├── OrderBook.cpp
│   │   └── MatchingEngine.cpp
│   │
│   └── services/
│       ├── TradeHistory.cpp
│       └── MarketAnalytics.cpp
│
├── main.cpp
├── README.md
└── Makefile
```

> The exact directory names can be adjusted to match the current repository structure.

---

# Core Components

## Order

Represents an incoming order from a buyer or seller.

Typical attributes include:

```text
Order ID
Stock Symbol
Side (BUY / SELL)
Price
Quantity
Timestamp
```

Example:

```text
Order {
    id       = 101
    symbol   = "AAPL"
    side     = BUY
    price    = 150.00
    quantity = 100
}
```

---

## Trade

Represents a successfully executed transaction between a buyer and seller.

A trade contains information such as:

```text
Trade ID
Stock Symbol
Buy Order ID
Sell Order ID
Execution Price
Execution Quantity
Timestamp
```

Example:

```text
Trade {
    symbol   = "AAPL"
    price    = 150.00
    quantity = 50
}
```

---

## OrderBook

The `OrderBook` maintains the currently active orders for a particular stock.

It is responsible for:

* Storing active buy orders
* Storing active sell orders
* Identifying the highest-priority buy
* Identifying the highest-priority sell
* Matching compatible orders
* Updating remaining quantities
* Removing completely filled orders

The implementation uses appropriate C++ STL data structures to efficiently maintain order priority.

---

## MatchingEngine

The `MatchingEngine` acts as the central component of the system.

Its responsibilities include:

1. Receiving incoming orders
2. Routing orders to the correct stock's order book
3. Attempting to match orders
4. Generating trades
5. Updating order quantities
6. Maintaining the state of the market

Conceptually:

```text
Incoming Order
      │
      ▼
Matching Engine
      │
      ▼
Find Stock Order Book
      │
      ▼
Check Best BUY / SELL
      │
      ▼
Can they match?
   /          \
 YES           NO
 │              │
 ▼              ▼
Execute       Store in
Trade         Order Book
 │
 ▼
Update Quantities
```

---

# Matching Algorithm

For every incoming order, the engine checks the opposite side of the order book.

### Incoming BUY

The engine looks for the lowest-priced SELL order.

A match occurs when:

```text
BUY price >= SELL price
```

### Incoming SELL

The engine looks for the highest-priced BUY order.

A match occurs when:

```text
SELL price <= BUY price
```

After a match:

```text
tradeQuantity =
    min(buyQuantity, sellQuantity)
```

The quantities of both orders are updated accordingly.

The process continues until:

```text
1. The incoming order is completely filled
OR
2. No compatible order remains
```

Any unfilled quantity is placed back into the order book.

---

# Example

Suppose the order book contains:

```text
SELL ORDERS

₹105 → 100 shares
₹106 → 200 shares
```

A new order arrives:

```text
BUY
Price    = ₹106
Quantity = 150
```

The engine first matches against the best sell order:

```text
SELL ₹105 → 100
BUY  ₹106 → 150
```

Trade:

```text
100 shares @ ₹105
```

Remaining BUY:

```text
50 shares @ ₹106
```

The engine continues:

```text
SELL ₹106 → 200
BUY  ₹106 → 50
```

Second trade:

```text
50 shares @ ₹106
```

Final state:

```text
BUY  → completely filled
SELL ₹105 → removed
SELL ₹106 → 150 shares remaining
```

Two trades were generated from a single incoming order.

---

# Technology Stack

| Technology                               | Purpose                              |
| ---------------------------------------- | ------------------------------------ |
| **C++**                                  | Core matching engine                 |
| **C++ STL**                              | Data structures and order management |
| **Priority Queues / Ordered Structures** | Maintaining order priority           |
| **FastAPI**                              | API layer for the AI/RAG component   |
| **Python**                               | RAG/AI integration                   |
| **Git**                                  | Version control                      |

---

# RAG Assistant

The project is designed to be extended with a **Retrieval-Augmented Generation (RAG)** assistant.

The assistant can provide a natural-language interface around the trading system and explain concepts such as:

* How orders are matched
* Why one order gets priority over another
* How partial fills work
* How an order book changes after a trade
* Trading and market-related concepts

The high-level architecture is:

```text
             User Question
                   │
                   ▼
             RAG Assistant
                   │
          ┌────────┴────────┐
          ▼                 ▼
    Retrieve Relevant     System /
       Information        Trading Data
          │                 │
          └────────┬────────┘
                   ▼
                 LLM
                   │
                   ▼
            Natural Language
               Response
```

The RAG component is kept separate from the core matching engine so that the deterministic trading logic does not depend on the AI layer.

---

# Design Principles

### Deterministic Core

The matching engine follows explicit matching rules rather than probabilistic logic.

This is important because an exchange system must produce predictable results for the same sequence of orders.

### Separation of Concerns

The project separates:

```text
Models
   ↓
Matching Engine
   ↓
Order Books
   ↓
Services
```

This makes the system easier to test, maintain, and extend.

### Extensibility

The architecture can be extended with features such as:

* Market orders
* Limit orders
* Stop orders
* Order cancellation
* Order modification
* Market data streams
* Persistence
* REST/WebSocket APIs
* Distributed order processing
* Performance benchmarking

---

# Running the Project

## Prerequisites

Install:

* C++ compiler supporting C++17 or later
* Git

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd stock-exchange-matching-engine
```

Compile:

```bash
g++ -std=c++17 -Iinclude main.cpp src/**/*.cpp -o matching_engine
```

Run:

```bash
./matching_engine
```

For Windows:

```bash
matching_engine.exe
```

> Update the compilation command according to the actual source-file structure in the repository.

---

# Example Workflow

```text
1. Create BUY order
        ↓
2. Add order to matching engine
        ↓
3. Locate corresponding stock order book
        ↓
4. Check highest-priority SELL order
        ↓
5. Compare prices
        ↓
6. Execute trade if prices cross
        ↓
7. Update remaining quantities
        ↓
8. Store unfilled quantity
        ↓
9. Record completed trade
        ↓
10. Update market analytics
```

---

# Future Improvements

Potential improvements include:

* [ ] Market orders
* [ ] Stop-loss orders
* [ ] Order cancellation
* [ ] Order modification
* [ ] Persistent trade storage
* [ ] Real-time market-data streaming
* [ ] WebSocket support
* [ ] REST API for order submission
* [ ] Concurrent order processing
* [ ] Performance benchmarking
* [ ] Stress testing with high order throughput
* [ ] Advanced market analytics
* [ ] Improved RAG assistant integration
* [ ] Web-based trading dashboard

---

# Why This Project?

A stock exchange matching engine is a useful systems project because it combines several important backend and computer-science concepts:

* Data structures
* Algorithms
* Priority queues
* Object-oriented design
* Event processing
* State management
* Performance considerations
* API design
* AI/RAG integration

Rather than treating a trading platform as simply a CRUD application, this project focuses on the **core algorithmic system responsible for matching orders and generating trades**.

---

## Author

**Abhidha Patil**

Computer Engineering
Veermata Jijabai Technological Institute (VJTI), Mumbai

---

## License

This project is intended for educational and research purposes.
