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
        
        // Handle mock environment gracefully
        if (supabaseUrl.startsWith("https://mock.") || serviceRoleKey.startsWith("mock-")) {
            println("🧪 Mock environment detected - Supabase service initialized in test mode")
        } else {
            // Security: Never log the service role key, validate it starts correctly  
            if (!serviceRoleKey.startsWith("eyJ")) {
                println("⚠️ Warning: Service role key may not be valid JWT format")
            }
            println("✅ Supabase service initialized with URL: ${maskUrl(supabaseUrl)}")
        }
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
     * Secure request wrapper that ensures sensitive data is never logged
     */
    private suspend inline fun <reified T> makeSecureRequest(
        url: String,
        method: HttpMethod = HttpMethod.Get,
        body: Any? = null,
        additionalParams: Map<String, String> = emptyMap()
    ): T? {
        return try {
            val response = httpClient.request(url) {
                this.method = method
                headers {
                    append("apikey", serviceRoleKey)
                    append("Authorization", "Bearer $serviceRoleKey")
                    append("Content-Type", "application/json")
                    if (method in listOf(HttpMethod.Post, HttpMethod.Patch)) {
                        append("Prefer", "return=representation")
                    }
                }
                
                additionalParams.forEach { (key, value) ->
                    parameter(key, value)
                }
                
                if (body != null) {
                    setBody(body)
                }
            }
            
            if (response.status.isSuccess()) {
                response.body<T>()
            } else {
                // Log error without exposing request details
                println("⚠️ Supabase request failed: ${response.status} for ${maskUrl(url)}")
                null
            }
        } catch (e: Exception) {
            println("❌ Supabase request error: ${e.message?.take(100)} for ${maskUrl(url)}")
            null
        }
    }
    
    /**
     * Get user by Auth0 ID - uses service role for reliable lookup
     */
    suspend fun getUserByAuth0Id(auth0Id: String): SupabaseUser? {
        val users: List<SupabaseUser>? = makeSecureRequest<List<SupabaseUser>>(
            "$supabaseUrl/rest/v1/users",
            additionalParams = mapOf(
                "auth0_id" to "eq.$auth0Id",
                "select" to "*"
            )
        )
        return users?.firstOrNull()
    }
    
    /**
     * Create a new user - uses service role for creation
     */
    suspend fun createUser(auth0Id: String, email: String): SupabaseUser? {
        val requestBody = SupabaseCreateUserRequest(
            auth0_id = auth0Id,
            email = email
        )
        
        val users: List<SupabaseUser>? = makeSecureRequest<List<SupabaseUser>>(
            "$supabaseUrl/rest/v1/users",
            HttpMethod.Post,
            requestBody
        )
        return users?.firstOrNull()
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
        return makeSecureRequest<SupabaseWillCount>(
            "$supabaseUrl/rest/v1/rpc/get_or_create_today_count",
            HttpMethod.Post,
            mapOf("p_user_id" to userId)
        )
    }
    
    /**
     * Increment will count using RPC function
     */
    suspend fun incrementWillCount(userId: String): SupabaseWillCount? {
        return makeSecureRequest<SupabaseWillCount>(
            "$supabaseUrl/rest/v1/rpc/increment_will_count",
            HttpMethod.Post,
            mapOf("p_user_id" to userId)
        )
    }
    
    /**
     * Reset today's will count to zero
     */
    suspend fun resetTodayCount(userId: String): SupabaseWillCount? {
        val today = java.time.LocalDate.now().toString()
        
        val results: List<SupabaseWillCount>? = makeSecureRequest<List<SupabaseWillCount>>(
            "$supabaseUrl/rest/v1/will_counts",
            HttpMethod.Patch,
            mapOf(
                "count" to 0,
                "timestamps" to emptyList<String>(),
                "updated_at" to java.time.LocalDateTime.now().toString()
            ),
            mapOf(
                "user_id" to "eq.$userId",
                "date" to "eq.$today"
            )
        )
        
        return results?.firstOrNull() ?: getTodayCount(userId)
    }
    
    /**
     * Get user statistics using RPC function
     */
    suspend fun getUserStatistics(userId: String, days: Int = 30): List<Map<String, Any>>? {
        return makeSecureRequest<List<Map<String, Any>>>(
            "$supabaseUrl/rest/v1/rpc/get_user_statistics",
            HttpMethod.Post,
            mapOf(
                "p_user_id" to userId,
                "p_days" to days
            )
        )
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