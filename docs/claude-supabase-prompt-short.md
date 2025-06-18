# Quick Claude Prompt: H2 to Supabase Migration

## Task
Migrate my Kotlin/Ktor API from H2 in-memory database to Supabase PostgreSQL database.

## Current State
- **File**: `api/src/main/kotlin/com/willcounter/api/config/DatabaseConfig.kt`
- **Current**: Uses H2 in-memory database (`jdbc:h2:mem:testdb`)
- **Target**: Supabase PostgreSQL with environment variables

## Required Changes

### 1. Update DatabaseConfig.kt
Replace the `init()` function to:
- Read `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables
- Extract project ID from Supabase URL (format: https://project-id.supabase.co)
- Use PostgreSQL driver with SSL configuration
- Connect to `project-id.supabase.co:5432/postgres`
- Use anon key as password

### 2. Environment Variables
Create `.env` file with:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Remove H2 Dependency
In `api/build.gradle.kts`, remove:
```kotlin
implementation("com.h2database:h2:2.2.224")
```

## Expected Code Structure
```kotlin
fun init() {
    val supabaseUrl = System.getenv("SUPABASE_URL") ?: "YOUR_SUPABASE_URL"
    val supabaseKey = System.getenv("SUPABASE_ANON_KEY") ?: "YOUR_SUPABASE_ANON_KEY"
    
    val projectId = supabaseUrl.replace("https://", "").replace(".supabase.co", "")
    
    val config = HikariConfig().apply {
        driverClassName = "org.postgresql.Driver"
        jdbcUrl = "jdbc:postgresql://$projectId.supabase.co:5432/postgres"
        username = "postgres"
        password = supabaseKey
        maximumPoolSize = 10
        addDataSourceProperty("sslmode", "require")
    }
    
    val dataSource = HikariDataSource(config)
    Database.connect(dataSource)
    
    transaction {
        SchemaUtils.createMissingTablesAndColumns(Users, WillCounts)
    }
}
```

## Schema
Use the existing schema from `shared/database/schema.sql` in Supabase SQL Editor.

## Test
Add connection test method and verify API starts successfully with Supabase. 