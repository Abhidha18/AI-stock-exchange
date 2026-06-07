#include "orderbook.h"
#include <iostream>
#include <stdexcept>
using namespace std;
void OrderBook::addOrder(const Order& order)
{
    if (order.isBuy)
    {
        buyOrders.push(order);
    }
    else
    {
        sellOrders.push(order);
    }
}
void OrderBook::printOrderBook()
{
    if(hasBuyOrders())
    {
        Order buy = buyOrders.top();

        cout << "Best Buy Order\n";
        cout << buy.stockSymbol
             << " "
             << buy.quantity
             << " @ "
             << buy.price
             << endl;
    }

    if(hasSellOrders())
    {
        Order sell = sellOrders.top();

        cout << "Best Sell Order\n";
        cout << sell.stockSymbol
             << " "
             << sell.quantity
             << " @ "
             << sell.price
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