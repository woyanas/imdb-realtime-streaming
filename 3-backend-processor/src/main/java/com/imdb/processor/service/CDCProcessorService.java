package com.imdb.processor.service;

import com.imdb.processor.model.ReviewMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CDCProcessorService {

    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "imdb_server.public.movie_reviews")
    public void processReview(ReviewMessage reviewMessage) {
        log.info("Received review from Kafka: {}", reviewMessage);

        // Send the review to WebSocket clients
        messagingTemplate.convertAndSend("/topic/sentiment", reviewMessage);
        log.info("Sent review to WebSocket: {}", reviewMessage);
    }
}