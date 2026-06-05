#pragma once

#include "orderbook.h"

class MatchingEngine
{
private:
    OrderBook& orderBook;

public:
    MatchingEngine(OrderBook& orderBook);

    void matchOrders();
};