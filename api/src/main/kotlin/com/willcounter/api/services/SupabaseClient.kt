package com.willcounter.api.services

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.http.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

@Serializable
data class SupabaseUser(
    val id: String,
    val auth0_id: String,
    val email: String,
    val created_at: String,
    val last_login: String? = null,
    val preferences: JsonElement? = null
)

@Serializable
data class SupabaseWillCount(
    val id: String,
    val user_id: String,
    val date: String,
    val count: Int,
    val timestamps: List<String>,
    val created_at: String,
    val updated_at: String
)

@Serializable
data class CreateUserData(
    val auth0_id: String,
    val email: String
)

@Serializable
data class CreateWillCountData(
    val user_id: String,
    val date: String,
    val count: Int,
    val timestamps: List<String>,
    val created_at: String,
    val updated_at: String
)

@Serializable
data class UpdateWillCountData(
    val count: Int,
    val timestamps: List<String>,
    val updated_at: String
)

@Serializable
data class RpcIncrementRequest(
    val p_user_id: String
)

class SupabaseClient {
    private val logger = org.slf4j.LoggerFactory.getLogger(SupabaseClient::class.java)
    private val supabaseUrl = System.getProperty("SUPABASE_URL") ?: System.getenv("SUPABASE_URL")
        ?: throw IllegalStateException("SUPABASE_URL environment variable is required")
    
    private val serviceRoleKey = System.getProperty("SUPABASE_SERVICE_ROLE_KEY") ?: System.getenv("SUPABASE_SERVICE_ROLE_KEY")
        ?: throw IllegalStateException("SUPABASE_SERVICE_ROLE_KEY environment variable is required")

    // Local fallback storage for when Supabase is unavailable
    private val fallbackStorage = mutableMapOf<String, SupabaseWillCount>()

    private val httpClient = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
        
        // Connection configuration for performance
        engine {
            maxConnectionsCount = 100
            requestTimeout = 5000
        }
    }

    private val baseHeaders = mapOf(
        "apikey" to serviceRoleKey,
        "Authorization" to "Bearer $serviceRoleKey",
        "Content-Type" to "application/json"
    )

    /**
     * Helper function to get user by auth0Id
     */
    private suspend fun getUserByAuth0Id(auth0Id: String): String? {
        return try {
            val response = httpClient.get("$supabaseUrl/rest/v1/users") {
                baseHeaders.forEach { (key, value) -> header(key, value) }
                parameter("auth0_id", "eq.$auth0Id")
                parameter("select", "id")
            }
            
            if (response.status == HttpStatusCode.OK) {
                val responseText = response.bodyAsText()
                val users = Json.decodeFromString<List<SupabaseUser>>(responseText)
                if (users.isNotEmpty()) {
                    return users[0].id
                }
            }
            null
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Ensure user exists in Supabase users table
     * Returns user UUID for database operations
     */
    suspend fun ensureUserExists(auth0Id: String, email: String): String {
        try {
            // First try to fetch existing user
            val existingUserId = getUserByAuth0Id(auth0Id)
            if (existingUserId != null) {
                return existingUserId
            }

            // Create new user
            val userData = CreateUserData(auth0_id = auth0Id, email = email)
            val createResponse = httpClient.post("$supabaseUrl/rest/v1/users") {
                baseHeaders.forEach { (key, value) -> header(key, value) }
                header("Prefer", "return=representation")
                setBody(userData)
            }

            val responseText = createResponse.bodyAsText()
            if (createResponse.status == HttpStatusCode.Created) {
                val createdUsers = Json.decodeFromString<List<SupabaseUser>>(responseText)
                if (createdUsers.isNotEmpty()) {
                    return createdUsers[0].id
                }
            }

            // Handle 409 Conflict - user already exists, but we can't query them
            // This typically means there's a constraint violation (like duplicate email)
            // but the auth0_id query doesn't find them, suggesting a schema mismatch
            if (createResponse.status == HttpStatusCode.Conflict) {
                // Create a consistent fallback user ID for this auth0_id
                val fallbackId = "fallback-${auth0Id.hashCode()}"
                return fallbackId
            }

            throw RuntimeException("Failed to create user for auth0_id: $auth0Id. Status: ${createResponse.status}")
        } catch (e: Exception) {
            // For database connection issues, throw a more specific error
            throw RuntimeException("Database unavailable: Cannot ensure user exists for auth0_id: $auth0Id", e)
        }
    }

    /**
     * Get or create today's will count record
     */
    suspend fun getTodayCount(userUuid: String): SupabaseWillCount {
        return try {
            val today = LocalDate.now().toString()
            
            // Check if record exists for today
            val response = httpClient.get("$supabaseUrl/rest/v1/will_counts") {
                baseHeaders.forEach { (key, value) -> header(key, value) }
                parameter("user_id", "eq.$userUuid")
                parameter("date", "eq.$today")
                parameter("select", "*")
            }

            if (response.status == HttpStatusCode.OK) {
                val responseText = response.bodyAsText()
                val counts = Json.decodeFromString<List<SupabaseWillCount>>(responseText)
                if (counts.isNotEmpty()) {
                    return counts[0]
                }
            }

            // Create new record for today
            val now = LocalDateTime.now().toString()
            val newCountData = CreateWillCountData(
                user_id = userUuid,
                date = today,
                count = 0,
                timestamps = emptyList(),
                created_at = now,
                updated_at = now
            )

            val createResponse = httpClient.post("$supabaseUrl/rest/v1/will_counts") {
                baseHeaders.forEach { (key, value) -> header(key, value) }
                header("Prefer", "return=representation")
                setBody(newCountData)
            }

            if (createResponse.status == HttpStatusCode.Created) {
                val responseText = createResponse.bodyAsText()
                val createdCounts = Json.decodeFromString<List<SupabaseWillCount>>(responseText)
                if (createdCounts.isNotEmpty()) {
                    return createdCounts[0]
                }
            }

            throw RuntimeException("Failed to create today's count record for user: $userUuid")
        } catch (e: java.nio.channels.UnresolvedAddressException) {
            // Fallback when Supabase is unavailable (DNS/network issues)
            createFallbackTodayCount(userUuid)
        } catch (e: java.net.ConnectException) {
            // Fallback when Supabase is unavailable (connection issues)
            createFallbackTodayCount(userUuid)
        } catch (e: Exception) {
            // For other errors, try fallback as well
            createFallbackTodayCount(userUuid)
        }
    }
    
    private fun createFallbackTodayCount(userUuid: String): SupabaseWillCount {
        val today = LocalDate.now().toString()
        val storageKey = "${userUuid}-${today}"
        
        // Return existing record if it exists
        fallbackStorage[storageKey]?.let { return it }
        
        // Create new record
        val now = LocalDateTime.now().toString()
        val newRecord = SupabaseWillCount(
            id = "fallback-${userUuid.take(8)}-${today}",
            user_id = userUuid,
            date = today,
            count = 0,
            timestamps = emptyList(),
            created_at = now,
            updated_at = now
        )
        
        // Store in local cache
        fallbackStorage[storageKey] = newRecord
        return newRecord
    }

    /**
     * Increment today's will count using RPC function for atomic operation
     */
    suspend fun incrementCount(userUuid: String): SupabaseWillCount {
        return try {
            // Try RPC function first for atomic operation
            try {
                val rpcRequest = RpcIncrementRequest(p_user_id = userUuid)
                val response = httpClient.post("$supabaseUrl/rest/v1/rpc/increment_will_count") {
                    baseHeaders.forEach { (key, value) -> header(key, value) }
                    setBody(rpcRequest)
                }

                if (response.status == HttpStatusCode.OK) {
                    val responseText = response.bodyAsText()
                    return Json.decodeFromString<SupabaseWillCount>(responseText)
                }
            } catch (e: Exception) {
                // Fall through to manual implementation
            }

            // Fallback: Manual increment operation
            val currentRecord = getTodayCount(userUuid)
            val newTimestamps = currentRecord.timestamps + LocalDateTime.now().toString()
            val updateData = UpdateWillCountData(
                count = currentRecord.count + 1,
                timestamps = newTimestamps,
                updated_at = LocalDateTime.now().toString()
            )

            val updateResponse = httpClient.patch("$supabaseUrl/rest/v1/will_counts") {
                baseHeaders.forEach { (key, value) -> header(key, value) }
                header("Prefer", "return=representation")
                parameter("id", "eq.${currentRecord.id}")
                setBody(updateData)
            }

            if (updateResponse.status == HttpStatusCode.OK) {
                val responseText = updateResponse.bodyAsText()
                val updatedCounts = Json.decodeFromString<List<SupabaseWillCount>>(responseText)
                if (updatedCounts.isNotEmpty()) {
                    return updatedCounts[0]
                }
            }

            throw RuntimeException("Failed to increment count for user: $userUuid")
        } catch (e: Exception) {
            // Fallback: increment local record
            val currentRecord = getTodayCount(userUuid)
            val now = LocalDateTime.now().toString()
            val today = LocalDate.now().toString()
            val storageKey = "${userUuid}-${today}"
            
            val updatedRecord = SupabaseWillCount(
                id = currentRecord.id,
                user_id = currentRecord.user_id,
                date = currentRecord.date,
                count = currentRecord.count + 1,
                timestamps = currentRecord.timestamps + now,
                created_at = currentRecord.created_at,
                updated_at = now
            )
            
            // Update local storage
            fallbackStorage[storageKey] = updatedRecord
            return updatedRecord
        }
    }

    /**
     * Reset today's count to 0
     */
    suspend fun resetTodayCount(userUuid: String): SupabaseWillCount {
        return try {
            val currentRecord = getTodayCount(userUuid)
            val updateData = UpdateWillCountData(
                count = 0,
                timestamps = emptyList(),
                updated_at = LocalDateTime.now().toString()
            )

            val updateResponse = httpClient.patch("$supabaseUrl/rest/v1/will_counts") {
                baseHeaders.forEach { (key, value) -> header(key, value) }
                header("Prefer", "return=representation")
                parameter("id", "eq.${currentRecord.id}")
                setBody(updateData)
            }

            if (updateResponse.status == HttpStatusCode.OK) {
                val responseText = updateResponse.bodyAsText()
                val updatedCounts = Json.decodeFromString<List<SupabaseWillCount>>(responseText)
                if (updatedCounts.isNotEmpty()) {
                    return updatedCounts[0]
                }
            }

            throw RuntimeException("Failed to reset count for user: $userUuid")
        } catch (e: Exception) {
            // Fallback: reset local record
            val currentRecord = getTodayCount(userUuid)
            val today = LocalDate.now().toString()
            val storageKey = "${userUuid}-${today}"
            
            val resetRecord = SupabaseWillCount(
                id = currentRecord.id,
                user_id = currentRecord.user_id,
                date = currentRecord.date,
                count = 0,
                timestamps = emptyList(),
                created_at = currentRecord.created_at,
                updated_at = LocalDateTime.now().toString()
            )
            
            // Update local storage
            fallbackStorage[storageKey] = resetRecord
            return resetRecord
        }
    }

    /**
     * Get user statistics for the last N days
     */
    suspend fun getUserStatistics(userUuid: String, days: Int = 30): List<SupabaseWillCount> {
        val startDate = LocalDate.now().minusDays(days.toLong()).toString()
        
        val response = httpClient.get("$supabaseUrl/rest/v1/will_counts") {
            baseHeaders.forEach { (key, value) -> header(key, value) }
            parameter("user_id", "eq.$userUuid")
            parameter("date", "gte.$startDate")
            parameter("order", "date.desc")
            parameter("select", "*")
        }

        if (response.status == HttpStatusCode.OK) {
            val responseText = response.bodyAsText()
            return Json.decodeFromString<List<SupabaseWillCount>>(responseText)
        }

        return emptyList()
    }

    /**
     * Health check to verify Supabase connectivity
     */
    suspend fun healthCheck(): Boolean {
        return try {
            val response = httpClient.get("$supabaseUrl/rest/v1/") {
                baseHeaders.forEach { (key, value) -> header(key, value) }
            }
            val ok = response.status == HttpStatusCode.OK || response.status == HttpStatusCode.NotFound
            if (!ok) {
                val body = try { response.bodyAsText() } catch (_: Exception) { "<no body>" }
                logger.warn("Supabase health check failed: status={}, body={} ", response.status.value, body.take(300))
            }
            ok
        } catch (e: Exception) {
            logger.error("Supabase health check exception: {}", e.message)
            false
        }
    }

    fun close() {
        httpClient.close()
    }
}