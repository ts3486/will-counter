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

fun Route.userRoutes(databaseService: DatabaseService) {
    route("/api/users") {
        
        authenticate("auth0") {
            post {
                try {
                    // Check rate limit for auth endpoints
                    if (RateLimiter.isRateLimited(call, "auth")) {
                        ErrorHandler.handleRateLimitExceeded(call)
                        return@post
                    }
                    
                    // Get authenticated user info
                    val principal = call.principal<Auth0Principal>()
                    val auth0Id = principal?.userId ?: run {
                        ErrorHandler.handleAuthenticationError(call)
                        return@post
                    }

                    val request = call.receive<CreateUserRequest>()
                    
                    val validatedAuth0Id = try {
                        InputValidator.validateAuth0Id(request.auth0Id)
                    } catch (e: InputValidator.ValidationException) {
                        ErrorHandler.handleValidationError(call, e.message ?: "Validation failed")
                        return@post
                    }
                    
                    val validatedEmail = try {
                        InputValidator.validateEmail(request.email)
                    } catch (e: InputValidator.ValidationException) {
                        ErrorHandler.handleValidationError(call, e.message ?: "Validation failed")
                        return@post
                    }
                    
                    // Verify the auth0_id matches the authenticated user
                    if (validatedAuth0Id != auth0Id) {
                        ErrorHandler.handleAuthorizationError(call)
                        return@post
                    }
                    
                    // Check if user already exists
                    val existingUser = databaseService.getUserByAuth0Id(validatedAuth0Id)
                    if (existingUser != null) {
                        call.respond(HttpStatusCode.OK, ApiResponse(
                            success = true,
                            data = existingUser,
                            message = "User already exists"
                        ))
                        return@post
                    }
                    
                    val user = databaseService.createUser(CreateUserRequest(validatedAuth0Id, validatedEmail))
                    call.respond(HttpStatusCode.Created, ApiResponse(
                        success = true,
                        data = user,
                        message = "User created successfully"
                    ))
                } catch (e: Exception) {
                    ErrorHandler.handleInternalError(call, e)
                }
            }
            
            get("/me") {
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
                    
                    val user = databaseService.getUserByAuth0Id(validatedAuth0Id)
                    if (user != null) {
                        call.respond(HttpStatusCode.OK, ApiResponse(
                            success = true,
                            data = user
                        ))
                    } else {
                        ErrorHandler.handleUserNotFound(call)
                    }
                } catch (e: Exception) {
                    ErrorHandler.handleInternalError(call, e)
                }
            }
        }
        
        get("/{auth0Id}") {
            try {
                // Check rate limit
                if (RateLimiter.isRateLimited(call, "api")) {
                    ErrorHandler.handleRateLimitExceeded(call)
                    return@get
                }
                
                val auth0Id = call.parameters["auth0Id"]
                val validatedAuth0Id = try {
                    InputValidator.validateAuth0Id(auth0Id)
                } catch (e: InputValidator.ValidationException) {
                    ErrorHandler.handleValidationError(call, e.message ?: "Validation failed")
                    return@get
                }
                
                val user = databaseService.getUserByAuth0Id(validatedAuth0Id)
                if (user != null) {
                    call.respond(HttpStatusCode.OK, ApiResponse(
                        success = true,
                        data = user
                    ))
                } else {
                    ErrorHandler.handleUserNotFound(call)
                }
            } catch (e: Exception) {
                ErrorHandler.handleInternalError(call, e)
            }
        }
        
        post("/{userId}/login") {
            try {
                // Check rate limit
                if (RateLimiter.isRateLimited(call, "api")) {
                    ErrorHandler.handleRateLimitExceeded(call)
                    return@post
                }
                
                val userId = call.parameters["userId"]
                val validatedUserId = try {
                    InputValidator.validateUserId(userId)
                } catch (e: InputValidator.ValidationException) {
                    ErrorHandler.handleValidationError(call, e.message ?: "Validation failed")
                    return@post
                }
                
                val success = databaseService.updateLastLogin(validatedUserId)
                if (success) {
                    call.respond(HttpStatusCode.OK, ApiResponse<Nothing>(
                        success = true,
                        message = "Last login updated"
                    ))
                } else {
                    ErrorHandler.handleUserNotFound(call)
                }
            } catch (e: Exception) {
                ErrorHandler.handleInternalError(call, e)
            }
        }
    }
}