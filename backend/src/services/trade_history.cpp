#include "trade_history.h"
#include <iostream>
#include <fstream>

using namespace std;

void TradeHistory::addTrade(const Trade& trade)
{
    trades.push_back(trade);
}

void TradeHistory::printTrades()
{
    cout << "\n===== TRADE HISTORY =====\n";

    for(const auto& trade : trades)
    {
       cout << "Buy Order ID: "
     << trade.buyOrder.id
     << " | Sell Order ID: "
     << trade.sellOrder.id
     << " | Stock: "
     << trade.buyOrder.stockSymbol
     << " | Quantity: "
     << trade.quantity
     << " | Price: "
     << trade.price
     << endl;
    }
}
void TradeHistory::exportToCSV()
{
    std::ofstream file(
        "../database/trades.csv"
    );

    file
        << "BuyOrderID,"
        << "SellOrderID,"
        << "Stock,"
        << "Quantity,"
        << "Price,"
        << "Timestamp\n";

    for(const auto& trade : trades)
    {
        file
            << trade.buyOrder.id << ","
            << trade.sellOrder.id << ","
            << trade.buyOrder.stockSymbol << ","
            << trade.quantity << ","
            << trade.price << ","
            << trade.timestamp << "\n";
    }

    file.close();
}
const std::vector<Trade>& TradeHistory::getTrades() const
{
    return trades;
}
