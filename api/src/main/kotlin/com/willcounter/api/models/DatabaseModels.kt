package com.willcounter.api.models

import org.jetbrains.exposed.dao.*
import org.jetbrains.exposed.dao.id.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.javatime.*
import java.time.*
import java.util.*

// Users table
object Users : UUIDTable("users") {
    val auth0Id = text("auth0_id").uniqueIndex()
    val email = text("email").uniqueIndex()
    val createdAt = datetime("created_at").default(LocalDateTime.now())
    val lastLogin = datetime("last_login").nullable()
    val preferences = text("preferences").default("""{"soundEnabled": true, "notificationEnabled": true, "theme": "light"}""")
}

class User(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<User>(Users)
    
    var auth0Id by Users.auth0Id
    var email by Users.email
    var createdAt by Users.createdAt
    var lastLogin by Users.lastLogin
    var preferences by Users.preferences
}

// Will counts table
object WillCounts : UUIDTable("will_counts") {
    val userId = reference("user_id", Users)
    val date = date("date")
    val count = integer("count").default(0)
    val timestamps = text("timestamps").default("[]") // JSON array of timestamps
    val createdAt = datetime("created_at").default(LocalDateTime.now())
    val updatedAt = datetime("updated_at").default(LocalDateTime.now())
    
    init {
        uniqueIndex(userId, date)
    }
}

class WillCount(id: EntityID<UUID>) : UUIDEntity(id) {
    companion object : UUIDEntityClass<WillCount>(WillCounts)
    
    var userId by WillCounts.userId
    var user by User referencedOn WillCounts.userId
    var date by WillCounts.date
    var count by WillCounts.count
    var timestamps by WillCounts.timestamps
    var createdAt by WillCounts.createdAt
    var updatedAt by WillCounts.updatedAt
}