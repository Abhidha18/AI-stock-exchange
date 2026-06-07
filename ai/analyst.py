import pandas as pd

class MarketAnalyst:

    def __init__(self):
        self.df = pd.read_csv(
            "../backend/database/trades.csv"
        )

    def get_summary(self):

        return {
            "total_trades": len(self.df),
            "total_volume": int(
                self.df["Quantity"].sum()
            ),
            "stocks": list(
                self.df["Stock"].unique()
            ),
            "average_price": float(
                self.df["Price"].mean()
            )
        }