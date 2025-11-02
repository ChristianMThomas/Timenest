# Stage 1: Build the JAR
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /build

# Copy your Maven project including wrapper and pom.xml
COPY Mind_Forge/ ./

# Use Maven wrapper if present, fallback to system Maven
RUN ./mvnw clean package -DskipTests || mvn clean package -DskipTests

# Stage 2: Run the JAR
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]