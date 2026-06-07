#include "order_management.h"

void OrderManagement::addOrder(
    const Order& order
)
{
    orderBooks[
        order.stockSymbol
    ].addOrder(order);
}

OrderBook& OrderManagement::getOrderBook(
    const std::string& symbol
)
{
    return orderBooks[symbol];
}