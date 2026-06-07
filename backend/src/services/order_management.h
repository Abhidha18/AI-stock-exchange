#pragma once

#include <unordered_map>
#include <string>

#include "../engine/orderbook.h"

class OrderManagement
{
private:
    std::unordered_map<
        std::string,
        OrderBook
    > orderBooks;

public:
    void addOrder(const Order& order);

    OrderBook& getOrderBook(
        const std::string& symbol
    );
};