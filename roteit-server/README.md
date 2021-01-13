# Setup
These instructions assume a Mac system.

1. Start the Postgres database. To run this, use [Postgres.app](https://postgresapp.com/documentation/), and create a database called `lireddit`. Run migrations as per the section below
2. Run Redis, as per the session below

# Postgres/Migrations
Ensure the Postgres database is running before running migrations. For local purposes, use [Postgres.app](https://postgresapp.com/documentation/), and create a database called `lireddit`. To create this database, go into the `psql` command line (by double clicking any seed database that was created by Postgres.app) and then running the following in the psql CLI:

```psql
CREATE DATABASE lireddit;
```

Connect to this DB in the psql command line by using:

```psql
\connect lireddit
```

To run the migrations use:

```bash
npm run create:migrations
```

This will create the migration files in the migrations directory. The migrations are automatically applied when the app is started.

# Redis/Mem Cache
Redis keeps track of active sessions. For local development install Redis using Homebrew. For M1 Macs, the Rosetta version of homebrew must be used. Also, [there is a bug](https://github.com/redis/redis/issues/8062) in Redis that causes M1 Macs to not run redis without sudo access. Until this is fixed, redis can be run using sudo:

```bash
arch -x86_64 brew install redis
sudo redis-server
```

Can interact with Redis using the `redis-cli`, if necessary.

# Error Handling
For consistency, errors are returned in a `FieldError` DTO, rather than using `class-validator`. To use class-validator instead, decorate the DTOs with class-validator decorators as necessary, and then set `validate: true` from `validate: false` where the ApolloServer is instantiated in `index.ts`.