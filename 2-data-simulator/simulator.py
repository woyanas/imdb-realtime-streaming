#!/usr/bin/env python3
"""
IMDB Movie Review Data Simulator
Reads the IMDB dataset CSV and streams reviews to PostgreSQL database
with random delays to simulate real-time data flow.
"""

import pandas as pd
import psycopg2
import time
import random
import os
from datetime import datetime

class IMDBDataSimulator:
    def __init__(self, csv_path, db_config):
        """
        Initialize the simulator with CSV path and database configuration
        """
        self.csv_path = csv_path
        self.db_config = db_config
        self.reviews = []

    def load_data(self):
        """
        Load and preprocess the IMDB dataset
        """
        print("Loading IMDB dataset...")
        df = pd.read_csv(self.csv_path)

        # Convert sentiment to numeric scores
        df['sentiment_score'] = df['sentiment'].apply(
            lambda x: 1 if x.lower() == 'positive' else -1
        )

        # Generate usernames based on index
        df['username'] = df.index.map(lambda x: f"user{x:05d}")

        # Convert to list of dictionaries for easy processing
        self.reviews = df[['username', 'review', 'sentiment_score']].to_dict('records')
        print(f"Loaded {len(self.reviews)} reviews")

    def connect_to_db(self):
        print(f"Connecting to DB at {os.getenv('DB_HOST', 'postgres')}...")
        try:
            # Gunakan parameter eksplisit, jangan pakai dsn string agar lebih aman
            conn = psycopg2.connect(
                host=os.getenv('DB_HOST', 'postgres'),
                port=os.getenv('DB_PORT', '5432'),
                database=os.getenv('DB_NAME', 'imdb_reviews'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', 'postgres'),
                connect_timeout=10 # Tambahkan timeout agar tidak gantung
            )
            print("Successfully connected to database!")
            return conn
        except Exception as e:
            print(f"Database connection failed: {e}")
            # Jangan langsung crash, tunggu sebentar lalu coba lagi
            time.sleep(5)
            return self.connect_to_db()

    def insert_review(self, conn, review):
        """
        Insert a single review into the database
        """
        query = """
            INSERT INTO movie_reviews (username, review_text, sentiment_score, created_at)
            VALUES (%s, %s, %s, %s)
        """

        with conn.cursor() as cur:
            cur.execute(query, (
                review['username'],
                review['review'],
                review['sentiment_score'],
                datetime.now()
            ))
        conn.commit()

        sentiment = "POSITIVE" if review['sentiment_score'] == 1 else "NEGATIVE"
        print(f"Inserted {sentiment} review from {review['username']}")

    def run_simulation(self):
        """
        Main simulation loop - inserts reviews with random delays
        """
        self.load_data()

        # Database configuration
        db_config = {
            'host': 'localhost',
            'port': 5432,
            'database': 'imdb_reviews',
            'user': 'postgres',
            'password': 'postgres'
        }

        conn = self.connect_to_db()

        print("Starting data simulation...")
        print("Press Ctrl+C to stop")

        try:
            for review in self.reviews:
                # Insert the review
                self.insert_review(conn, review)

                # Random delay between 1-3 seconds
                delay = random.uniform(1.0, 3.0)
                time.sleep(delay)

        except KeyboardInterrupt:
            print("\nSimulation stopped by user")
        except Exception as e:
            print(f"Simulation error: {e}")
        finally:
            conn.close()
            print("Database connection closed")

if __name__ == "__main__":
    # Configuration
    csv_path = "IMDB_Dataset.csv"  # Update this path to your actual CSV location

    simulator = IMDBDataSimulator(csv_path, {})
    simulator.run_simulation()