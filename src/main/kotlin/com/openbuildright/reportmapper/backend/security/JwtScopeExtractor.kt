package com.openbuildright.reportmapper.backend.security

import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component

@Component
class JwtScopeExtractor {
    
    /**
     * Extract scopes from OAuth2/OIDC JWT token
     * @param authentication The Spring Security authentication object
     * @return List of scopes
     */
    fun extractScopes(authentication: Authentication): List<String> {
        val principal = authentication.principal as Jwt
        val scopeClaim = principal.claims["scope"]?.toString()
        return scopeClaim?.split(" ")?.filter { it.isNotBlank() } ?: emptyList()
    }
    
    /**
     * Check if user has moderator scope
     * @param authentication The Spring Security authentication object
     * @return true if user has moderator scope
     */
    fun hasModeratorScope(authentication: Authentication): Boolean {
        val scopes = extractScopes(authentication)
        return scopes.any { it == "moderator" }
    }
}
