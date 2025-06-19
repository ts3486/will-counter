package com.willcounter.api.config

import com.willcounter.api.config.Auth0Config.verifyToken
import com.willcounter.api.config.Auth0Config.extractUserId
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*

data class Auth0Principal(val userId: String) : Principal

fun Application.configureAuthentication() {
    install(Authentication) {
        bearer("auth0") {
            realm = "Will Counter API"
            
            authenticate { credential ->
                val token = credential.token
                val jwt = verifyToken(token)
                
                if (jwt != null) {
                    val userId = extractUserId(jwt)
                    if (userId != null) {
                        Auth0Principal(userId)
                    } else {
                        null
                    }
                } else {
                    null
                }
            }
        }
    }
}