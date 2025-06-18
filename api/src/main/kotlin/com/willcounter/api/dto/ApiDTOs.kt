package com.willcounter.api.dto

import kotlinx.serialization.Serializable

@Serializable
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String = "",
    val error: String? = null
)

@Serializable
data class HealthResponse(
    val status: String,
    val timestamp: String,
    val database: String
)

// User DTOs
@Serializable
data class CreateUserRequest(
    val auth0Id: String,
    val email: String
)

@Serializable
data class UserResponse(
    val id: String,
    val auth0Id: String,
    val email: String,
    val createdAt: String,
    val lastLogin: String? = null,
    val preferences: String
)

// Will Count DTOs
@Serializable
data class IncrementCountRequest(
    val userId: String
)

@Serializable
data class WillCountResponse(
    val id: String,
    val userId: String,
    val date: String,
    val count: Int,
    val timestamps: List<String>,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class StatisticsResponse(
    val totalCount: Int,
    val todayCount: Int,
    val weeklyAverage: Double,
    val dailyCounts: List<DailyStat>
)

@Serializable
data class DailyStat(
    val date: String,
    val count: Int,
    val sessions: Int
)