# Ecomm API

## Dependencies

```sh
npm i fastify

# dev deps
npm i typescript tsx -D
```

## Setup

```sh
# initialize git
git init

# initialize npm
npm init -y

# initialize tsconfig
npx tsc --init
```

## Run app

- create & fill .env (using .env.example)

- run postgresql with docker

```sh
# build & migrate
docker-compose up --build

# run detached mode
docker-compose up -d

# verify migration
docker exec -it db-postgres psql -U postgres -d jbl_ecomm_db -c "\dt"
```

- run app (dev mode)

```sh
npm run dev
```
