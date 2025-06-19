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

fun Route.userRoutes(databaseService: DatabaseService) {
    route("/api/users") {
        
        authenticate("auth0") {
            post {
                try {
                    // Get authenticated user info
                    val principal = call.principal<Auth0Principal>()
                    val auth0Id = principal?.userId ?: run {
                        call.respond(HttpStatusCode.Unauthorized, ApiResponse<Any>(
                            success = false,
                            error = "Authentication required"
                        ))
                        return@post
                    }

                    val request = call.receive<CreateUserRequest>()
                    
                    // Verify the auth0_id matches the authenticated user
                    if (request.auth0Id != auth0Id) {
                        call.respond(HttpStatusCode.Forbidden, ApiResponse<Any>(
                            success = false,
                            error = "Cannot create user for different auth0_id"
                        ))
                        return@post
                    }
                    
                    // Check if user already exists
                    val existingUser = databaseService.getUserByAuth0Id(request.auth0Id)
                    if (existingUser != null) {
                        call.respond(HttpStatusCode.OK, ApiResponse(
                            success = true,
                            data = existingUser,
                            message = "User already exists"
                        ))
                        return@post
                    }
                    
                    val user = databaseService.createUser(request)
                    call.respond(HttpStatusCode.Created, ApiResponse(
                        success = true,
                        data = user,
                        message = "User created successfully"
                    ))
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                        success = false,
                        error = "Failed to create user: ${e.message}"
                    ))
                }
            }
            
            get("/me") {
                try {
                    val principal = call.principal<Auth0Principal>()
                    val auth0Id = principal?.userId ?: run {
                        call.respond(HttpStatusCode.Unauthorized, ApiResponse<Any>(
                            success = false,
                            error = "Authentication required"
                        ))
                        return@get
                    }
                    
                    val user = databaseService.getUserByAuth0Id(auth0Id)
                    if (user != null) {
                        call.respond(HttpStatusCode.OK, ApiResponse(
                            success = true,
                            data = user
                        ))
                    } else {
                        call.respond(HttpStatusCode.NotFound, ApiResponse<Any>(
                            success = false,
                            error = "User not found"
                        ))
                    }
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                        success = false,
                        error = "Failed to get user: ${e.message}"
                    ))
                }
            }
        }
        
        get("/{auth0Id}") {
            try {
                val auth0Id = call.parameters["auth0Id"] ?: run {
                    call.respond(HttpStatusCode.BadRequest, ApiResponse<Any>(
                        success = false,
                        error = "Auth0 ID is required"
                    ))
                    return@get
                }
                
                val user = databaseService.getUserByAuth0Id(auth0Id)
                if (user != null) {
                    call.respond(HttpStatusCode.OK, ApiResponse(
                        success = true,
                        data = user
                    ))
                } else {
                    call.respond(HttpStatusCode.NotFound, ApiResponse<Any>(
                        success = false,
                        error = "User not found"
                    ))
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                    success = false,
                    error = "Failed to get user: ${e.message}"
                ))
            }
        }
        
        post("/{userId}/login") {
            try {
                val userId = call.parameters["userId"] ?: run {
                    call.respond(HttpStatusCode.BadRequest, ApiResponse<Any>(
                        success = false,
                        error = "User ID is required"
                    ))
                    return@post
                }
                
                val success = databaseService.updateLastLogin(userId)
                if (success) {
                    call.respond(HttpStatusCode.OK, ApiResponse<Nothing>(
                        success = true,
                        message = "Last login updated"
                    ))
                } else {
                    call.respond(HttpStatusCode.NotFound, ApiResponse<Any>(
                        success = false,
                        error = "User not found"
                    ))
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, ApiResponse<Any>(
                    success = false,
                    error = "Failed to update login: ${e.message}"
                ))
            }
        }
    }
}