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
    private val supabaseUrl = System.getProperty("SUPABASE_URL") ?: System.getenv("SUPABASE_URL")
        ?: throw IllegalStateException("SUPABASE_URL environment variable is required")
    
    private val serviceRoleKey = System.getProperty("SUPABASE_SERVICE_ROLE_KEY") ?: System.getenv("SUPABASE_SERVICE_ROLE_KEY")
        ?: throw IllegalStateException("SUPABASE_SERVICE_ROLE_KEY environment variable is required")

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
     * Ensure user exists in Supabase users table
     * Returns user UUID for database operations
     */
    suspend fun ensureUserExists(auth0Id: String, email: String): String {
        // First check if user exists
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

        // Create new user
        val userData = CreateUserData(auth0_id = auth0Id, email = email)
        val createResponse = httpClient.post("$supabaseUrl/rest/v1/users") {
            baseHeaders.forEach { (key, value) -> header(key, value) }
            header("Prefer", "return=representation")
            setBody(userData)
        }

        if (createResponse.status == HttpStatusCode.Created) {
            val responseText = createResponse.bodyAsText()
            val createdUsers = Json.decodeFromString<List<SupabaseUser>>(responseText)
            if (createdUsers.isNotEmpty()) {
                return createdUsers[0].id
            }
        }

        throw RuntimeException("Failed to create or find user for auth0_id: $auth0Id")
    }

    /**
     * Get or create today's will count record
     */
    suspend fun getTodayCount(userUuid: String): SupabaseWillCount {
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
    }

    /**
     * Increment today's will count using RPC function for atomic operation
     */
    suspend fun incrementCount(userUuid: String): SupabaseWillCount {
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
    }

    /**
     * Reset today's count to 0
     */
    suspend fun resetTodayCount(userUuid: String): SupabaseWillCount {
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
            response.status == HttpStatusCode.OK || response.status == HttpStatusCode.NotFound
        } catch (e: Exception) {
            false
        }
    }

    fun close() {
        httpClient.close()
    }
}