# Order Management

The system supports multiple stocks.

An unordered_map<string, OrderBook> is used.

Each stock has its own order book.

Examples:

RELIANCE -> OrderBook
TCS -> OrderBook
INFY -> OrderBook

This prevents orders from different stocks from being matched together.