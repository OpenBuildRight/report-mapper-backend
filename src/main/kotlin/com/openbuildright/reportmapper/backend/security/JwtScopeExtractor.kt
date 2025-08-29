package com.openbuildright.reportmapper.backend.security

import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component

@Component
class JwtScopeExtractor {
    
    /**
     * Extract scopes from OAuth2/OIDC JWT token
     * @param authentication The Spring Security authentication object
     * @return List of scopes/roles
     */
    fun extractScopes(authentication: Authentication): List<String> {
        val principal = authentication.principal as Jwt
        val scopeClaim = principal.claims["scope"]?.toString()
        return scopeClaim?.split(" ")?.filter { it.isNotBlank() } ?: emptyList()
    }
    
    /**
     * Check if user has moderator role
     * @param authentication The Spring Security authentication object
     * @return true if user has moderator role
     */
    fun hasModeratorRole(authentication: Authentication): Boolean {
        val scopes = extractScopes(authentication)
        return scopes.any { it.equals("moderator", ignoreCase = true) }
    }
}
