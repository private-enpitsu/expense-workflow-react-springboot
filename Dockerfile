# =========================
# frontend build
# =========================
FROM node:18 AS frontend-build
WORKDIR /app/frontend

COPY frontend/expense-workflow-frontend/package*.json ./
RUN npm install

COPY frontend/expense-workflow-frontend ./
RUN npm run build

# =========================
# backend build
# =========================
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend

COPY backend/expense-workflow-backend/pom.xml ./
RUN mvn -B dependency:go-offline

COPY backend/expense-workflow-backend ./

# フロント成果物を組み込み
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static

RUN mvn clean package -DskipTests

# =========================
# run
# =========================
FROM eclipse-temurin:17-jdk
WORKDIR /app

COPY --from=backend-build /app/backend/target/*.jar app.jar

CMD ["java", "-jar", "app.jar"]