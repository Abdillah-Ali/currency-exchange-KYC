# Bureau de Change Backend System

This is a modular backend system built with Node.js, Express, and PostgreSQL. It follows a microservices-inspired architecture where each domain (Queue, KYC, Teller, etc.) is isolated in its own service folder.

## Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

## Setup
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   - Create a PostgreSQL database (e.g., `bdc_system`).
   - Run the schema script to create tables:
     ```bash
     psql -U postgres -d bdc_system -f schema.sql
     ```

3. **Environment Variables**
   - Create a `.env` file in this directory:
     ```
     PORT=3000
     DB_USER=postgres
     DB_HOST=localhost
     DB_NAME=bdc_system
     DB_PASSWORD=yourpassword
     DB_PORT=5432
     ```

4. **Run Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### 🟢 Queue Service (`/api/queue`)
- `POST /join`: Register a new customer in queue.
  - Body: `{ full_name, phone_number, id_type, id_number, transaction_type, currency_code }`
- `GET /list`: List currently waiting customers.

### 🔵 Teller Service (`/api/teller`)
- `POST /call-next`: Assign the next customer to a teller.
  - Body: `{ teller_id }`
- `POST /transaction`: Execute a transaction (TODO).

### 🟠 Admin Service (`/api/admin`)
- `GET /inventory`: View currency stock and rates.

## Architecture
The system is built as a **Modular Monolith**.
- **`/src/services`**: Contains business logic for each domain.
- **`/src/db`**: database connection pool.
- **`server.js`**: Main gateway that combines all services.

To scale into true microservices, you can deploy each folder in `/src/services` as a separate Express app.
