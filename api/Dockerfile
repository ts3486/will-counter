### Build stage: compile fat JAR with Gradle wrapper inside the container
FROM gradle:8.7-jdk17 AS build
WORKDIR /workspace
COPY . .
RUN chmod +x ./gradlew && ./gradlew --no-daemon clean shadowJar

### Runtime stage: run the built JAR on a slim JRE image
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/build/libs/will-counter-api-all.jar app.jar

ENV PORT=8080
EXPOSE 8080

CMD ["java", "-jar", "app.jar"]