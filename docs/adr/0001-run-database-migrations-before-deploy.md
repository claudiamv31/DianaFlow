# Run Database Migrations Before Deploy

DianaFlow's backend runs on a very small Railway budget, so production startup should be optimized for serverless wake-ups instead of migration convenience. Database migrations will run as an intentional deploy step, preferably through an EF Core migration bundle configured as Railway's pre-deploy command, and the API will not apply migrations during normal startup.

The Railway deploy behavior should be stored as config-as-code in the repo. If the migration command fails, Railway should block the new deployment instead of starting backend code that may not match the current database schema.

The Docker build should generate a self-contained Linux EF Core migration bundle and copy it into the final runtime image. Railway can then run the bundle in the pre-deploy phase without installing the .NET SDK in the production container.

The backend should expose a small unauthenticated health endpoint for Railway deployment healthchecks. Railway should only switch traffic to the new deployment after the migration bundle succeeds and the health endpoint returns success.

Production database connections should be tuned for serverless behavior with a small Npgsql connection pool and no minimum idle connections. DianaFlow is a low-traffic portfolio backend, so preserving sleep eligibility is more important than supporting high concurrent database throughput.
