package com.example.alumniassocaition1.config; // Or your preferred config package

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary // Ensures this ObjectMapper is used by default
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();

        // Register JavaTimeModule to handle Java 8 Date & Time API (LocalDate, LocalDateTime, etc.)
        // This is crucial for serializing/deserializing LocalDateTime from/to ISO 8601 strings.
        objectMapper.registerModule(new JavaTimeModule());

        // Configure to not fail on unknown properties in JSON during deserialization.
        // This can make your API more resilient to minor changes or extra fields in requests.
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        // Configure to not write dates as timestamps (use ISO-8601 string format)
        // Spring Boot default usually does this correctly with JavaTimeModule, but explicit is fine.
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // You can add other common configurations here, for example:
        // objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL); // Don't include null fields in JSON output

        return objectMapper;
    }
}
