#include <vector>
#include "models/Order.h"
#include <queue>
using namespace std;
struct BuyComparator
{
    bool operator()(const Order& a, const Order& b)
    {
        return a.price < b.price;
    }
};

struct SellComparator
{
    bool operator()(const Order& a, const Order& b)
    {
        return a.price > b.price;
    }
};
class OrderBook
{
private:
    priority_queue<Order, vector<Order>, BuyComparator> buyOrders;
    priority_queue<Order, vector<Order>, SellComparator> sellOrders;

public:
    void addOrder(const Order& order);
    void printOrderBook();

     bool hasBuyOrders();
    bool hasSellOrders();

    Order getBestBuy();
    Order getBestSell();

    void removeBestBuy();
    void removeBestSell();
};