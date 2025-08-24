package com.willcounter.api.validation

object InputValidator {
    
    class ValidationException(message: String) : Exception(message)
    
    fun validateUserId(userId: String?): String {
        if (userId.isNullOrBlank()) {
            throw ValidationException("User ID is required")
        }
        
        if (userId.length > 100) {
            throw ValidationException("User ID too long")
        }
        
        // UUID pattern or Auth0 ID pattern
        if (!userId.matches("^[a-zA-Z0-9|_-]+$".toRegex())) {
            throw ValidationException("Invalid User ID format")
        }
        
        return userId
    }
    
    fun validateEmail(email: String?): String {
        if (email.isNullOrBlank()) {
            throw ValidationException("Email is required")
        }
        
        val trimmedEmail = email.lowercase().trim()
        
        if (trimmedEmail.length > 255) {
            throw ValidationException("Email too long")
        }
        
        if (!trimmedEmail.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$".toRegex())) {
            throw ValidationException("Invalid email format")
        }
        
        return trimmedEmail
    }
    
    fun validateAuth0Id(auth0Id: String?): String {
        if (auth0Id.isNullOrBlank()) {
            throw ValidationException("Auth0 ID is required")
        }
        
        if (auth0Id.length > 100) {
            throw ValidationException("Auth0 ID too long")
        }
        
        // Auth0 ID typically starts with provider (google-oauth2|, auth0|, etc.)
        if (!auth0Id.matches("^[a-zA-Z0-9|_.-]+$".toRegex())) {
            throw ValidationException("Invalid Auth0 ID format")
        }
        
        return auth0Id
    }
    
    fun validateDays(days: String?): Int {
        val daysInt = days?.toIntOrNull() ?: 30
        
        if (daysInt <= 0) {
            throw ValidationException("Days must be positive")
        }
        
        if (daysInt > 365) {
            throw ValidationException("Days cannot exceed 365")
        }
        
        return daysInt
    }
}