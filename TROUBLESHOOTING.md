`# Database Connection Troubleshooting Guide

## Quick Fix: Test Your Connection

Run this command from the `backend` folder to diagnose the issue:

```bash
npm run db:test
```

This will tell you exactly what's wrong. Common issues and fixes are below.

---

## Common Issues & Solutions

### 1. **MySQL Server Not Running**

**Error:** `ECONNREFUSED` or `PROTOCOL_CONNECTION_LOST`

**Fix:**
- **Windows**: 
  ```bash
  # Check if MySQL is running
  mysql --version
  
  # Start MySQL (using Services on Windows)
  # OR if using MySQL via command line:
  mysql -u root -p
  ```
  
  If MySQL isn't installed, install it from: https://dev.mysql.com/downloads/mysql/

---

### 2. **Wrong Credentials**

**Error:** `ER_ACCESS_DENIED_ERROR`

**Fix:**
1. Check your `.env` file in the `backend` folder:
   ```
   DB_USER=root
   DB_PASSWORD=mark@2004
   ```

2. Verify these credentials work by connecting directly:
   ```bash
   mysql -u root -pmark@2004
   ```

3. If that fails, update `.env` with your actual MySQL credentials.

---

### 3. **Database Doesn't Exist**

**Error:** Database error or "unknown database"

**Fix:**
1. Make sure MySQL is running
2. Setup the database:
   ```bash
   npm run db:setup
   ```

---

### 4. **Wrong Host/Port**

**Default values in `.env`:**
```
DB_HOST=localhost
DB_PORT=3306  # MySQL default port
```

**If MySQL is running on a different port:**
- Update `DB_HOST` in `.env` to the correct host:port combination
- Example: `DB_HOST=127.0.0.1` or `DB_HOST=localhost:3307`

---

## Step-by-Step Setup

### 1. Test Database Connection
```bash
cd backend
npm run db:test
```

### 2. If Test Passes, Setup Database
```bash
npm run db:setup
```

### 3. Start Backend Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 4. In Another Terminal, Start Frontend
```bash
cd frontend
npm run dev
```

---

## Checking MySQL Status

### Windows:
```bash
# Check if MySQL service is running
tasklist | find "mysqld"

# Start MySQL service
net start MySQL80
# (replace MySQL80 with your MySQL service name if different)
```

### macOS:
```bash
# Check if MySQL is running
brew services list

# Start MySQL
brew services start mysql
```

### Linux:
```bash
# Check status
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql
```

---

## Still Having Issues?

1. Run `npm run db:test` and share the **exact error message**
2. Check that:
   - MySQL is running
   - `.env` file has correct credentials
   - Database name is `klincity_uganda`
3. Try deleting `node_modules` and reinstalling:
   ```bash
   rm -r node_modules
   npm install
   npm run db:test
   ```

---

## Environment Variables Checklist

Make sure your `.env` file has these (backend folder):

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mark@2004
DB_NAME=klincity_uganda
JWT_SECRET=hey4nrn983j98fy4387ct398uie021ixer-9j23y98ycr30930urx3yr98y3xdmu983yx08973
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
```

And frontend/.env:
```env
VITE_API_URL=http://localhost:5000/api
```
