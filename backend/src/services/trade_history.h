#pragma once

#include <vector>
#include "../models/trade.h"

class TradeHistory
{
private:
    std::vector<Trade> trades;

public:
    void addTrade(const Trade& trade);
    void exportToCSV();
    void printTrades();
    const std::vector<Trade>& getTrades() const;
};