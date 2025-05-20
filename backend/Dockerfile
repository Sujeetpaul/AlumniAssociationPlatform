# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY pom.xml .
# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the runtime image
# Use a slimmer official OpenJDK 21 image as base
FROM openjdk:21-jdk-slim

WORKDIR /app

# Environment variable for the port. Render will set this at runtime.
ENV PORT 9090

# Copy the built jar file from the builder stage
COPY --from=builder /build/target/AlumniAssociation1-0.0.1-SNAPSHOT.jar app.jar

# Expose the port defined by the PORT environment variable
EXPOSE ${PORT}

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]