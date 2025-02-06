# Ecomm API

## Run app

- install dependencies

```sh
npm install
```

- create & fill .env (using .env.example)

```sh
cp .env.example .env
```

- run postgresql (using docker)

```sh
# build & migrate
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
```
