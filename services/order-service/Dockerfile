FROM node:20-alpine

WORKDIR /app/services/order-service
COPY services/order-service/package*.json ./
RUN npm install --include=dev
COPY services/order-service/ ./
EXPOSE 3003
CMD ["npm", "start"]
