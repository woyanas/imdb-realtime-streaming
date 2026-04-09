package com.imdb.processor.repository;

import com.imdb.processor.model.MovieReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieReviewRepository extends JpaRepository<MovieReview, Integer> {
    long countBySentimentScore(Integer score);
    List<MovieReview> findTop50ByOrderByCreatedAtDesc();
}
