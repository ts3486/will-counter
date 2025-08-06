# Claude Prompt: Migrate API from H2 to Supabase Database

## Context
You are helping me migrate a Kotlin/Ktor API from using H2 in-memory database to Supabase PostgreSQL database. The API is part of a Will Counter application that tracks daily "will" counts for users.

## Current Setup
- **Framework**: Kotlin with Ktor server
- **Current Database**: H2 in-memory database (data lost on restart)
- **Target Database**: Supabase PostgreSQL (cloud-hosted, persistent)
- **Authentication**: Auth0 integration planned
- **Location**: `api/src/main/kotlin/com/willcounter/api/`

## Required Changes

### 1. Update Database Configuration
**File**: `api/src/main/kotlin/com/willcounter/api/config/DatabaseConfig.kt`

**Current Implementation**:
```kotlin
fun init() {
    // For development, we'll use H2 in-memory database
    val config = HikariConfig().apply {
        driverClassName = "org.h2.Driver"
        jdbcUrl = "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DATABASE_TO_UPPER=false"
        username = "sa"
        password = ""
        maximumPoolSize = 10
    }
    
    val dataSource = HikariDataSource(config)
    Database.connect(dataSource)
    
    // Create tables
    transaction {
        SchemaUtils.create(Users, WillCounts)
    }
}
```

**Required Changes**:
- Replace H2 configuration with Supabase PostgreSQL configuration
- Read Supabase credentials from environment variables
- Add SSL configuration for secure Supabase connections
- Extract project ID from Supabase URL
- Use proper PostgreSQL connection parameters

**Environment Variables Needed**:
- `SUPABASE_URL` (format: https://project-id.supabase.co)
- `SUPABASE_ANON_KEY` (starts with eyJ...)

### 2. Update Dependencies
**File**: `api/build.gradle.kts`

**Current Dependencies**:
```kotlin
dependencies {
    implementation("org.postgresql:postgresql:42.7.3")
    implementation("com.h2database:h2:2.2.224")
    // ... other dependencies
}
```

**Required Changes**:
- Keep PostgreSQL dependency (already present)
- Remove H2 dependency (no longer needed)
- Ensure SSL support is available

### 3. Database Schema Migration
**File**: `shared/database/schema.sql`

**Current Schema**: PostgreSQL schema with:
- `users` table with Auth0 integration
- `will_counts` table for daily tracking
- Row Level Security (RLS) policies
- Indexes and helper functions

**Required Actions**:
- Execute this schema in Supabase SQL Editor
- Verify all tables, indexes, and functions are created
- Test RLS policies work correctly

### 4. Environment Configuration
**Files to Create**:
- `.env` file in API root directory
- Update any existing environment configuration

**Required Environment Variables**:
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Connection Testing
**File**: `api/src/main/kotlin/com/willcounter/api/config/DatabaseConfig.kt`

**Add Method**:
```kotlin
fun testConnection(): Boolean = try {
    transaction {
        Users.selectAll().limit(1).count() >= 0
    }
} catch (e: Exception) {
    println("Database connection test failed: ${e.message}")
    false
}
```

## Implementation Requirements

### Database Configuration Changes
1. **Replace H2 with Supabase PostgreSQL**:
   - Use `org.postgresql.Driver`
   - Construct JDBC URL from Supabase project ID
   - Use `postgres` as database name
   - Use anon key as password
   - Add SSL configuration

2. **Environment Variable Handling**:
   - Read `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - Provide fallback values for development
   - Extract project ID from URL

3. **SSL Configuration**:
   - Set `sslmode=require`
   - Configure SSL properties for Supabase

4. **Error Handling**:
   - Add proper exception handling
   - Log connection errors
   - Provide meaningful error messages

### Code Structure
```kotlin
fun init() {
    // Get environment variables
    val supabaseUrl = System.getenv("SUPABASE_URL") ?: "YOUR_SUPABASE_URL"
    val supabaseKey = System.getenv("SUPABASE_ANON_KEY") ?: "YOUR_SUPABASE_ANON_KEY"
    
    // Extract project ID and configure PostgreSQL
    val projectId = extractProjectId(supabaseUrl)
    initPostgreSQL(projectId, supabaseKey)
}

fun initPostgreSQL(projectId: String, password: String) {
    val config = HikariConfig().apply {
        driverClassName = "org.postgresql.Driver"
        jdbcUrl = "jdbc:postgresql://$projectId.supabase.co:5432/postgres"
        username = "postgres"
        this.password = password
        maximumPoolSize = 10
        // SSL configuration
        addDataSourceProperty("sslmode", "require")
    }
    
    val dataSource = HikariDataSource(config)
    Database.connect(dataSource)
    
    // Create tables if they don't exist
    transaction {
        SchemaUtils.createMissingTablesAndColumns(Users, WillCounts)
    }
}
```

## Testing Requirements

### 1. Connection Test
- Test database connection on startup
- Verify tables exist
- Test basic CRUD operations

### 2. API Endpoints Test
- Test `/health` endpoint
- Test user creation/retrieval
- Test will count operations

### 3. Error Scenarios
- Test with invalid credentials
- Test with missing environment variables
- Test network connectivity issues

## Expected Outcome

After implementation:
1. API connects to Supabase PostgreSQL instead of H2
2. Data persists across server restarts
3. All existing API endpoints work correctly
4. Proper error handling for database issues
5. Environment variable configuration works
6. SSL connections are secure

## Files to Modify
1. `api/src/main/kotlin/com/willcounter/api/config/DatabaseConfig.kt`
2. `api/build.gradle.kts` (remove H2 dependency)
3. Create `.env` file with Supabase credentials
4. Update any documentation

## Additional Considerations
- Ensure backward compatibility during migration
- Add proper logging for database operations
- Consider connection pooling optimization
- Plan for production deployment
- Set up monitoring and alerting

Please implement these changes step by step, ensuring each modification is tested before proceeding to the next. 