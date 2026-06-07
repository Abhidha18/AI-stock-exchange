# Price Time Priority

The matching engine follows price-time priority.

For buy orders:
- Higher price gets priority.
- If prices are equal, earlier timestamp gets priority.

For sell orders:
- Lower price gets priority.
- If prices are equal, earlier timestamp gets priority.

This ensures fairness in order execution.