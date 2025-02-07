# Ecomm API

## Getting started

- install dependencies

```sh
npm install
```

- create & fill .env

```sh
# fill .env with .env.example
cp .env.example .env
```

- run postgresql (using docker)

```sh
# build & migrate init.sql
docker-compose up --build

# run detached mode
docker-compose up -d

# verify migration
docker exec -it db-postgres psql -U postgres -d jbl_ecomm_db -c "\dt"
```

- run app (watch)

```sh
npm run dev

# server listening on http://localhost:4000
```

## Setup (personal notes)

```sh
# initialize git
git init

# initialize npm
npm init -y

# initialize tsconfig
npx tsc --init

# clean up docker (db)
docker-compose down -v
```
