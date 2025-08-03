package com.willcounter.api.routes

import com.willcounter.api.dto.*
import com.willcounter.api.services.DatabaseService
import com.willcounter.api.config.Auth0Principal
import com.willcounter.api.validation.InputValidator
import com.willcounter.api.security.ErrorHandler
import com.willcounter.api.security.RateLimiter
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
                    // Check rate limit
                    if (RateLimiter.isRateLimited(call, "api")) {
                        ErrorHandler.handleRateLimitExceeded(call)
                        return@get
                    }
                    
                    val principal = call.principal<Auth0Principal>()
                    val auth0Id = principal?.userId ?: run {
                        ErrorHandler.handleAuthenticationError(call)
                        return@get
                    }
                    
                    val validatedAuth0Id = try {
                        InputValidator.validateAuth0Id(auth0Id)
                    } catch (e: InputValidator.ValidationException) {
                        ErrorHandler.handleValidationError(call, e.message ?: "Validation failed")
                        return@get
                    }
                    
                    // Get user by auth0_id first
                    val user = databaseService.getUserByAuth0Id(validatedAuth0Id)
                    if (user == null) {
                        ErrorHandler.handleUserNotFound(call)
                        return@get
                    }
                    
                    val willCount = databaseService.getTodayCount(user.id)
                    if (willCount != null) {
                        call.respond(HttpStatusCode.OK, ApiResponse(
                            success = true,
                            data = willCount
                        ))
                    } else {
                        ErrorHandler.handleDatabaseError(call, Exception("Failed to retrieve today's count"))
                    }
                } catch (e: Exception) {
                    ErrorHandler.handleInternalError(call, e)
                }
            }
            
            post("/increment") {
                try {
                    // Check rate limit for increment endpoint
                    if (RateLimiter.isRateLimited(call, "increment")) {
                        ErrorHandler.handleRateLimitExceeded(call)
                        return@post
                    }
                    
                    val principal = call.principal<Auth0Principal>()
                    val auth0Id = principal?.userId ?: run {
                        ErrorHandler.handleAuthenticationError(call)
                        return@post
                    }
                    
                    val validatedAuth0Id = try {
                        InputValidator.validateAuth0Id(auth0Id)
                    } catch (e: InputValidator.ValidationException) {
                        ErrorHandler.handleValidationError(call, e.message ?: "Validation failed")
                        return@post
                    }
                    
                    // Get user by auth0_id first
                    val user = databaseService.getUserByAuth0Id(validatedAuth0Id)
                    if (user == null) {
                        ErrorHandler.handleUserNotFound(call)
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
                        ErrorHandler.handleDatabaseError(call, Exception("Failed to increment count"))
                    }
                } catch (e: Exception) {
                    ErrorHandler.handleInternalError(call, e)
                }
            }
        }
        
        get("/{userId}/statistics") {
            try {
                // Check rate limit
                if (RateLimiter.isRateLimited(call, "api")) {
                    ErrorHandler.handleRateLimitExceeded(call)
                    return@get
                }
                
                val userId = call.parameters["userId"]
                val validatedUserId = try {
                    InputValidator.validateUserId(userId)
                } catch (e: InputValidator.ValidationException) {
                    ErrorHandler.handleValidationError(call, e.message ?: "Validation failed")
                    return@get
                }
                
                val daysParam = call.request.queryParameters["days"]
                val validatedDays = try {
                    InputValidator.validateDays(daysParam)
                } catch (e: InputValidator.ValidationException) {
                    ErrorHandler.handleValidationError(call, e.message ?: "Validation failed")
                    return@get
                }
                
                val statistics = databaseService.getUserStatistics(validatedUserId, validatedDays)
                if (statistics != null) {
                    call.respond(HttpStatusCode.OK, ApiResponse(
                        success = true,
                        data = statistics
                    ))
                } else {
                    ErrorHandler.handleDatabaseError(call, Exception("Failed to retrieve statistics"))
                }
            } catch (e: Exception) {
                ErrorHandler.handleInternalError(call, e)
            }
        }
    }
}