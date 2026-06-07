#include <iostream>

#include "models/order.h"

#include "engine/matchingengine.h"

#include "services/trade_history.h"
#include "services/market_analytics.h"
#include "services/order_management.h"

using namespace std;

int main()
{
    OrderManagement orderManager;

    TradeHistory tradeHistory;

    // RELIANCE

    Order order1(
        1,
        "RELIANCE",
        100,
        2500,
        true,
        1
    );

    Order order2(
        2,
        "RELIANCE",
        40,
        2490,
        false,
        2
    );

    // TCS

    Order order3(
        3,
        "TCS",
        50,
        3500,
        true,
        3
    );

    Order order4(
        4,
        "TCS",
        20,
        3490,
        false,
        4
    );

    orderManager.addOrder(order1);
    orderManager.addOrder(order2);

    orderManager.addOrder(order3);
    orderManager.addOrder(order4);

    MatchingEngine relianceEngine(
        orderManager.getOrderBook(
            "RELIANCE"
        ),
        tradeHistory
    );

    MatchingEngine tcsEngine(
        orderManager.getOrderBook(
            "TCS"
        ),
        tradeHistory
    );

    cout << "\n=== MATCHING RELIANCE ===\n";

    relianceEngine.matchOrders();

    cout << "\n=== MATCHING TCS ===\n";

    tcsEngine.matchOrders();

    tradeHistory.printTrades();
    tradeHistory.exportToCSV();

    MarketAnalytics analytics(
        tradeHistory
    );

    analytics.printAnalytics();

    return 0;
}