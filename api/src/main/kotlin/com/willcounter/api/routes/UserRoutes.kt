package com.willcounter.api.routes

import com.willcounter.api.dto.*
import com.willcounter.api.services.DatabaseService
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*

fun Route.userRoutes(databaseService: DatabaseService) {
    route("/api/users") {
        
        post {
            try {
                val request = call.receive<CreateUserRequest>()
                
                // Check if user already exists
                val existingUser = databaseService.getUserByAuth0Id(request.auth0Id)
                if (existingUser != null) {
                    call.respond(HttpStatusCode.Conflict, ApiResponse<UserResponse>(
                        success = false,
                        error = "User already exists"
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