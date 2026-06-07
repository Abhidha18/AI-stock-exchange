import pandas as pd

class DataLoader:

    def __init__(self):
        self.df = pd.read_csv(
            "../backend/database/trades.csv"
        )

    def get_dataframe(self):
        return self.df