package com.willcounter.api.routes

import com.willcounter.api.dto.*
import com.willcounter.api.services.SupabaseClient
import com.willcounter.api.config.Auth0Principal
import com.willcounter.api.config.Auth0Config
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*

/**
 * Secure will count routes that use Supabase with service role key server-side only
 * All requests require valid Auth0 JWT authentication
 */
fun Route.secureWillCountRoutes(supabaseClient: SupabaseClient) {
    route("/api/will-counts") {
        
        authenticate("auth0") {
            
            /**
             * POST /api/users/ensure
             * Ensures user exists in database using JWT sub claim
             */
            post("/users/ensure") {
                try {
                    val principal = call.principal<Auth0Principal>()
                    val auth0Id = principal?.userId ?: run {
                        call.respond(HttpStatusCode.Unauthorized, mapOf(
                            "success" to false,
                            "error" to "Authentication required"
                        ))
                        return@post
                    }

                    // Extract email from JWT token if available
                    val token = call.request.headers["Authorization"]?.removePrefix("Bearer ")
                    val jwt = token?.let { Auth0Config.verifyToken(it) }
                    val email = jwt?.getClaim("email")?.asString() ?: "unknown@domain.com"

                    val userUuid = supabaseClient.ensureUserExists(auth0Id, email)
                    
                    call.respond(HttpStatusCode.OK, ApiResponse(
                        success = true,
                        data = mapOf("user_id" to userUuid),
                        message = "User ensured successfully"
                    ))
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, mapOf(
                        "success" to false,
                        "error" to "Failed to ensure user exists: ${e.message}"
                    ))
                }
            }
            
            /**
             * GET /api/will-counts/today
             * Get or create today's will count record
             */
            get("/today") {
                try {
                    val principal = call.principal<Auth0Principal>()
                    val auth0Id = principal?.userId ?: run {
                        call.respond(HttpStatusCode.Unauthorized, mapOf(
                            "success" to false,
                            "error" to "Authentication required"
                        ))
                        return@get
                    }

                    // Extract email from JWT for user creation if needed
                    val token = call.request.headers["Authorization"]?.removePrefix("Bearer ")
                    val jwt = token?.let { Auth0Config.verifyToken(it) }
                    val email = jwt?.getClaim("email")?.asString() ?: "unknown@domain.com"

                    // Ensure user exists and get UUID
                    val userUuid = supabaseClient.ensureUserExists(auth0Id, email)
                    
                    // Get today's count
                    val todayCount = supabaseClient.getTodayCount(userUuid)
                    
                    // Convert to frontend-expected format
                    val response = WillCountResponse(
                        id = todayCount.id,
                        userId = todayCount.user_id,
                        date = todayCount.date,
                        count = todayCount.count,
                        timestamps = todayCount.timestamps,
                        createdAt = todayCount.created_at,
                        updatedAt = todayCount.updated_at
                    )
                    
                    call.respond(HttpStatusCode.OK, response)
                } catch (e: Exception) {
                    call.respondText(
                        """{"success": false, "error": "Failed to get today's count: ${e.message}"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.InternalServerError
                    )
                }
            }
            
            /**
             * POST /api/will-counts/increment
             * Atomically increment today's will count
             */
            post("/increment") {
                try {
                    val principal = call.principal<Auth0Principal>()
                    val auth0Id = principal?.userId ?: run {
                        call.respond(HttpStatusCode.Unauthorized, mapOf(
                            "success" to false,
                            "error" to "Authentication required"
                        ))
                        return@post
                    }

                    // Extract email from JWT for user creation if needed
                    val token = call.request.headers["Authorization"]?.removePrefix("Bearer ")
                    val jwt = token?.let { Auth0Config.verifyToken(it) }
                    val email = jwt?.getClaim("email")?.asString() ?: "unknown@domain.com"

                    // Ensure user exists and get UUID
                    val userUuid = supabaseClient.ensureUserExists(auth0Id, email)
                    
                    // Increment count
                    val updatedCount = supabaseClient.incrementCount(userUuid)
                    
                    // Convert to frontend-expected format
                    val response = WillCountResponse(
                        id = updatedCount.id,
                        userId = updatedCount.user_id,
                        date = updatedCount.date,
                        count = updatedCount.count,
                        timestamps = updatedCount.timestamps,
                        createdAt = updatedCount.created_at,
                        updatedAt = updatedCount.updated_at
                    )
                    
                    call.respond(HttpStatusCode.OK, response)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, mapOf(
                        "success" to false,
                        "error" to "Failed to increment count: ${e.message}"
                    ))
                }
            }
            
            /**
             * POST /api/will-counts/reset
             * Reset today's count to 0
             */
            post("/reset") {
                try {
                    val principal = call.principal<Auth0Principal>()
                    val auth0Id = principal?.userId ?: run {
                        call.respond(HttpStatusCode.Unauthorized, mapOf(
                            "success" to false,
                            "error" to "Authentication required"
                        ))
                        return@post
                    }

                    // Extract email from JWT for user creation if needed
                    val token = call.request.headers["Authorization"]?.removePrefix("Bearer ")
                    val jwt = token?.let { Auth0Config.verifyToken(it) }
                    val email = jwt?.getClaim("email")?.asString() ?: "unknown@domain.com"

                    // Ensure user exists and get UUID
                    val userUuid = supabaseClient.ensureUserExists(auth0Id, email)
                    
                    // Reset count
                    val resetCount = supabaseClient.resetTodayCount(userUuid)
                    
                    // Convert to frontend-expected format
                    val response = WillCountResponse(
                        id = resetCount.id,
                        userId = resetCount.user_id,
                        date = resetCount.date,
                        count = resetCount.count,
                        timestamps = resetCount.timestamps,
                        createdAt = resetCount.created_at,
                        updatedAt = resetCount.updated_at
                    )
                    
                    call.respond(HttpStatusCode.OK, response)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, mapOf(
                        "success" to false,
                        "error" to "Failed to reset count: ${e.message}"
                    ))
                }
            }
            
            /**
             * GET /api/will-counts/statistics
             * Get user statistics for the last N days
             */
            get("/statistics") {
                try {
                    val principal = call.principal<Auth0Principal>()
                    val auth0Id = principal?.userId ?: run {
                        call.respond(HttpStatusCode.Unauthorized, mapOf(
                            "success" to false,
                            "error" to "Authentication required"
                        ))
                        return@get
                    }

                    val days = call.request.queryParameters["days"]?.toIntOrNull() ?: 30

                    // Extract email from JWT for user creation if needed
                    val token = call.request.headers["Authorization"]?.removePrefix("Bearer ")
                    val jwt = token?.let { Auth0Config.verifyToken(it) }
                    val email = jwt?.getClaim("email")?.asString() ?: "unknown@domain.com"

                    // Ensure user exists and get UUID
                    val userUuid = supabaseClient.ensureUserExists(auth0Id, email)
                    
                    // Get statistics
                    val counts = supabaseClient.getUserStatistics(userUuid, days)
                    
                    val totalCount = counts.sumOf { it.count }
                    val todayCount = counts.find { it.date == java.time.LocalDate.now().toString() }?.count ?: 0
                    val weeklyAverage = if (counts.isNotEmpty()) totalCount.toDouble() / minOf(days, 7) else 0.0
                    
                    val dailyCounts = counts.map { willCount ->
                        DailyStat(
                            date = willCount.date,
                            count = willCount.count,
                            sessions = willCount.timestamps.size
                        )
                    }
                    
                    val response = StatisticsResponse(
                        totalCount = totalCount,
                        todayCount = todayCount,
                        weeklyAverage = weeklyAverage,
                        dailyCounts = dailyCounts
                    )
                    
                    call.respond(HttpStatusCode.OK, ApiResponse(
                        success = true,
                        data = response
                    ))
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, mapOf(
                        "success" to false,
                        "error" to "Failed to get statistics: ${e.message}"
                    ))
                }
            }
        }
    }
}