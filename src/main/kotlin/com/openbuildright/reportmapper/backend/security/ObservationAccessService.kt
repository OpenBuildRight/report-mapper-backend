package com.openbuildright.reportmapper.backend.security

import com.openbuildright.reportmapper.backend.model.ObservationModel
import com.openbuildright.reportmapper.backend.service.ObservationService
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

enum class AccessLevel {
    PUBLIC, OWNER, MODERATOR, DENIED
}

data class AccessInfo(
    val accessLevel: AccessLevel,
    val canEdit: Boolean,
    val canPublish: Boolean,
    val canDelete: Boolean
)

@Service
class ObservationAccessService(
    private val observationService: ObservationService,
    private val jwtScopeExtractor: JwtScopeExtractor
) {
    private val logger = LoggerFactory.getLogger(ObservationAccessService::class.java)
    
    /**
     * Check if user is the owner of an observation
     */
    fun isOwner(observationId: String, username: String): Boolean {
        logger.debug("Checking ownership for observation {} by user {}", observationId, username)
        val observation = observationService.getObservation(observationId)
        val isOwner = observation.reporterId == username
        logger.debug("Ownership result for observation {} by user {}: {}", observationId, username, isOwner)
        return isOwner
    }
    
    /**
     * Check if an observation is published (enabled)
     */
    fun isPublished(observationId: String): Boolean {
        logger.debug("Checking publication status for observation {}", observationId)
        val observation = observationService.getObservation(observationId)
        val isPublished = observation.enabled
        logger.debug("Publication status for observation {}: {}", observationId, isPublished)
        return isPublished
    }
    
    /**
     * Check if user can edit an observation
     */
    fun canEdit(observationId: String, authentication: Authentication): Boolean {
        val username = authentication.name
        val hasModeratorRole = jwtScopeExtractor.hasModeratorRole(authentication)
        return isOwner(observationId, username) || hasModeratorRole
    }
    
    /**
     * Check if user can publish/unpublish an observation
     */
    fun canPublish(observationId: String, authentication: Authentication): Boolean {
        return jwtScopeExtractor.hasModeratorRole(authentication)
    }
    
    /**
     * Check if user can delete an observation
     */
    fun canDelete(observationId: String, authentication: Authentication): Boolean {
        val username = authentication.name
        val hasModeratorRole = jwtScopeExtractor.hasModeratorRole(authentication)
        return isOwner(observationId, username) || hasModeratorRole
    }
    
    /**
     * Get comprehensive access information for an observation
     */
    fun getAccessInfo(observationId: String, authentication: Authentication?): AccessInfo {
        if (authentication == null) {
            return if (isPublished(observationId)) {
                AccessInfo(AccessLevel.PUBLIC, false, false, false)
            } else {
                AccessInfo(AccessLevel.DENIED, false, false, false)
            }
        }
        
        val username = authentication.name
        val hasModeratorRole = jwtScopeExtractor.hasModeratorRole(authentication)
        val isOwner = isOwner(observationId, username)
        val isPublished = isPublished(observationId)
        
        val accessLevel = when {
            hasModeratorRole -> AccessLevel.MODERATOR
            isOwner -> AccessLevel.OWNER
            isPublished -> AccessLevel.PUBLIC
            else -> AccessLevel.DENIED
        }
        
        return AccessInfo(
            accessLevel = accessLevel,
            canEdit = isOwner || hasModeratorRole,
            canPublish = hasModeratorRole,
            canDelete = isOwner || hasModeratorRole
        )
    }
    
    /**
     * Check if user can access a draft resource (image, etc.)
     */
    fun canAccessDraftResource(resourceId: String, authentication: Authentication): Boolean {
        val username = authentication.name
        val hasModeratorRole = jwtScopeExtractor.hasModeratorRole(authentication)
        
        if (hasModeratorRole) return true
        
        val observations = observationService.getObservationsByUser(username)
        return observations.any { observation ->
            observation.imageIds.contains(resourceId)
        }
    }
    
    /**
     * Check if a resource is published (part of an enabled observation)
     */
    fun isResourcePublished(resourceId: String): Boolean {
        val observations = observationService.getAllObservations()
        return observations.any { observation ->
            observation.enabled && observation.imageIds.contains(resourceId)
        }
    }
}
