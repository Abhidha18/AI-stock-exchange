#include "matchingengine.h"
#include "../models/trade.h"

#include <iostream>
#include <algorithm>

using namespace std;

MatchingEngine::MatchingEngine(
    OrderBook& orderBook,
    TradeHistory& tradeHistory
)
    : orderBook(orderBook),
      tradeHistory(tradeHistory)
{
}

void MatchingEngine::matchOrders()
{
    while (
        orderBook.hasBuyOrders() &&
        orderBook.hasSellOrders())
    {
        Order buy = orderBook.getBestBuy();
        Order sell = orderBook.getBestSell();

        if (buy.stockSymbol != sell.stockSymbol)
        {
            break;
        }

        if (buy.price < sell.price)
        {
            cout << "No more matches possible.\n";
            break;
        }

        int tradeQty = min(
            buy.quantity,
            sell.quantity
        );

        Trade trade(
            buy,
            sell,
            tradeQty,
            buy.price,
            buy.timestamp
        );

        tradeHistory.addTrade(trade);

        cout << "\n===== TRADE EXECUTED =====\n";
        cout << "Stock: " << buy.stockSymbol << endl;
        cout << "Quantity: " << tradeQty << endl;
        cout << "Price: " << buy.price << endl;

        buy.quantity -= tradeQty;
        sell.quantity -= tradeQty;

        orderBook.removeBestBuy();
        orderBook.removeBestSell();

        if (buy.quantity > 0)
        {
            orderBook.addOrder(buy);
        }

        if (sell.quantity > 0)
        {
            orderBook.addOrder(sell);
        }
    }
}