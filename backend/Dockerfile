# Use a slimmer official OpenJDK 21 image as base
FROM openjdk:21-jdk-slim # Or openjdk:21-jre-slim if only JRE is needed

# Set the working directory inside the container
WORKDIR /app

# Environment variable for the port. Render will set this at runtime.
# Spring Boot's application.properties should use this: server.port=${PORT:9090}
ENV PORT 9090

# Copy the built jar file from your local machine to the container.
# Ensure 'target/AlumniAssociation1-0.0.1-SNAPSHOT.jar' is correct
# relative to the 'Root Directory' (backend/) when Render builds.
COPY target/AlumniAssociation1-0.0.1-SNAPSHOT.jar app.jar

# Expose the port defined by the PORT environment variable
EXPOSE ${PORT}

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]