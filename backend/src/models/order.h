#pragma once
#include <string>
using namespace std;
class Order
{
public:
    int id;
    string stockSymbol;
    int quantity;
    int price;
    bool isBuy;
    long long timestamp;

    Order(
        int id,
        string stockSymbol,
        int quantity,
        int price,
        bool isBuy,
        long long timestamp
    );
};