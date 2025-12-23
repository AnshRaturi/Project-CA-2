# Build stage for frontend
FROM node:16 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build stage for backend
FROM maven:3.9.6-eclipse-temurin-21 AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml .
COPY backend/src ./src
# Copy frontend build to backend static resources
COPY --from=frontend-builder /app/frontend/build/ ./src/main/resources/static/
RUN mvn clean package -DskipTests

# Final stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-builder /app/backend/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
