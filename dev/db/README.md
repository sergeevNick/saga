# About

This project contains the PostgreSQL database, Liquibase, and patching SQL-scripts.

# Add a new change

1. Add a new SQL-script to the `changes` folder:\
`{order}--{name}.sql`
2. Add a new row to the `master.xml` file

# Testing locally

Sometimes we need to test that our newly added changeset is applied or 
apply SQL-script on the database manually.

## Build

```
docker build -t supply-storage .
```

## Run

```
docker run -it -e POSTGRES_DB=supply -e POSTGRES_PASSWORD=000000 -e POSTGRES_HOST=localhost -e POSTGRES_PORT=5432 -e POSTGRES_USERNAME=postgres -p 5550:5432 supply-storage
```

# Project 

```
/changes 
    /*.sql — all changes which will be applied
    /master.xml — aggregates all sql-scripts
```

# Dependencies

[`docker-postgres-liquibase:1.1`](https://github.com/eigen-space/docker-postgres-liquibase) 
— a base image for Postgres database with Liquibase

