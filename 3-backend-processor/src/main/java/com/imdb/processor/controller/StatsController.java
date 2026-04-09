package com.imdb.processor.controller;

import com.imdb.processor.model.MovieReview;
import com.imdb.processor.repository.MovieReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*") // Allow any origin since dev frontend is on :5173
public class StatsController {

    private final MovieReviewRepository repository;

    @Autowired
    public StatsController(MovieReviewRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Map<String, Object> getInitialStats() {
        long total = repository.count();
        long positive = repository.countBySentimentScore(1);
        long negative = repository.countBySentimentScore(-1);
        
        List<MovieReview> topReviews = repository.findTop50ByOrderByCreatedAtDesc();
        
        Map<String, Object> response = new HashMap<>();
        response.put("total", total);
        response.put("positive", positive);
        response.put("negative", negative);
        
        // Map to match the ReviewMessage format the UI expects
        List<Map<String, Object>> items = topReviews.stream().map(r -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("username", r.getUsername());
            dto.put("reviewText", r.getReviewText());
            dto.put("sentimentScore", r.getSentimentScore());
            return dto;
        }).collect(Collectors.toList());

        response.put("items", items);
        
        return response;
    }
}
