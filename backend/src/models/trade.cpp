#include "trade.h"

Trade::Trade(
    const Order& buyOrder,
    const Order& sellOrder,
    int quantity,
    int price,
    long long timestamp
)
    : buyOrder(buyOrder),
      sellOrder(sellOrder),
      quantity(quantity),
      price(price),
      timestamp(timestamp)
{
}