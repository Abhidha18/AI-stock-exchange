#pragma once

#include "../services/trade_history.h"

class MarketAnalytics
{
private:
    TradeHistory& tradeHistory;

public:
    MarketAnalytics(TradeHistory& tradeHistory);

    int getTradeCount();

    int getTotalVolume();

    double getAverageTradePrice();

    void printAnalytics();
};