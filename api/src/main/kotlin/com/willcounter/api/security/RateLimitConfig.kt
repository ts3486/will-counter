package com.willcounter.api.security

import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.http.*
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

object RateLimiter {
    
    private data class RequestInfo(
        val requestCount: Int,
        val windowStart: Instant
    )
    
    private val requests = ConcurrentHashMap<String, RequestInfo>()
    private const val WINDOW_SIZE_MINUTES = 1L
    private const val MAX_REQUESTS_PER_MINUTE = 60
    private const val MAX_AUTH_REQUESTS_PER_MINUTE = 5
    private const val MAX_INCREMENT_REQUESTS_PER_MINUTE = 10
    
    fun isRateLimited(call: ApplicationCall, endpoint: String = "default"): Boolean {
        val clientIp = getClientIp(call)
        val key = "$clientIp:$endpoint"
        val now = Instant.now()
        val windowStart = now.minusSeconds(WINDOW_SIZE_MINUTES * 60)
        
        val currentInfo = requests[key]
        
        val maxRequests = when (endpoint) {
            "auth" -> MAX_AUTH_REQUESTS_PER_MINUTE
            "increment" -> MAX_INCREMENT_REQUESTS_PER_MINUTE
            else -> MAX_REQUESTS_PER_MINUTE
        }
        
        if (currentInfo == null || currentInfo.windowStart.isBefore(windowStart)) {
            // New window or expired window
            requests[key] = RequestInfo(1, now)
            return false
        } else {
            // Within current window
            val newCount = currentInfo.requestCount + 1
            requests[key] = RequestInfo(newCount, currentInfo.windowStart)
            return newCount > maxRequests
        }
    }
    
    private fun getClientIp(call: ApplicationCall): String {
        return call.request.header("X-Forwarded-For")?.split(",")?.first()?.trim()
            ?: call.request.header("X-Real-IP")
            ?: "unknown"
    }
    
    // Clean up old entries periodically
    fun cleanup() {
        val cutoff = Instant.now().minusSeconds(WINDOW_SIZE_MINUTES * 60 * 2)
        requests.entries.removeIf { it.value.windowStart.isBefore(cutoff) }
    }
}