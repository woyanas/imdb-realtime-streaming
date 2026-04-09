-- Create database and table for IMDB movie reviews
CREATE DATABASE imdb_reviews;
\c imdb_reviews;

-- Create the movie_reviews table with logical replication support
CREATE TABLE movie_reviews (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    review_text TEXT NOT NULL,
    sentiment_score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable logical replication on the table
ALTER TABLE movie_reviews REPLICA IDENTITY FULL;

-- Create publication for Debezium
CREATE PUBLICATION dbz_publication FOR TABLE movie_reviews;