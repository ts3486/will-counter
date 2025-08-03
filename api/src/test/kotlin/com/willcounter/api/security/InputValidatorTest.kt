package com.willcounter.api.security

import com.willcounter.api.validation.InputValidator
import org.junit.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class InputValidatorTest {
    
    @Test
    fun `validateEmail should accept valid email`() {
        val result = InputValidator.validateEmail("test@example.com")
        assertEquals("test@example.com", result)
    }
    
    @Test
    fun `validateEmail should normalize email`() {
        val result = InputValidator.validateEmail("  TEST@EXAMPLE.COM  ")
        assertEquals("test@example.com", result)
    }
    
    @Test
    fun `validateEmail should reject invalid email`() {
        assertFailsWith<InputValidator.ValidationException> {
            InputValidator.validateEmail("invalid-email")
        }
    }
    
    @Test
    fun `validateAuth0Id should accept valid Auth0 ID`() {
        val result = InputValidator.validateAuth0Id("auth0|123456789")
        assertEquals("auth0|123456789", result)
    }
    
    @Test
    fun `validateAuth0Id should reject null`() {
        assertFailsWith<InputValidator.ValidationException> {
            InputValidator.validateAuth0Id(null)
        }
    }
    
    @Test
    fun `validateDays should default to 30`() {
        val result = InputValidator.validateDays(null)
        assertEquals(30, result)
    }
    
    @Test
    fun `validateDays should reject negative values`() {
        assertFailsWith<InputValidator.ValidationException> {
            InputValidator.validateDays("-5")
        }
    }
    
    @Test
    fun `validateDays should reject values over 365`() {
        assertFailsWith<InputValidator.ValidationException> {
            InputValidator.validateDays("400")
        }
    }
}