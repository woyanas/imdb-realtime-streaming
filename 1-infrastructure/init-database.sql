-- Create database
CREATE DATABASE imdb_reviews;

-- Connect to the database
\c imdb_reviews;

-- Create movie_reviews table
CREATE TABLE movie_reviews (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    review_text TEXT NOT NULL,
    sentiment_score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX idx_movie_reviews_created_at ON movie_reviews(created_at);
CREATE INDEX idx_movie_reviews_sentiment ON movie_reviews(sentiment_score);

-- Create publication for Debezium
CREATE PUBLICATION dbz_publication FOR TABLE movie_reviews;