#include "orderbook.h"
#include <stdexcept>
void OrderBook::addOrder(const Order& order)
{
    if (order.isBuy)
    {
        buyOrders.push_back(order);
    }
    else
    {
        sellOrders.push_back(order);
    }
}
void OrderBook::printOrderBook()
{
    cout << "Buy Orders:" << endl;
    for (const auto& order : buyOrders)
    {
        cout << "ID: " << order.id
             << ", Stock: " << order.stockSymbol
             << ", Quantity: " << order.quantity
             << ", Price: " << order.price
             << endl;
    }

    cout << "Sell Orders:" << endl;
    for (const auto& order : sellOrders)
    {
        cout << "ID: " << order.id
             << ", Stock: " << order.stockSymbol
             << ", Quantity: " << order.quantity
             << ", Price: " << order.price
             << endl;
    }
}
bool OrderBook::hasBuyOrders()
{
    return !buyOrders.empty();
}

bool OrderBook::hasSellOrders()
{
    return !sellOrders.empty();
}

Order OrderBook::getBestBuy()
{
    if (hasBuyOrders())
    {
        return buyOrders.top();
    }
    throw runtime_error("No buy orders available");
}

Order OrderBook::getBestSell()
{
    if (hasSellOrders())
    {
        return sellOrders.top();
    }
    throw runtime_error("No sell orders available");
}

void OrderBook::removeBestBuy()
{
    if (hasBuyOrders())
    {
        buyOrders.pop();
    }
}

void OrderBook::removeBestSell()
{
    if (hasSellOrders())
    {
        sellOrders.pop();
    }
}