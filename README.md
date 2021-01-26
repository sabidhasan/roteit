# RoteIt
[Deployed](https://roteit.vercel.app/) on Vercel/Heroku! Tested as of Jan 2021.

# Background
> **RoteIt** is a small [HackerNews](https://news.ycombinator.com/)-inspired website that allows users to post and vote on text-only posts

Based on Ben Awad's [Fullstack React GraphQL TypeScript Tutorial](https://www.youtube.com/watch?v=I6ypD7qv3Z8), but the code differs somewhat from his finished product, as I have used his tutorial as a code-along guide, rather than aiming to have code/feature-parity.

# Tech Stack
One of the purposes of doing this project was the modern tech stack:
## Front end
- [React](https://reactjs.org/) with Typescript
- [Next.JS ](https://nextjs.org/) including server side rendering
- [GraphQL](https://graphql.org/) with [URQL](https://formidable.com/open-source/urql/) as a client side library, and [GraphQL-Code-Generator](https://graphql-code-generator.com/)
- [ChakraUI](https://chakra-ui.com/) for styling and CSS

## Backend
- [NodeJS](https://nodejs.org/en/) and [Express](https://expressjs.com/) with Typescript
- [Redis](https://redis.io/) and [express-session](https://github.com/expressjs/session#readme)
- [Postgres](https://www.postgresql.org/) as data store

# Setup
## Front End
The frontend is bootstrapped with NextJS.

### Environment Variables
Create environment variables for the configuration for the front end in the `roteit-web` directory, based off the `.env.example` example file. The default value is shown below for running locally:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/graphql
```

### Install Dependencies
Install dependencies using [npm](http://npmjs.com/) or [yarn](https://yarnpkg.com/):

```bash
npm install
yarn install
```

### Run
The front end should be ready to run with `npm run dev`, but won't show any data until the backend is operating.

## Backend
These instructions assume a Mac system, and probably need to be modified for running this on Windows.

### Environment Variables
Create environment variables corresponding to configuration for the app's backend in the `roteit-api` directory, based off `.env.example` file:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/roteit
REDIS_URL=127.0.0.1:6379
PORT=4000
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=<some secret>
```

### Running Services
#### Database: Postgres
For macOS, Postgres can be run using [Postgres.app](https://postgresapp.com/). Once the app is installed and running, you can go into the `psql` command line (by double clicking any seed database that was created by Postgres.app), and then create an empty database called `roteit`. The second command should not error out:

```psql
CREATE DATABASE roteit;
\connect roteit;
```

#### Mem Cache: Redis
Redis keeps track of users' active sessions. For local development install Redis using Homebrew, generally using [these](https://medium.com/@petehouston/install-and-config-redis-on-mac-os-x-via-homebrew-eb8df9a4f298) instructions. For M1 Macs, the Rosetta version of homebrew must be used. Also, [there is a bug](https://github.com/redis/redis/issues/8062) in Redis that causes M1 Macs to not run redis without sudo access. Until this is fixed, redis can be run using sudo:

```bash
arch -x86_64 brew install redis
sudo redis-server
```

Start an instance of the redis server; the second command should return `PONG`. If needed, the environment variable for `REDIS_URL` should be updated. You can interact with the running Redis instance by using the `redis-cli`, if necessary.

```bash
redis-server /usr/local/etc/redis.conf
redis-cli ping
```

### Install Dependencies
Install dependencies using [npm](http://npmjs.com/) or [yarn](https://yarnpkg.com/):

```bash
npm install
yarn install
```

### Run the Backend
If everything worked, server can be started, and should run migrations on first load with an empty database (see Seeding Database section below):

```bash
npm run dev
```

### Seeding Database

For seeding the Postgres database and creating empty tables, a mock `ormconfig.json` exists in the root directory that should point to an empty Postgres database.
Then, the following command will create a migration for generating initial tables for a blank database (this is how the `Initial` migration in the Migrations directory was created). The resulting file needs to be placed in the `/migrations` directory; by default is is in `src`.

```
npx typeorm migration:generate -n Initial
```

Running this migration and creating this empty DB is only needed if the models or tables ave changed; on local environment, `synchronize` can be set to `true`, which force-syncs the models/entities, anyway.

When the app starts, migrations will auto-run


# Deployment
## Backend
For deploying to Heroku, first log into Heroku and confirm that the addons (Redis and Postgres) are running for the backend:

```
heroku login
heroku addons
```

Set up buildpacks, which instruct Heroku on how to build the app. The Subdir-Heroku buildpack allows deploying the app from a subdirectory. This is needed because this application is contains the front end and the backend in the same Git repository.

```
heroku git:remote -a roteit
heroku buildpacks:clear
heroku buildpacks:set https://github.com/timanovsky/subdir-heroku-buildpack
heroku buildpacks:add heroku/nodejs
```

Set config to use the server directory and deploy the app using Heroku. Because the frontend and backend are in the same repository, we have [renamed](https://adampaxton.com/how-to-deploy-to-multiple-heroku-apps-from-the-same-git-repository/) the Heroku remote from `heroku` to `heroku-api` and `heroku-client`.

```
heroku config:set PROJECT_PATH=roteit-server/
git push heroku-api master
```

Check the logs from the running app (Heroku GUI can be used for this, as well), and ensure no errors exist. On first launch, we should have migrations running as well. Also the API should be available at the [graphql endpoint](http://roteit.herokuapp.com/graphql), though it won't have the GQL UI because it is running in production mode.

```
heroku logs --tail
```

## Frontend
To do... We may need to use a different approach than using the Subdir Heroku buildpack, because that probably only supports one subdirectory.

# To Do
- Set up front end server using Vercel or Heroku
- Containerize everything via Docker

# Contributing
## Server Side Rendering
To enable server side rendering on a component URQL needs to play nicely with NextJS, and there is a library called `next-urql` that helps with that.
You can use the following to enable SSR on a component:

```tsx
export default 
(createUrqlClient, { ssr: true })(SomeComponent);
```

This tells the NextJS server to render

## Generating GraphQL Types
The GraphQL types can be generated by using:

```bash
npm run gen:types
```

## Error Handling
For consistency, errors are returned in a `FieldError` DTO, rather than using `class-validator`. To use class-validator instead, decorate the DTOs with class-validator decorators as necessary, and then set `validate: true` from `validate: false` where the ApolloServer is instantiated in `index.ts`.

## Migrations
**Caution: This section may be outdated**. For local development, it is probably easiest to set `synchronize: true` in the postgres configuration, turn off migrations and make changes to models as needed.

Ensure the Postgres database is running, and has the app database before running migrations. For local purposes, use [Postgres.app](https://postgresapp.com/documentation/), and create a database called `roteit`. To run the migrations use:

```bash
npm run create:migrations
```

This will create the migration files in the migrations directory. The migrations are automatically applied when the app is started.
