package com.willcounter.api.routes

import com.willcounter.api.dto.*
import com.willcounter.api.services.DatabaseService
import com.willcounter.api.config.Auth0Principal
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*

fun Route.willCountRoutes(databaseService: DatabaseService) {
    route("/api/will-counts") {
        
        authenticate("auth0") {
            get("/today") {
                try {
                    val principal = call.principal<Auth0Principal>()
                    val auth0Id = principal?.userId ?: run {
                        call.respond(HttpStatusCode.Unauthorized, ApiResponse<Any>(
                            success = false,
                            error = "Authentication required"
                        ))
                        return@get
                    }
                    
                    // Get user by auth0_id first
                    val user = databaseService.getUserByAuth0Id(auth0Id)
                    if (user == null) {
                        call.respond(HttpStatusCode.NotFound, ApiResponse<Any>(
                            success = false,
                            error = "User not found"
                        ))
                        return@get
                    }
                    
                    val willCount = databaseService.getTodayCount(user.id)
                    if (willCount != null) {
                        call.respond(HttpStatusCode.OK, ApiResponse(
                            success = true,
                            data = willCount
                        ))
                    } else {
                        call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                            success = false,
                            error = "Failed to get today's count"
                        ))
                    }
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                        success = false,
                        error = "Failed to get today's count: ${e.message}"
                    ))
                }
            }
            
            post("/increment") {
                try {
                    val principal = call.principal<Auth0Principal>()
                    val auth0Id = principal?.userId ?: run {
                        call.respond(HttpStatusCode.Unauthorized, ApiResponse<Any>(
                            success = false,
                            error = "Authentication required"
                        ))
                        return@post
                    }
                    
                    // Get user by auth0_id first
                    val user = databaseService.getUserByAuth0Id(auth0Id)
                    if (user == null) {
                        call.respond(HttpStatusCode.NotFound, ApiResponse<Any>(
                            success = false,
                            error = "User not found"
                        ))
                        return@post
                    }
                    
                    val willCount = databaseService.incrementCount(user.id)
                    if (willCount != null) {
                        call.respond(HttpStatusCode.OK, ApiResponse(
                            success = true,
                            data = willCount,
                            message = "Count incremented successfully"
                        ))
                    } else {
                        call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                            success = false,
                            error = "Failed to increment count"
                        ))
                    }
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                        success = false,
                        error = "Failed to increment count: ${e.message}"
                    ))
                }
            }
        }
        
        get("/{userId}/statistics") {
            try {
                val userId = call.parameters["userId"] ?: run {
                    call.respond(HttpStatusCode.BadRequest, ApiResponse<Any>(
                        success = false,
                        error = "User ID is required"
                    ))
                    return@get
                }
                
                val days = call.request.queryParameters["days"]?.toIntOrNull() ?: 30
                
                val statistics = databaseService.getUserStatistics(userId, days)
                if (statistics != null) {
                    call.respond(HttpStatusCode.OK, ApiResponse(
                        success = true,
                        data = statistics
                    ))
                } else {
                    call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                        success = false,
                        error = "Failed to get statistics"
                    ))
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                    success = false,
                    error = "Failed to get statistics: ${e.message}"
                ))
            }
        }
    }
}