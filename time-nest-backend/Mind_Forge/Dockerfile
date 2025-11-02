# Stage 1: Build the JAR
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /build

# Copy pom.xml first for better layer caching
COPY pom.xml ./

# Download dependencies (cached unless pom.xml changes)
RUN mvn dependency:go-offline -B || true

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Run the JAR
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

# Copy the JAR from build stage
COPY --from=build /build/target/*.jar app.jar

# Change ownership to non-root user
RUN chown appuser:appgroup app.jar

# Switch to non-root user
USER appuser

# Railway provides PORT environment variable
ENV PORT=8080

# Expose the port (Railway will override with dynamic port)
EXPOSE ${PORT}

# Production-ready JVM options
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Run the application with PORT from environment
CMD java ${JAVA_OPTS} -Dserver.port=${PORT} -jar app.jar