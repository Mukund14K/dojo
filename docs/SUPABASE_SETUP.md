# Supabase Database Configuration

This document outlines the steps required to securely connect your local DOJO Django backend to your Supabase PostgreSQL instance.

## 1. Obtain Your Credentials

1. Open your Supabase project dashboard at [supabase.com](https://supabase.com/).
2. Navigate to **Project Settings** -> **Database**.
3. Under **Connection string**, select **URI**.
4. You will see two port options depending on the connection mode:
   - **Port 5432 (Session pooler / Direct connection):** This is required for Django development and migrations to ensure schema changes apply correctly without breaking transactions.
   - **Port 6543 (Transaction pooler):** Good for highly concurrent serverless environments, but not recommended for initial Django setups or migrations.
5. Copy the connection string containing port `5432` (or the direct connection string).

## 2. Configure Your Local Environment

1. Navigate to the `backend/` directory of this repository.
2. If it doesn't already exist, create a file named `.env` by copying the example file:
   ```bash
   cp .env.example .env
   ```
3. Open `backend/.env` in your text editor.
4. Replace the `DATABASE_URL` placeholder with your actual connection string.
   - **Important:** If your password contains special characters (like `@`, `#`, `?`), you must URL-encode them. (For example, `@` becomes `%40`).
5. Replace the `DJANGO_SECRET_KEY` placeholder with a secure random string.

*Note: Your `.env` file is excluded from version control via `.gitignore`. Never commit these credentials.*

## 3. Test and Run

1. Make sure your Python virtual environment is active in the `backend/` directory:
   ```bash
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
2. Install the necessary dependencies (if you haven't already):
   ```bash
   pip install -r requirements.txt
   ```
3. Test your configuration (this will safely fail with a clear diagnostic if credentials are missing):
   ```bash
   python manage.py check
   ```
4. Once the check passes, run the initial database migrations to create the DOJO tables:
   ```bash
   python manage.py migrate
   ```
5. Start the backend server:
   ```bash
   python manage.py runserver
   ```
