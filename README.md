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

## Service databases

- User service: MongoDB database `microservices-users`
- Product service: MongoDB database `microservices-product`
- Order service: PostgreSQL database `green-dose-local`
- Notification service: PostgreSQL database `microservices-notifications`

Each service connects to its own database before listening for requests. MongoDB schemas are defined in each service's `src/models` folder. The order and notification services create their PostgreSQL tables at startup. When running services outside Docker, start MongoDB and PostgreSQL first and set the connection variables from `.env.example`.

## User authentication

The user service hashes passwords with bcrypt and returns a 15-minute access token plus a 7-day refresh token from registration and login. Send the access token as `Authorization: Bearer <accessToken>`. Refresh tokens are stored as hashes in MongoDB and rotated by `POST /api/users/refresh` with `{ "refreshToken": "..." }`. `POST /api/users/logout` revokes the submitted refresh token. Set distinct `JWT_SECRET` and `JWT_REFRESH_SECRET` values outside development.

## Notes

This is the starting point for the assignment. Each phase will add the business logic and tests in sequence.
