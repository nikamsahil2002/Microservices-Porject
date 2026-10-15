FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
