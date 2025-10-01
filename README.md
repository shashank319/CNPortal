# CNPortal

A full-stack application with an Angular client and .NET Web API server.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (v18 or higher)

   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **.NET 8.0 SDK**

   - Download from: https://dotnet.microsoft.com/download
   - Verify installation: `dotnet --version`

3. **Git**

   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

4. **Visual Studio Code** (Recommended)

   - Download from: https://code.visualstudio.com/

5. **SQL Server** (or SQL Server Express)
   - Required for the database backend

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/shashank319/CNPortal.git
```

### 2. Navigate to the Project Directory

```bash
cd CNPortal
```

### 3. Setup the Client (Angular)

#### Step 3.1: Navigate to Client Directory

```bash
cd client
```

#### Step 3.2: Install Node Dependencies

```bash
npm install
```

#### Step 3.3: Run the Client

```bash
npm start
```

The Angular client will start on **http://localhost:4200** (default)

---

### 4. Setup the Server (.NET API)

Open a **new terminal window** and follow these steps:

#### Step 4.1: Navigate to Server Directory

```bash
cd CNPortal/server/CNPortalAPI
```

#### Step 4.2: Restore .NET Dependencies

```bash
dotnet restore
```

#### Step 4.3: Update Database Connection String (if needed)

- Open `appsettings.json` or `appsettings.Development.json`
- Update the connection string to match your SQL Server configuration

#### Step 4.4: Apply Database Migrations

```bash
dotnet ef database update
```

#### Step 4.5: Run the Server

```bash
dotnet run
```

The .NET API will start on **http://localhost:5000** or **https://localhost:5001** (default)

---

## Running Both Client and Server

1. **Terminal 1**: Run the Angular client

   ```bash
   cd CNPortal/client
   npm start
   ```

2. **Terminal 2**: Run the .NET API server

   ```bash
   cd CNPortal/server/CNPortalAPI
   dotnet run
   ```

3. Open your browser and navigate to **http://localhost:4200**

---

## Project Structure

```
CNPortal/
├── client/                 # Angular frontend
│   ├── src/               # Source files
│   └── package.json       # Node dependencies
├── server/                # .NET backend
│   └── CNPortalAPI/       # API project
│       ├── Controllers/   # API controllers
│       ├── Models/        # Data models
│       ├── DTOs/          # Data transfer objects
│       └── Migrations/    # Database migrations
└── README.md
```

---

## Common Issues

### Port Already in Use

- **Client**: If port 4200 is in use, run `npm start -- --port 4201`
- **Server**: If port 5000 is in use, update the port in `Properties/launchSettings.json`

### Database Connection Issues

- Verify SQL Server is running
- Check the connection string in `appsettings.json`
- Ensure the database exists or migrations have been applied

---

## Technologies Used

### Client

- Angular 19
- Angular Material
- TypeScript
- RxJS

### Server

- .NET 8.0
- Entity Framework Core
- SQL Server
- JWT Authentication
- BCrypt for password hashing

---

## License
