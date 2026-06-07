#pragma once

#include "order.h"

class Trade
{
public:
    Order buyOrder;
    Order sellOrder;

    int quantity;
    int price;
    long long timestamp;

    Trade(
        const Order& buyOrder,
        const Order& sellOrder,
        int quantity,
        int price,
        long long timestamp
    );
};