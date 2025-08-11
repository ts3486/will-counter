package com.willcounter.api

import com.willcounter.api.dto.ApiResponse
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString

class SecureApiTest {

    @Test
    fun testHealthEndpoint() = testApplication {
        application {
            module()
        }
        val response = client.get("/health")
        assertEquals(HttpStatusCode.OK, response.status)
        assertTrue(response.bodyAsText().contains("running"))
    }

    @Test
    fun testRootEndpoint() = testApplication {
        application {
            module()
        }
        val response = client.get("/")
        assertEquals(HttpStatusCode.OK, response.status)
        val responseText = response.bodyAsText()
        val apiResponse = Json.decodeFromString<ApiResponse<Map<String, String>>>(responseText)
        assertTrue(apiResponse.success)
        assertEquals("Will Counter API", apiResponse.data?.get("message"))
    }

    @Test
    fun testUnauthorizedAccessToSecureEndpoints() = testApplication {
        application {
            module()
        }

        // Test that secure endpoints require authentication
        val endpoints = listOf(
            "/api/will-counts/today",
            "/api/will-counts/increment",
            "/api/will-counts/reset",
            "/api/will-counts/users/ensure"
        )

        for (endpoint in endpoints) {
            val response = if (endpoint.contains("/increment") || endpoint.contains("/reset") || endpoint.contains("/ensure")) {
                client.post(endpoint)
            } else {
                client.get(endpoint)
            }
            assertEquals(
                HttpStatusCode.Unauthorized, 
                response.status,
                "Expected 401 for unauthenticated access to $endpoint"
            )
        }
    }

    @Test
    fun testInvalidJWTToken() = testApplication {
        application {
            module()
        }

        val response = client.get("/api/will-counts/today") {
            header(HttpHeaders.Authorization, "Bearer invalid-token")
        }
        assertEquals(HttpStatusCode.Unauthorized, response.status)
    }

    @Test
    fun testCORSHeaders() = testApplication {
        application {
            module()
        }

        val response = client.options("/api/will-counts/today") {
            header(HttpHeaders.Origin, "http://localhost:3000")
            header(HttpHeaders.AccessControlRequestMethod, "GET")
            header(HttpHeaders.AccessControlRequestHeaders, "Authorization")
        }
        
        assertEquals(HttpStatusCode.OK, response.status)
        assertTrue(response.headers[HttpHeaders.AccessControlAllowOrigin] != null)
        assertTrue(response.headers[HttpHeaders.AccessControlAllowMethods]?.contains("GET") == true)
    }

    @Test
    fun testAPIResponseFormat() = testApplication {
        application {
            module()
        }

        val response = client.get("/")
        assertEquals(HttpStatusCode.OK, response.status)
        
        val responseText = response.bodyAsText()
        val apiResponse = Json { ignoreUnknownKeys = true }.decodeFromString<ApiResponse<Any>>(responseText)
        
        assertTrue(apiResponse.success)
        assertTrue(apiResponse.data != null)
        assertTrue(apiResponse.message != null)
    }

    @Test
    fun testSecurityHeaders() = testApplication {
        application {
            module()
        }

        val response = client.get("/")
        
        // Verify that sensitive information is not exposed in headers
        val headers = response.headers.names()
        assertTrue(!headers.any { it.lowercase().contains("supabase") })
        assertTrue(!headers.any { it.lowercase().contains("service") })
        assertTrue(!headers.any { it.lowercase().contains("secret") })
    }
}