# Backend Deployment Guide (Render)

This guide explains how to deploy the backend to Render.com and ensure it stays active (keep-alive).

## Prerequisites

- A [Render](https://render.com/) account.
- This repository pushed to GitHub.

## Deployment Steps

1.  **New Web Service**:
    - Go to your Render Dashboard.
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository.

2.  **Configuration**:
    - **Name**: `amount-collector-backend` (or your preferred name)
    - **Region**: Choose the one closest to you (e.g., Singapore).
    - **Runtime**: **Python 3**.
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

3.  **Environment Variables**:
    Add the following environment variables in the "Environment" tab:

    | Key | Value | Description |
    | :--- | :--- | :--- |
    | `PYTHON_VERSION` | `3.11.9` | Ensure Python version matches. |
    | `MONGODB_URL` | `your_mongodb_connection_string` | **Copy from your local .env** |
    | `DATABASE_NAME` | `royal_amount_collector` | Database name. |
    | `SECRET_KEY` | `generate_a_secure_random_string` | Security key for tokens. |
    | `BACKEND_CORS_ORIGINS` | `["http://localhost:5173", "https://your-frontend-url.vercel.app"]` | Allow frontend access. |

    > **Important**: Update `BACKEND_CORS_ORIGINS` with your actual Vercel frontend URL once deployed.

## Keep-Alive Mechanism

The backend is already equipped with a **self-pinging mechanism** to prevent it from sleeping on Render's free tier.

- **How it works**: The server automatically pings itself every 14 minutes.
- **Verification**: You check the logs in the Render dashboard. You should see:
    ```
    Keep-alive: Pinging http://.../health
    Keep-alive status: 200
    ```

### Troubleshooting Keep-Alive
If the self-ping doesn't work (e.g., due to Render's sleep policies), you can use an external free service like **UptimeRobot**:
1.  Create a free account on [UptimeRobot](https://uptimerobot.com/).
2.  Add a new monitor:
    - **Type**: HTTP(s)
    - **URL**: `https://your-backend-app.onrender.com/health`
    - **Interval**: 5 minutes
