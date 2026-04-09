package com.imdb.processor.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewMessage {
    private String username;
    @JsonProperty("review_text")
    private String reviewText;
    @JsonProperty("sentiment_score")
    private Integer sentimentScore;
}