#include "Order.h"
#include <string>
Order::Order(
    int id,
    string stockSymbol,
    int quantity,
    int price,
    bool isBuy,
    long long timestamp
) : id(id), stockSymbol(stockSymbol), quantity(quantity), price(price), isBuy(isBuy)
{
    this ->id = id;
    this ->stockSymbol = stockSymbol;
    this ->quantity = quantity;
    this ->price = price;
    this ->isBuy = isBuy;
    this ->timestamp = timestamp;
}