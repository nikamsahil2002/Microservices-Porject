# E-commerce Microservices Platform

This repository is a Node.js microservices starter for an e-commerce platform using Express, MongoDB, PostgreSQL, Redis, RabbitMQ and Docker Compose.

## Quick start

```bash
npm install
npm run dev
```

Then access:

- Gateway: http://localhost:8080/health

Application APIs are accessed through the gateway; service ports are not published to the host.

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

The API gateway is the public HTTP entry point on port `8080` and forwards requests for `/api/users`, `/api/products`, `/api/orders`, and `/api/notifications` to their services. For protected routes, each service sends the incoming bearer token to the gateway's `POST /internal/auth/verify` endpoint before handling the request. The gateway verifies the token and returns the user claims; the service proceeds only if verification succeeds and fails closed if the gateway is unavailable. This also lets a service validate tokens centrally when called directly. Docker Compose keeps service HTTP and gRPC ports internal so clients access APIs through the gateway, and configures `GATEWAY_AUTH_URL` for each service. The gateway and user service must use the same `JWT_SECRET`; Docker Compose configures both from that variable. When running services outside Docker, the gateway accepts `USER_SERVICE_URL`, `PRODUCT_SERVICE_URL`, and `ORDER_SERVICE_URL` to configure the upstream addresses.

## Product API

The product service exposes CRUD endpoints under `/api/products`:

- `POST /api/products` creates a product. Required fields: `name`, `sku`, and `price`.
- `GET /api/products?page=1&limit=10` lists products with pagination (page defaults to `1`, limit defaults to `10`, maximum limit is `100`).
- `GET /api/products/:id` retrieves a product by MongoDB ID.
- `PUT /api/products/:id` updates a product. Required fields: `name`, `sku`, and `price`.
- `DELETE /api/products/:id` deletes a product.

Products can also include `description`, `stock`, and `active`.

## Order API

The order service exposes CRUD endpoints under `/api/orders`:

- `POST /api/orders` creates an order. Required fields: `userId`, `productId`, `quantity`, and `totalAmount`.
- `GET /api/orders?page=1&limit=10` lists orders with pagination. Page defaults to `1`, limit defaults to `10`, and the maximum limit is `100`.
- `GET /api/orders/:id` retrieves an order by UUID.
- `PUT /api/orders/:id` updates an order. It accepts the create fields and an optional `status` (`pending`, `paid`, `cancelled`, or `fulfilled`).
- `DELETE /api/orders/:id` deletes an order.

Order creation uses gRPC to verify the user and product and check product stock before saving the order.

## Internal gRPC

The user service listens for gRPC on port `50051`; the product service listens on port `50052`. Order service uses these endpoints internally. Each service keeps its own proto contracts under its `proto` folder; order-service has local copies of the contracts it consumes. With Docker Compose, the service hosts are configured automatically. For local processes, set `USER_GRPC_HOST` and `PRODUCT_GRPC_HOST` in order-service if the defaults (`localhost:50051` and `localhost:50052`) do not apply.

Both gRPC servers implement the standard gRPC health-check service (`grpc.health.v1.Health`) and report their service as `SERVING` after their database connection is established. Use a gRPC health-check client to call `Check` with service name `user.UserService` or `product.ProductService`.

## Notes

This is the starting point for the assignment. Each phase will add the business logic and tests in sequence.
