CREATE ROLE root WITH PASSWORD 'pg-password';
ALTER ROLE root WITH LOGIN;
CREATE DATABASE keycloak;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO root;