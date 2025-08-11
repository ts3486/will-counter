package com.willcounter.api.services

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.jsonObject
import java.util.*

@Serializable
data class SupabaseUser(
    val id: String,
    val auth0_id: String,
    val email: String,
    val created_at: String,
    val last_login: String? = null,
    val preferences: JsonElement
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
data class SupabaseCreateUserRequest(
    val auth0_id: String,
    val email: String
)

@Serializable
data class RPCIncrementRequest(
    val p_user_id: String
)

/**
 * Secure Supabase REST client for server-side operations
 * Uses service role key for bypassing RLS when necessary
 * SECURITY: This service should NEVER expose the service role key to clients
 */
class SupabaseService {
    private val supabaseUrl = System.getenv("SUPABASE_URL") ?: ""
    private val serviceRoleKey = System.getenv("SUPABASE_SERVICE_ROLE_KEY") ?: ""
    
    init {
        if (supabaseUrl.isEmpty()) {
            throw IllegalStateException("SUPABASE_URL environment variable is required")
        }
        if (serviceRoleKey.isEmpty()) {
            throw IllegalStateException("SUPABASE_SERVICE_ROLE_KEY environment variable is required")
        }
        
        // Security: Never log the service role key
        println("✅ Supabase service initialized with URL: ${maskUrl(supabaseUrl)}")
    }
    
    private val httpClient = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }
    
    /**
     * Get user by Auth0 ID - uses service role for reliable lookup
     */
    suspend fun getUserByAuth0Id(auth0Id: String): SupabaseUser? {
        return try {
            val response = httpClient.get("$supabaseUrl/rest/v1/users") {
                headers {
                    append("apikey", serviceRoleKey)
                    append("Authorization", "Bearer $serviceRoleKey")
                    append("Content-Type", "application/json")
                }
                parameter("auth0_id", "eq.$auth0Id")
                parameter("select", "*")
            }
            
            if (response.status.isSuccess()) {
                val users: List<SupabaseUser> = response.body()
                users.firstOrNull()
            } else {
                println("⚠️ Failed to get user by auth0_id: ${response.status}")
                null
            }
        } catch (e: Exception) {
            println("❌ Error getting user by auth0_id: ${e.message}")
            null
        }
    }
    
    /**
     * Create a new user - uses service role for creation
     */
    suspend fun createUser(auth0Id: String, email: String): SupabaseUser? {
        return try {
            val requestBody = SupabaseCreateUserRequest(
                auth0_id = auth0Id,
                email = email
            )
            
            val response = httpClient.post("$supabaseUrl/rest/v1/users") {
                headers {
                    append("apikey", serviceRoleKey)
                    append("Authorization", "Bearer $serviceRoleKey")
                    append("Content-Type", "application/json")
                    append("Prefer", "return=representation")
                }
                setBody(requestBody)
            }
            
            if (response.status.isSuccess()) {
                val users: List<SupabaseUser> = response.body()
                users.firstOrNull()
            } else {
                println("⚠️ Failed to create user: ${response.status}")
                null
            }
        } catch (e: Exception) {
            println("❌ Error creating user: ${e.message}")
            null
        }
    }
    
    /**
     * Get or create user - ensures user exists, creates if not
     * This is the main method to call for user management
     */
    suspend fun ensureUserExists(auth0Id: String, email: String): SupabaseUser? {
        // First try to get existing user
        val existingUser = getUserByAuth0Id(auth0Id)
        if (existingUser != null) {
            return existingUser
        }
        
        // Create new user if doesn't exist
        return createUser(auth0Id, email)
    }
    
    /**
     * Get today's will count using RPC function
     */
    suspend fun getTodayCount(userId: String): SupabaseWillCount? {
        return try {
            val response = httpClient.post("$supabaseUrl/rest/v1/rpc/get_or_create_today_count") {
                headers {
                    append("apikey", serviceRoleKey)
                    append("Authorization", "Bearer $serviceRoleKey")
                    append("Content-Type", "application/json")
                }
                setBody(mapOf("p_user_id" to userId))
            }
            
            if (response.status.isSuccess()) {
                response.body<SupabaseWillCount>()
            } else {
                println("⚠️ Failed to get today count: ${response.status}")
                null
            }
        } catch (e: Exception) {
            println("❌ Error getting today count: ${e.message}")
            null
        }
    }
    
    /**
     * Increment will count using RPC function
     */
    suspend fun incrementWillCount(userId: String): SupabaseWillCount? {
        return try {
            val response = httpClient.post("$supabaseUrl/rest/v1/rpc/increment_will_count") {
                headers {
                    append("apikey", serviceRoleKey)
                    append("Authorization", "Bearer $serviceRoleKey")
                    append("Content-Type", "application/json")
                }
                setBody(mapOf("p_user_id" to userId))
            }
            
            if (response.status.isSuccess()) {
                response.body<SupabaseWillCount>()
            } else {
                println("⚠️ Failed to increment count: ${response.status}")
                null
            }
        } catch (e: Exception) {
            println("❌ Error incrementing count: ${e.message}")
            null
        }
    }
    
    /**
     * Reset today's will count to zero
     */
    suspend fun resetTodayCount(userId: String): SupabaseWillCount? {
        return try {
            // First get today's record
            val today = java.time.LocalDate.now().toString()
            
            val response = httpClient.patch("$supabaseUrl/rest/v1/will_counts") {
                headers {
                    append("apikey", serviceRoleKey)
                    append("Authorization", "Bearer $serviceRoleKey")
                    append("Content-Type", "application/json")
                    append("Prefer", "return=representation")
                }
                parameter("user_id", "eq.$userId")
                parameter("date", "eq.$today")
                setBody(mapOf(
                    "count" to 0,
                    "timestamps" to emptyList<String>(),
                    "updated_at" to java.time.LocalDateTime.now().toString()
                ))
            }
            
            if (response.status.isSuccess()) {
                val results: List<SupabaseWillCount> = response.body()
                results.firstOrNull() ?: getTodayCount(userId) // Fallback to get/create
            } else {
                println("⚠️ Failed to reset count: ${response.status}")
                null
            }
        } catch (e: Exception) {
            println("❌ Error resetting count: ${e.message}")
            null
        }
    }
    
    /**
     * Get user statistics using RPC function
     */
    suspend fun getUserStatistics(userId: String, days: Int = 30): List<Map<String, Any>>? {
        return try {
            val response = httpClient.post("$supabaseUrl/rest/v1/rpc/get_user_statistics") {
                headers {
                    append("apikey", serviceRoleKey)
                    append("Authorization", "Bearer $serviceRoleKey")
                    append("Content-Type", "application/json")
                }
                setBody(mapOf(
                    "p_user_id" to userId,
                    "p_days" to days
                ))
            }
            
            if (response.status.isSuccess()) {
                response.body<List<Map<String, Any>>>()
            } else {
                println("⚠️ Failed to get statistics: ${response.status}")
                null
            }
        } catch (e: Exception) {
            println("❌ Error getting statistics: ${e.message}")
            null
        }
    }
    
    /**
     * Clean up resources
     */
    fun close() {
        httpClient.close()
    }
    
    /**
     * Mask URL for secure logging
     */
    private fun maskUrl(url: String): String {
        return if (url.contains("supabase")) {
            val parts = url.split(".")
            if (parts.size >= 3) {
                "${parts[0].take(8)}***.${parts[1]}.${parts[2]}"
            } else {
                url.take(10) + "***"
            }
        } else {
            url
        }
    }
}