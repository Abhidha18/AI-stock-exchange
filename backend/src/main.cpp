#include <iostream>

#include "models/Order.h"
#include "engine/OrderBook.h"

using namespace std;

int main()
{
    OrderBook orderBook;

    Order order1(1, "RELIANCE", 100, 2500, true);
    Order order2(2, "TCS", 50, 3500, true);
    Order order3(3, "RELIANCE", 40, 2490, false);

    orderBook.addOrder(order1);
    orderBook.addOrder(order2);
    orderBook.addOrder(order3);

    orderBook.printOrderBook();

    return 0;
}