# Use an official OpenJDK image
FROM openjdk:17-jdk-slim

# Set working directory inside the container
WORKDIR /app

# Copy the built JAR file from your Maven project folder
COPY Mind_Forge/target/*.jar app.jar

# Run the JAR file
CMD ["java", "-jar", "app.jar"]