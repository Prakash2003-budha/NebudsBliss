# NebudsBliss

## Deploying for free with Render and MongoDB Atlas

This repository contains a Vite frontend and an Express API. The included
[`render.yaml`](./render.yaml) defines both Render services:

- `nebudsbliss-api`: Node/Express backend from `Backend/`
- `nebudsbliss-frontend`: static Vite build from `Frontend/`

### 1. Create the database

1. Create a free MongoDB Atlas cluster.
2. Create a database user and copy the connection string.
3. In Atlas **Network Access**, allow the Render API to connect. For a
   temporary free-tier setup, use `0.0.0.0/0` and protect the database with a
   strong password.

### 2. Create the Render services

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository.
3. Render will detect `render.yaml` and create both services.
4. Set the API service's secret environment variables in the Render dashboard:
   `MONGODB_URL`, `JWT_SECRET`, Cloudinary variables, and SMTP variables.
5. Deploy the API first and copy its public HTTPS URL, for example
   `https://nebudsbliss-api.onrender.com`.
6. Set these API variables:
   - `BACKEND_URL`: the API HTTPS URL
   - `FRONTEND_URL`: the frontend HTTPS URL (only the origin, for example
     `https://nebudsbliss-frontend.onrender.com`; do not add `/:9005` or any
     `/orders/...` path)
   - `CORS_ORIGIN`: the frontend HTTPS URL (without a trailing slash)
7. Set the frontend service's `VITE_API_URL` to the API HTTPS URL and redeploy
   the frontend.

The API health endpoint is available at `/health`. Render's free services may
sleep when idle, so the first request after inactivity can take longer.