#include "market_analytics.h"
#include <iostream>

using namespace std;

MarketAnalytics::MarketAnalytics(
    TradeHistory& tradeHistory
)
    : tradeHistory(tradeHistory)
{
}

int MarketAnalytics::getTradeCount()
{
    return tradeHistory.getTrades().size();
}

int MarketAnalytics::getTotalVolume()
{
    int volume = 0;

    for(const auto& trade : tradeHistory.getTrades())
    {
        volume += trade.quantity;
    }

    return volume;
}

double MarketAnalytics::getAverageTradePrice()
{
    const auto& trades =
        tradeHistory.getTrades();

    if(trades.empty())
    {
        return 0;
    }

    double totalPrice = 0;

    for(const auto& trade : trades)
    {
        totalPrice += trade.price;
    }

    return totalPrice / trades.size();
}

void MarketAnalytics::printAnalytics()
{
    cout << "\n===== MARKET ANALYTICS =====\n";

    cout << "Total Trades: "
         << getTradeCount()
         << endl;

    cout << "Total Volume: "
         << getTotalVolume()
         << endl;

    cout << "Average Trade Price: "
         << getAverageTradePrice()
         << endl;
}