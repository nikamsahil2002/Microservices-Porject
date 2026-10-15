# E-commerce Microservices Platform

This repository is a Node.js microservices starter for an e-commerce platform using Express, MongoDB, PostgreSQL, Redis, RabbitMQ and Docker Compose.

## Quick start

```bash
npm install
npm run dev
```

Then access:

- Gateway: http://localhost:8080/health
- User service: http://localhost:3001/health
- Product service: http://localhost:3002/health
- Order service: http://localhost:3003/health
- Notification service: http://localhost:3004/health

## Phase 1 status

The project now includes:

- Docker Compose infrastructure for MongoDB, PostgreSQL, Redis and RabbitMQ
- Service container skeletons for the gateway and microservices
- Health endpoints returning `status`, `uptime` and `dependencies`
- Shared environment validation pattern per service

## Notes

This is the starting point for the assignment. Each phase will add the business logic and tests in sequence.
