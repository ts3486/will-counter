### Build stage: compile Rust Axum binary
FROM rust:1.75-slim AS build
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

COPY api/Cargo.toml api/Cargo.lock ./api/
WORKDIR /app/api
RUN cargo fetch

COPY api/src ./src

RUN cargo build --release

### Runtime stage: minimal image
FROM gcr.io/distroless/cc-debian12
WORKDIR /app
COPY --from=build /app/api/target/release/will-counter-api /app/will-counter-api

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/app/will-counter-api"]
