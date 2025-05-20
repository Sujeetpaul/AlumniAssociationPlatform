
FROM openjdk:21-jdk-slim 


WORKDIR /app


ENV PORT 9090


COPY target/AlumniAssociation1-0.0.1-SNAPSHOT.jar app.jar

# Expose the port defined by the PORT environment variable
EXPOSE ${PORT}

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]