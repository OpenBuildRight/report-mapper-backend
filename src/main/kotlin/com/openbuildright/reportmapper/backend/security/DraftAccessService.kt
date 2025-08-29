package com.openbuildright.reportmapper.backend.security

import com.openbuildright.reportmapper.backend.service.ObservationService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class DraftAccessService(
    private val observationService: ObservationService
) {
    private val logger = LoggerFactory.getLogger(DraftAccessService::class.java)
    
    /**
     * Check if a user can access a draft resource (image, observation, etc.)
     * @param resourceId The ID of the resource to check access for
     * @param username The username of the authenticated user
     * @return true if the user can access the resource, false otherwise
     */
    fun canAccessDraft(resourceId: String, username: String): Boolean {
        return try {
            logger.debug("Checking draft access for resource {} by user {}", resourceId, username)
            
            // For images, check if they're part of any observation created by this user
            val observations = observationService.getObservationsByUser(username)
            val hasAccess = observations.any { observation ->
                observation.imageIds.contains(resourceId)
            }
            
            logger.debug("Draft access result for resource {} by user {}: {}", resourceId, username, hasAccess)
            hasAccess
        } catch (e: Exception) {
            logger.warn("Error checking draft access for resource {} by user {}: {}", resourceId, username, e.message)
            // If there's any error checking access, deny access
            false
        }
    }

    /**
     * Check if a user can access a draft observation
     * @param observationId The ID of the observation to check access for
     * @param username The username of the authenticated user
     * @return true if the user can access the observation, false otherwise
     */
    fun canAccessDraftObservation(observationId: String, username: String): Boolean {
        return try {
            logger.debug("Checking draft observation access for {} by user {}", observationId, username)
            
            val observation = observationService.getObservation(observationId)
            val hasAccess = observation.reporterId == username
            
            logger.debug("Draft observation access result for {} by user {}: {}", observationId, username, hasAccess)
            hasAccess
        } catch (e: Exception) {
            logger.warn("Error checking draft observation access for {} by user {}: {}", observationId, username, e.message)
            // If there's any error checking access, deny access
            false
        }
    }

    /**
     * Check if a resource is published (part of an enabled observation)
     * @param resourceId The ID of the resource to check
     * @return true if the resource is published, false otherwise
     */
    fun isResourcePublished(resourceId: String): Boolean {
        return try {
            logger.debug("Checking if resource {} is published", resourceId)
            
            val observations = observationService.getAllObservations()
            val isPublished = observations.any { observation ->
                observation.enabled && observation.imageIds.contains(resourceId)
            }
            
            logger.debug("Resource {} publication status: {}", resourceId, isPublished)
            isPublished
        } catch (e: Exception) {
            logger.warn("Error checking publication status for resource {}: {}", resourceId, e.message)
            // If there's any error checking publication status, consider it not published
            false
        }
    }
}
