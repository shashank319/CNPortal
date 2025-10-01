# Troubleshooting Guide

This guide covers common issues developers may face while setting up and running the CNPortal application, along with their solutions.

---

## Client (Angular) Issues

### 1. `npm install` Fails

**Problem:** Errors during `npm install` or dependency installation fails.

**Solutions:**
- Clear npm cache:
  ```bash
  npm cache clean --force
  ```
- Delete `node_modules` and `package-lock.json`, then reinstall:
  ```bash
  cd client
  rmdir /s /q node_modules
  del package-lock.json
  npm install
  ```
- Try using a different Node.js version (use nvm if available)
- Check your internet connection and npm registry access

### 2. Port 4200 Already in Use

**Problem:** `Port 4200 is already in use.`

**Solutions:**
- Kill the process using port 4200:
  ```bash
  # Windows
  netstat -ano | findstr :4200
  taskkill /PID <PID> /F
  ```
- Or run on a different port:
  ```bash
  npm start -- --port 4201
  ```

### 3. Angular CLI Not Found

**Problem:** `'ng' is not recognized as an internal or external command`

**Solutions:**
- Install Angular CLI globally:
  ```bash
  npm install -g @angular/cli
  ```
- Or use npx:
  ```bash
  npx ng serve
  ```

### 4. CORS Errors

**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
- Ensure the API is running on the correct port
- Check `proxy.conf.json` in the client folder (if exists)
- Verify CORS configuration in the server's `Program.cs`

---

## Server (.NET API) Issues

### 1. `dotnet` Command Not Found

**Problem:** `'dotnet' is not recognized as an internal or external command`

**Solutions:**
- Install .NET 8.0 SDK from https://dotnet.microsoft.com/download
- Restart your terminal after installation
- Verify installation:
  ```bash
  dotnet --version
  ```

### 2. Database Connection Fails

**Problem:** `Cannot open database` or connection string errors

**Solutions:**
- Verify SQL Server is running:
  ```bash
  # Check SQL Server service status
  sc query MSSQLSERVER
  ```
- Update connection string in `appsettings.json`:
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=CNPortalDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
  ```
- For SQL Server Express, use:
  ```
  Server=localhost\\SQLEXPRESS;Database=CNPortalDB;Trusted_Connection=True;TrustServerCertificate=True;
  ```
- Ensure SQL Server allows TCP/IP connections

### 3. Entity Framework Migrations Issues

**Problem:** `dotnet ef` command not found or migration fails

**Solutions:**
- Install EF Core tools globally:
  ```bash
  dotnet tool install --global dotnet-ef
  ```
- Update EF Core tools:
  ```bash
  dotnet tool update --global dotnet-ef
  ```
- If migrations fail, try:
  ```bash
  dotnet ef database drop
  dotnet ef migrations remove
  dotnet ef migrations add InitialCreate
  dotnet ef database update
  ```

### 4. Port 5000/5001 Already in Use

**Problem:** Port is already in use by another process

**Solutions:**
- Kill the process:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```
- Change the port in `Properties/launchSettings.json`:
  ```json
  "applicationUrl": "https://localhost:5002;http://localhost:5001"
  ```

### 5. Build Errors

**Problem:** Build fails with package or compilation errors

**Solutions:**
- Clean and rebuild:
  ```bash
  dotnet clean
  dotnet restore
  dotnet build
  ```
- Delete `bin` and `obj` folders:
  ```bash
  rmdir /s /q bin obj
  dotnet restore
  dotnet build
  ```

### 6. JWT Authentication Issues

**Problem:** `401 Unauthorized` errors or token validation fails

**Solutions:**
- Check `appsettings.json` for JWT configuration:
  ```json
  "Jwt": {
    "Key": "your-secret-key-min-32-chars",
    "Issuer": "your-issuer",
    "Audience": "your-audience"
  }
  ```
- Ensure the JWT secret key is at least 32 characters
- Verify token is being sent in request headers: `Authorization: Bearer <token>`

---

## General Issues

### 1. Environment Variables Not Loading

**Problem:** Configuration values not being read correctly

**Solutions:**
- Check `appsettings.Development.json` is being used during development
- Verify environment variable in `Properties/launchSettings.json`:
  ```json
  "environmentVariables": {
    "ASPNETCORE_ENVIRONMENT": "Development"
  }
  ```

### 2. Git Clone Issues

**Problem:** Permission denied or authentication errors

**Solutions:**
- Use HTTPS clone:
  ```bash
  git clone https://github.com/shashank319/CNPortal.git
  ```
- Or setup SSH keys and use SSH clone
- Check GitHub credentials and access permissions

### 3. Slow Performance

**Problem:** Application runs slowly

**Solutions:**
- **Client:**
  - Run production build: `ng build --configuration production`
  - Disable source maps in development
  - Check browser console for errors

- **Server:**
  - Run in Release mode: `dotnet run --configuration Release`
  - Check database query performance
  - Enable database indexing

### 4. Changes Not Reflecting

**Problem:** Code changes don't appear after modification

**Solutions:**
- **Client:**
  - Hard refresh browser (Ctrl + Shift + R)
  - Clear browser cache
  - Restart `ng serve`

- **Server:**
  - Stop and restart `dotnet run`
  - Clean build: `dotnet clean && dotnet build`

---

## Database Issues

### 1. Cannot Create Database

**Problem:** Permission errors when creating database

**Solutions:**
- Run SQL Server Management Studio (SSMS) as Administrator
- Grant database creation permissions to your user
- Use Windows Authentication (Trusted_Connection=True)

### 2. Migration Already Applied

**Problem:** Migration has already been applied to the database

**Solutions:**
- Check applied migrations:
  ```bash
  dotnet ef migrations list
  ```
- Remove last migration:
  ```bash
  dotnet ef migrations remove
  ```
- Or create a new migration:
  ```bash
  dotnet ef migrations add <MigrationName>
  ```

### 3. Database Schema Mismatch

**Problem:** Models don't match database schema

**Solutions:**
- Generate a new migration:
  ```bash
  dotnet ef migrations add FixSchemaMismatch
  dotnet ef database update
  ```
- Or reset database:
  ```bash
  dotnet ef database drop
  dotnet ef database update
  ```

---

## IDE (Visual Studio Code) Issues

### 1. IntelliSense Not Working

**Problem:** No code suggestions or IntelliSense

**Solutions:**
- **Client:**
  - Restart TypeScript server: Ctrl+Shift+P → "TypeScript: Restart TS Server"
  - Check `tsconfig.json` is valid

- **Server:**
  - Install C# extension for VS Code
  - Reload window: Ctrl+Shift+P → "Developer: Reload Window"

### 2. Debugger Not Attaching

**Problem:** Cannot debug application in VS Code

**Solutions:**
- Install required extensions:
  - C# (for .NET debugging)
  - Angular Language Service
- Check `.vscode/launch.json` configuration exists
- Run with debugger: F5

---

## Need More Help?

If you encounter issues not covered here:

1. Check the application logs in the terminal
2. Review browser console for client-side errors (F12)
3. Check SQL Server logs for database issues
4. Search for the specific error message online
5. Open an issue on the GitHub repository with detailed error information

---

## Quick Diagnostic Checklist

Before asking for help, verify:

- [ ] All prerequisites are installed (Node.js, .NET, SQL Server)
- [ ] You've run `npm install` in the client folder
- [ ] You've run `dotnet restore` in the server folder
- [ ] SQL Server is running
- [ ] Database migrations have been applied
- [ ] Connection strings are correct
- [ ] No other application is using ports 4200, 5000, or 5001
- [ ] You're in the correct directory when running commands
- [ ] No firewall or antivirus blocking the ports
