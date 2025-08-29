package com.openbuildright.reportmapper.backend.web.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ObservationCreateModel
import com.openbuildright.reportmapper.backend.model.ObservationModel
import com.openbuildright.reportmapper.backend.security.ObservationAccessService
import com.openbuildright.reportmapper.backend.security.OwnerOrModeratorAccess
import com.openbuildright.reportmapper.backend.security.ModeratorOnly
import com.openbuildright.reportmapper.backend.service.ObservationService
import com.openbuildright.reportmapper.backend.web.dto.ObservationCreateDto
import com.openbuildright.reportmapper.backend.web.dto.ObservationDto
import com.openbuildright.reportmapper.backend.web.dto.SecureResponse
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/observation")
class ObservationController(
    @Autowired val observationService: ObservationService,
    @Autowired val observationAccessService: ObservationAccessService
) {
    private val logger = KotlinLogging.logger {}

    @PostMapping()
    fun createObservation(
        @RequestBody dto: ObservationCreateDto,
        authentication: Authentication
    ): ObservationDto {
        logger.info { "Received request to create observation." }

        val observationModel: ObservationCreateModel = ObservationCreateModel(
            dto.observationTime,
            GeoLocationModel(dto.location.latitude, dto.location.longitude),
            dto.imageIds,
            dto.properties,
            reporterId = authentication.name,
            description = dto.description,
            title = dto.title
        )
        val observationModelResult = observationService.createObservation(observationModel)
        return ObservationDto.fromObservationModel(observationModelResult)
    }

    /**
     * Smart observation endpoint - handles both draft and published observations
     * with appropriate access control
     */
    @GetMapping("/{id}")
    fun getObservation(@PathVariable id: String, authentication: Authentication?): ResponseEntity<SecureResponse<ObservationDto>> {
        return try {
            val accessResult = observationAccessService.getAccessInfoWithObservation(id, authentication)
            
            when (accessResult.accessInfo.accessLevel) {
                com.openbuildright.reportmapper.backend.security.AccessLevel.DENIED -> {
                    ResponseEntity.ok(SecureResponse.denied<ObservationDto>("Access denied"))
                }
                else -> {
                    val observation = accessResult.observation
                    if (observation == null) {
                        ResponseEntity.ok(SecureResponse.denied<ObservationDto>("Observation not found"))
                    } else {
                        val observationDto = ObservationDto.fromObservationModel(observation)
                        
                        val response = when (accessResult.accessInfo.accessLevel) {
                            com.openbuildright.reportmapper.backend.security.AccessLevel.PUBLIC -> {
                                SecureResponse.public(observationDto)
                            }
                            com.openbuildright.reportmapper.backend.security.AccessLevel.OWNER -> {
                                SecureResponse.owner(observationDto, accessResult.accessInfo.canEdit, accessResult.accessInfo.canDelete)
                            }
                            com.openbuildright.reportmapper.backend.security.AccessLevel.MODERATOR -> {
                                SecureResponse.moderator(observationDto)
                            }
                            else -> SecureResponse.denied<ObservationDto>()
                        }
                        
                        ResponseEntity.ok(response)
                    }
                }
            }
        } catch (e: Exception) {
            logger.error { "Error getting observation $id: ${e.message}" }
            ResponseEntity.ok(SecureResponse.denied<ObservationDto>("Observation not found"))
        }
    }

    @PutMapping("/{id}")
    @OwnerOrModeratorAccess
    fun updateObservation(
        @PathVariable id: String,
        @RequestBody dto: ObservationCreateDto,
        authentication: Authentication
    ): ObservationDto {
        val observation: ObservationModel = observationService.updateObservation(
            id,
            ObservationCreateModel(
                observationTime = dto.observationTime,
                location = GeoLocationModel(dto.location.latitude, dto.location.longitude),
                imageIds = dto.imageIds,
                properties = dto.properties,
                reporterId = authentication.name,
                description = dto.description,
                title = dto.title
            )
        )
        return ObservationDto.fromObservationModel(observation)
    }

    @DeleteMapping("/{id}")
    @OwnerOrModeratorAccess
    fun deleteObservation(@PathVariable id: String): ResponseEntity<Map<String, String>> {
        observationService.deleteObservation(id)
        return ResponseEntity.ok(mapOf("message" to "Observation deleted successfully"))
    }

    /**
     * Moderator-only endpoint to publish/unpublish observations
     */
    @PatchMapping("/{id}/publish")
    @ModeratorOnly
    fun publishObservation(
        @PathVariable id: String,
        @RequestParam enabled: Boolean,
        authentication: Authentication
    ): ResponseEntity<ObservationDto> {
        logger.info { "Moderator ${authentication.name} attempting to ${if (enabled) "publish" else "unpublish"} observation $id" }
        val observation = observationService.publishObservation(id, enabled)
        return ResponseEntity.ok(ObservationDto.fromObservationModel(observation))
    }

    /**
     * Get current user's draft observations
     */
    @GetMapping("/my-drafts")
    fun getMyDraftObservations(authentication: Authentication): List<ObservationDto> {
        return observationService.getObservationsByUser(authentication.name)
            .filter { !it.enabled } // Only return unpublished observations
            .map { ObservationDto.fromObservationModel(it) }
    }

    /**
     * Get all published observations (public access)
     */
    @GetMapping("/published")
    fun getPublishedObservations(): List<ObservationDto> {
        return observationService.getPublishedObservations()
            .map { ObservationDto.fromObservationModel(it) }
    }

    /**
     * Moderator-only endpoint to get all observations for moderation
     */
    @GetMapping("/moderation")
    @ModeratorOnly
    fun getObservationsForModeration(authentication: Authentication): List<ObservationDto> {
        logger.info { "Moderator ${authentication.name} accessing moderation view" }
        return observationService.getAllObservations()
            .map { ObservationDto.fromObservationModel(it) }
    }
}