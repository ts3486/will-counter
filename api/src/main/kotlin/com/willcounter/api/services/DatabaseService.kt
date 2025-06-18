package com.willcounter.api.services

import com.willcounter.api.models.*
import com.willcounter.api.dto.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.dao.id.EntityID
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

class DatabaseService {
    
    fun createUser(request: CreateUserRequest): UserResponse = transaction {
        val user = User.new {
            auth0Id = request.auth0Id
            email = request.email
            createdAt = LocalDateTime.now()
        }
        
        UserResponse(
            id = user.id.value.toString(),
            auth0Id = user.auth0Id,
            email = user.email,
            createdAt = user.createdAt.toString(),
            lastLogin = user.lastLogin?.toString(),
            preferences = user.preferences
        )
    }
    
    fun getUserByAuth0Id(auth0Id: String): UserResponse? = transaction {
        User.find { Users.auth0Id eq auth0Id }
            .firstOrNull()?.let { user ->
                UserResponse(
                    id = user.id.value.toString(),
                    auth0Id = user.auth0Id,
                    email = user.email,
                    createdAt = user.createdAt.toString(),
                    lastLogin = user.lastLogin?.toString(),
                    preferences = user.preferences
                )
            }
    }
    
    fun updateLastLogin(userId: String): Boolean = transaction {
        try {
            val userUUID = UUID.fromString(userId)
            Users.update({ Users.id eq userUUID }) {
                it[Users.lastLogin] = LocalDateTime.now()
            } > 0
        } catch (e: Exception) {
            false
        }
    }
    
    fun getTodayCount(userId: String): WillCountResponse? = transaction {
        try {
            val userUUID = UUID.fromString(userId)
            val today = LocalDate.now()
            
            // Try to find existing record
            val existing = WillCount.find { 
                (WillCounts.userId eq userUUID) and (WillCounts.date eq today)
            }.firstOrNull()
            
            if (existing != null) {
                return@transaction existing.toResponse()
            }
            
            // Create new record for today
            val newCount = WillCount.new {
                this.userId = EntityID(userUUID, Users)
                this.date = today
                this.count = 0
                this.timestamps = "[]"
                this.createdAt = LocalDateTime.now()
                this.updatedAt = LocalDateTime.now()
            }
            
            newCount.toResponse()
        } catch (e: Exception) {
            null
        }
    }
    
    fun incrementCount(userId: String): WillCountResponse? = transaction {
        try {
            val userUUID = UUID.fromString(userId)
            val today = LocalDate.now()
            val now = LocalDateTime.now()
            
            // Get or create today's record
            val willCount = WillCount.find { 
                (WillCounts.userId eq userUUID) and (WillCounts.date eq today)
            }.firstOrNull() ?: WillCount.new {
                this.userId = EntityID(userUUID, Users)
                this.date = today
                this.count = 0
                this.timestamps = "[]"
                this.createdAt = LocalDateTime.now()
                this.updatedAt = LocalDateTime.now()
            }
            
            // Parse existing timestamps
            val currentTimestamps = try {
                Json.decodeFromString<List<String>>(willCount.timestamps)
            } catch (e: Exception) {
                emptyList()
            }
            
            // Add new timestamp and increment count
            val newTimestamps = currentTimestamps + now.toString()
            willCount.count += 1
            willCount.timestamps = Json.encodeToString(newTimestamps)
            willCount.updatedAt = now
            
            willCount.toResponse()
        } catch (e: Exception) {
            null
        }
    }
    
    fun getUserStatistics(userId: String, days: Int = 30): StatisticsResponse? = transaction {
        try {
            val userUUID = UUID.fromString(userId)
            val startDate = LocalDate.now().minusDays(days.toLong())
            
            val counts = WillCount.find { 
                (WillCounts.userId eq userUUID) and (WillCounts.date greaterEq startDate)
            }.orderBy(WillCounts.date to SortOrder.DESC)
            
            val totalCount = counts.sumOf { it.count }
            val todayCount = counts.find { it.date == LocalDate.now() }?.count ?: 0
            val weeklyAverage = if (counts.count() > 0) totalCount.toDouble() / minOf(days, 7) else 0.0
            
            val dailyCounts = counts.map { willCount ->
                val timestamps = try {
                    Json.decodeFromString<List<String>>(willCount.timestamps)
                } catch (e: Exception) {
                    emptyList()
                }
                
                DailyStat(
                    date = willCount.date.toString(),
                    count = willCount.count,
                    sessions = timestamps.size
                )
            }
            
            StatisticsResponse(
                totalCount = totalCount,
                todayCount = todayCount,
                weeklyAverage = weeklyAverage,
                dailyCounts = dailyCounts
            )
        } catch (e: Exception) {
            null
        }
    }
    
    fun testConnection(): Boolean = transaction {
        try {
            Users.selectAll().limit(1).count() >= 0
        } catch (e: Exception) {
            false
        }
    }
    
    private fun WillCount.toResponse(): WillCountResponse {
        val timestampList = try {
            Json.decodeFromString<List<String>>(this.timestamps)
        } catch (e: Exception) {
            emptyList()
        }
        
        return WillCountResponse(
            id = this.id.value.toString(),
            userId = this.userId.value.toString(),
            date = this.date.toString(),
            count = this.count,
            timestamps = timestampList,
            createdAt = this.createdAt.toString(),
            updatedAt = this.updatedAt.toString()
        )
    }
}