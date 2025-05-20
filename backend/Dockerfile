
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY pom.xml .

RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests


FROM openjdk:21-jdk-slim # Or openjdk:21-jre-slim

WORKDIR /app

ENV PORT 9090


COPY --from=builder /build/target/AlumniAssociation1-0.0.1-SNAPSHOT.jar app.jar


EXPOSE ${PORT}

ENTRYPOINT ["java", "-jar", "app.jar"]