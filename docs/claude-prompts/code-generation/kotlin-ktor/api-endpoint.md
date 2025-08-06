# Kotlin/Ktor API Endpoint Generator

## 🎯 Purpose
Generate type-safe, well-structured Kotlin/Ktor API endpoints following Will Counter project patterns with proper Supabase integration.

## 📋 Template

Copy and customize this template before sending to Claude:

---

**ROLE**: You are a senior Kotlin backend developer creating API endpoints for the Will Counter application using Ktor framework with Supabase PostgreSQL integration.

**PROJECT CONTEXT**:
- **Framework**: Kotlin with Ktor server framework
- **Database**: Supabase PostgreSQL with Exposed ORM
- **Authentication**: Auth0 JWT token validation
- **Security**: Row Level Security (RLS) policies
- **API Style**: RESTful with JSON responses

**ARCHITECTURE PATTERNS**:
- Routes: `/api/src/main/kotlin/com/willcounter/api/routes/`
- Models: `/api/src/main/kotlin/com/willcounter/api/models/`
- Services: `/api/src/main/kotlin/com/willcounter/api/services/`
- DTOs: `/api/src/main/kotlin/com/willcounter/api/dto/`
- Database: `/api/src/main/kotlin/com/willcounter/api/database/`

**EXISTING PATTERNS TO FOLLOW**:
```kotlin
// Standard response format
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: String? = null,
    val timestamp: String = Instant.now().toString()
)

// Route structure
fun Route.endpointRoutes() {
    route("/api/endpoint") {
        get {
            // Implementation
        }
        post {
            // Implementation
        }
    }
}
```

## ENDPOINT SPECIFICATION

**Endpoint Purpose**: [e.g., Create user profile, Get daily statistics, Increment will count]

**HTTP Method & Path**: [e.g., GET /api/users/{id}/statistics]

**Authentication Required**: 
- [ ] Yes (Auth0 JWT required)
- [ ] No (Public endpoint)

**Request Details**:
```kotlin
// Path parameters
data class PathParams(
    val userId: String,
    val date: String?
)

// Query parameters  
data class QueryParams(
    val limit: Int = 30,
    val startDate: String?,
    val endDate: String?
)

// Request body (for POST/PUT/PATCH)
data class RequestBody(
    val field1: String,
    val field2: Int?
)
```

**Response Format**:
```kotlin
// Success response data structure
data class ResponseData(
    val field1: String,
    val field2: Int,
    val createdAt: String
)

// Expected response
ApiResponse<ResponseData> or ApiResponse<List<ResponseData>>
```

**Database Operations**:
- [ ] **Read**: Query existing data
- [ ] **Create**: Insert new records
- [ ] **Update**: Modify existing records
- [ ] **Delete**: Remove records
- [ ] **Complex Query**: Joins, aggregations, etc.

**Business Logic Requirements**:
[Describe the specific business rules this endpoint should enforce]

## SPECIFIC REQUIREMENTS

### For Data Endpoints:
- **Validation**: Input validation with proper error messages
- **Pagination**: Cursor-based or offset pagination for lists
- **Filtering**: Query parameter filtering and sorting
- **Rate Limiting**: Protection against abuse

### For User Endpoints:
- **Auth0 Integration**: JWT token validation and user identification
- **RLS Compliance**: Ensure Row Level Security policies are respected
- **User Context**: Extract user info from Auth0 claims
- **Privacy**: Only return data user is authorized to see

### For Analytics Endpoints:
- **Aggregation**: Efficient database aggregation queries
- **Caching**: Consider caching for expensive calculations
- **Date Handling**: Proper timezone and date range handling
- **Performance**: Optimized queries with proper indexing

## OUTPUT FORMAT

Please generate:

### 📁 File Structure
```
/api/src/main/kotlin/com/willcounter/api/
├── routes/
│   └── {EndpointName}Routes.kt     # Route definitions
├── services/
│   └── {EndpointName}Service.kt    # Business logic
├── dto/
│   ├── {EndpointName}Request.kt    # Request DTOs
│   └── {EndpointName}Response.kt   # Response DTOs
└── models/
    └── {EndpointName}.kt           # Database models (if new)
```

### 🛣️ Route Implementation

#### Routes (`{EndpointName}Routes.kt`)
```kotlin
package com.willcounter.api.routes

import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import com.willcounter.api.services.{EndpointName}Service
import com.willcounter.api.dto.*
import com.willcounter.api.models.ApiResponse

fun Route.{endpointName}Routes() {
    val service = {EndpointName}Service()
    
    route("/api/{endpoint-path}") {
        authenticate("auth0") {
            get {
                // GET implementation with:
                // - Parameter validation
                // - Auth0 user extraction
                // - Service call
                // - Error handling
                // - Proper HTTP status codes
            }
            
            post {
                // POST implementation with:
                // - Request body validation
                // - Business logic execution
                // - Database transaction handling
                // - Response formatting
            }
        }
    }
}
```

#### Service Layer (`{EndpointName}Service.kt`)
```kotlin
package com.willcounter.api.services

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import com.willcounter.api.database.DatabaseFactory.dbQuery
import com.willcounter.api.dto.*
import java.time.Instant

class {EndpointName}Service {
    
    suspend fun operationName(params: RequestParams): ResponseData = dbQuery {
        // Database operations with:
        // - Proper transaction handling
        // - Error handling
        // - Type safety
        // - Performance optimization
    }
    
    private fun validateInput(input: RequestData): ValidationResult {
        // Input validation logic
    }
    
    private fun mapToResponse(entity: DatabaseEntity): ResponseData {
        // Entity to DTO mapping
    }
}
```

#### Request DTOs (`{EndpointName}Request.kt`)
```kotlin
package com.willcounter.api.dto

import kotlinx.serialization.Serializable

@Serializable
data class {EndpointName}Request(
    val field1: String,
    val field2: Int?,
    val field3: List<String> = emptyList()
) {
    fun validate(): ValidationResult {
        // Validation logic with specific error messages
    }
}

@Serializable
data class {EndpointName}QueryParams(
    val limit: Int = 20,
    val offset: Int = 0,
    val sortBy: String = "created_at",
    val sortOrder: String = "desc"
) {
    fun validate(): ValidationResult {
        // Query parameter validation
    }
}
```

#### Response DTOs (`{EndpointName}Response.kt`)
```kotlin
package com.willcounter.api.dto

import kotlinx.serialization.Serializable

@Serializable
data class {EndpointName}Response(
    val id: String,
    val field1: String,
    val field2: Int,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class {EndpointName}ListResponse(
    val items: List<{EndpointName}Response>,
    val pagination: PaginationInfo
)

@Serializable
data class PaginationInfo(
    val total: Int,
    val limit: Int,
    val offset: Int,
    val hasNext: Boolean
)
```

### 🔐 Authentication Integration
```kotlin
// Auth0 user extraction utility
fun ApplicationCall.getUserId(): String? {
    return principal<JWTPrincipal>()?.payload?.getClaim("sub")?.asString()
}

fun ApplicationCall.getUserEmail(): String? {
    return principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()
}

// Usage in routes
authenticate("auth0") {
    get {
        val userId = call.getUserId() 
            ?: return@get call.respond(HttpStatusCode.Unauthorized, 
                ApiResponse<Nothing>(false, error = "User not authenticated"))
        
        // Continue with endpoint logic
    }
}
```

### 🗄️ Database Integration
```kotlin
// Database query examples
suspend fun getByUserId(userId: String): List<EntityData> = dbQuery {
    TableName
        .select { TableName.userId eq userId }
        .orderBy(TableName.createdAt, SortOrder.DESC)
        .map { row ->
            EntityData(
                id = row[TableName.id],
                field1 = row[TableName.field1],
                // ... other fields
            )
        }
}

suspend fun createEntity(userId: String, data: CreateRequest): EntityData = dbQuery {
    val id = TableName.insertAndGetId {
        it[TableName.userId] = userId
        it[TableName.field1] = data.field1
        it[TableName.createdAt] = Instant.now()
    }
    
    getById(id.value) ?: throw Exception("Failed to create entity")
}
```

### 🧪 Testing Examples
```kotlin
// Unit test structure
class {EndpointName}ServiceTest : StringSpec({
    "should create entity successfully" {
        // Test implementation
    }
    
    "should validate input correctly" {
        // Validation test
    }
    
    "should handle database errors gracefully" {
        // Error handling test
    }
})
```

---

**CONSTRAINTS**:
- Must integrate with existing Auth0 JWT authentication
- Should respect Supabase Row Level Security policies
- Must follow project's error handling patterns
- Should include comprehensive input validation
- Must be performant with proper database indexing

## 🔄 Testing and Validation

After generation:

1. **Unit Tests**: Test service layer logic
2. **Integration Tests**: Test complete request/response cycle
3. **Authentication Tests**: Verify JWT validation works
4. **Database Tests**: Test database operations and transactions
5. **Performance Tests**: Ensure queries are optimized

## 📚 Related Documentation

- [API Architecture](/api/README.md) [if exists]
- [Database Schema](/shared/database/schema.sql)
- [Auth0 Integration](/docs/auth0-setup.md) [if exists]
- [Supabase Integration](/docs/supabase-setup.md) [if exists]

## 💡 Tips for Better Endpoints

1. **Consistent Responses**: Use standard ApiResponse format
2. **Proper HTTP Codes**: Return appropriate status codes
3. **Input Validation**: Validate all inputs with clear error messages
4. **Error Handling**: Graceful error handling with logging
5. **Documentation**: Clear API documentation with examples
6. **Security First**: Always validate authentication and authorization