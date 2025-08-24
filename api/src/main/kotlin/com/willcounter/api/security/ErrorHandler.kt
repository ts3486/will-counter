package com.willcounter.api.security

import com.willcounter.api.dto.ApiResponse
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import java.util.*

object ErrorHandler {
    
    enum class ErrorCode(val code: String, val message: String) {
        VALIDATION_ERROR("VALIDATION_001", "Invalid input provided"),
        AUTHENTICATION_ERROR("AUTH_001", "Authentication required"),
        AUTHORIZATION_ERROR("AUTH_002", "Access denied"),
        USER_NOT_FOUND("USER_001", "User not found"),
        RESOURCE_NOT_FOUND("RESOURCE_001", "Resource not found"),
        RATE_LIMIT_EXCEEDED("RATE_001", "Rate limit exceeded"),
        INTERNAL_ERROR("INTERNAL_001", "An internal error occurred"),
        DATABASE_ERROR("DB_001", "Database operation failed")
    }
    
    suspend fun handleError(
        call: ApplicationCall,
        errorCode: ErrorCode,
        httpStatus: HttpStatusCode = HttpStatusCode.BadRequest,
        details: String? = null
    ) {
        val errorId = UUID.randomUUID().toString()
        
        // Log detailed error internally (for debugging)
        if (details != null) {
            call.application.environment.log.error("Error ID: $errorId, Code: ${errorCode.code}, Details: $details")
        } else {
            call.application.environment.log.error("Error ID: $errorId, Code: ${errorCode.code}")
        }
        
        // Send generic error response to client
        call.respond(httpStatus, ApiResponse<Any>(
            success = false,
            error = errorCode.message,
            data = mapOf(
                "errorCode" to errorCode.code,
                "errorId" to errorId
            )
        ))
    }
    
    suspend fun handleValidationError(call: ApplicationCall, validationMessage: String) {
        handleError(
            call = call,
            errorCode = ErrorCode.VALIDATION_ERROR,
            httpStatus = HttpStatusCode.BadRequest,
            details = validationMessage
        )
    }
    
    suspend fun handleAuthenticationError(call: ApplicationCall) {
        handleError(
            call = call,
            errorCode = ErrorCode.AUTHENTICATION_ERROR,
            httpStatus = HttpStatusCode.Unauthorized
        )
    }
    
    suspend fun handleAuthorizationError(call: ApplicationCall) {
        handleError(
            call = call,
            errorCode = ErrorCode.AUTHORIZATION_ERROR,
            httpStatus = HttpStatusCode.Forbidden
        )
    }
    
    suspend fun handleUserNotFound(call: ApplicationCall) {
        handleError(
            call = call,
            errorCode = ErrorCode.USER_NOT_FOUND,
            httpStatus = HttpStatusCode.NotFound
        )
    }
    
    suspend fun handleResourceNotFound(call: ApplicationCall) {
        handleError(
            call = call,
            errorCode = ErrorCode.RESOURCE_NOT_FOUND,
            httpStatus = HttpStatusCode.NotFound
        )
    }
    
    suspend fun handleRateLimitExceeded(call: ApplicationCall) {
        handleError(
            call = call,
            errorCode = ErrorCode.RATE_LIMIT_EXCEEDED,
            httpStatus = HttpStatusCode.TooManyRequests
        )
    }
    
    suspend fun handleInternalError(call: ApplicationCall, exception: Exception) {
        handleError(
            call = call,
            errorCode = ErrorCode.INTERNAL_ERROR,
            httpStatus = HttpStatusCode.InternalServerError,
            details = exception.message
        )
    }
    
    suspend fun handleDatabaseError(call: ApplicationCall, exception: Exception) {
        handleError(
            call = call,
            errorCode = ErrorCode.DATABASE_ERROR,
            httpStatus = HttpStatusCode.InternalServerError,
            details = exception.message
        )
    }
}