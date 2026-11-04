FROM node:20-alpine

WORKDIR /app/services/product-service
COPY services/product-service/package*.json ./
RUN npm install --include=dev
COPY services/product-service/ ./
EXPOSE 3002 50052
CMD ["npm", "start"]
