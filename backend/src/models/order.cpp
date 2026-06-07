#include "order.h"

Order::Order(
    int id,
    std::string stockSymbol,
    int quantity,
    int price,
    bool isBuy,
    long long timestamp
)
    : id(id),
      stockSymbol(stockSymbol),
      quantity(quantity),
      price(price),
      isBuy(isBuy),
      timestamp(timestamp)
{
}