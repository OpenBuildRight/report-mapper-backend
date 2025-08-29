package com.openbuildright.reportmapper.backend.security

import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component

@Component
class JwtScopeExtractor {
    
    /**
     * Extract scopes from Spring Security authorities (mapped from OAuth2/OIDC JWT scopes)
     * @param authentication The Spring Security authentication object
     * @return List of scopes/roles
     */
    fun extractScopes(authentication: Authentication): List<String> {
        return authentication.authorities
            .map { it.authority }
            .filter { it.startsWith("ROLE_") }
            .map { it.removePrefix("ROLE_") }
    }
    
    /**
     * Check if user has moderator role
     * @param authentication The Spring Security authentication object
     * @return true if user has moderator role
     */
    fun hasModeratorRole(authentication: Authentication): Boolean {
        return authentication.authorities.any { 
            it.authority == "ROLE_moderator" 
        }
    }
}
