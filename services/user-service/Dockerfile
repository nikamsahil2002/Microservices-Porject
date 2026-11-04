FROM node:20-alpine

WORKDIR /app/services/user-service
COPY services/user-service/package*.json ./
RUN npm install --include=dev
COPY services/user-service/ ./
EXPOSE 3001 50051
CMD ["npm", "start"]
