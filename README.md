# Migrations
Ensure the Postgres database is running before running migrations. For local purposes, use [Postgres.app](https://postgresapp.com/documentation/), and create a database called `lireddit`. To create this database, go into the `psql` command line (by double clicking any seed database that was created by Postgres.app) and then running the following in the psql CLI:

```
CREATE DATABASE lireddit;
```

Connect to this DB in the psql command line by using:

```
\connect lireddit
```

To run the migrations use:

```
npm run create:migrations
```

This will create the migration files in the migrations directory. The migrations are automatically applied when the app is started.
