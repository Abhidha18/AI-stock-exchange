#pragma once

#include "orderbook.h"
#include "../services/trade_history.h"

class MatchingEngine
{
private:
    OrderBook& orderBook;
    TradeHistory& tradeHistory;

public:
    MatchingEngine(
        OrderBook& orderBook,
        TradeHistory& tradeHistory
    );

    void matchOrders();
};