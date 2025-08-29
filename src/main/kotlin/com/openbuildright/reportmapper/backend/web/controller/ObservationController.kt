package com.openbuildright.reportmapper.backend.web.controller

import com.openbuildright.reportmapper.backend.model.ObservationCreateModel
import com.openbuildright.reportmapper.backend.model.ObservationModel
import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.service.ObservationService
import com.openbuildright.reportmapper.backend.web.dto.ObservationCreateDto
import com.openbuildright.reportmapper.backend.web.dto.ObservationDto
import com.openbuildright.reportmapper.backend.web.dto.SecureResponse
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/observation")
class ObservationController(
    @Autowired val observationService: ObservationService
) {
    private val logger = KotlinLogging.logger {}

    @PostMapping
    fun createObservation(
        @RequestBody dto: ObservationCreateDto,
        authentication: Authentication
    ): ObservationDto {
        val observationModel = ObservationCreateModel(
            observationTime = dto.observationTime,
            location = GeoLocationModel(dto.location.latitude, dto.location.longitude),
            imageIds = dto.imageIds,
            properties = dto.properties,
            reporterId = authentication.name,
            description = dto.description,
            title = dto.title
        )
        val observationModelResult = observationService.createObservation(observationModel)
        return ObservationDto.fromObservationModel(observationModelResult)
    }

    /**
     * Get observation by ID
     */
    @GetMapping("/{id}")
    fun getObservation(@PathVariable id: String, authentication: Authentication?): ResponseEntity<SecureResponse<ObservationDto>> {
        return try {
            val observation = observationService.getObservation(id)
            val observationDto = ObservationDto.fromObservationModel(observation)
            
            // For now, return public access - we'll implement proper permission checking later
            val response = SecureResponse.public(observationDto)
            ResponseEntity.ok(response)
        } catch (e: Exception) {
            logger.error { "Error getting observation $id: ${e.message}" }
            ResponseEntity.ok(SecureResponse.denied<ObservationDto>("Observation not found"))
        }
    }

    @PutMapping("/{id}")
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
    fun disableObservation(@PathVariable id: String): ResponseEntity<Map<String, String>> {
        observationService.disableObservation(id)
        return ResponseEntity.ok(mapOf("message" to "Observation disabled successfully"))
    }

    /**
     * Admin-only endpoint to enable/disable observations
     */
    @PatchMapping("/{id}/enable")
    fun enableObservation(@PathVariable id: String): ResponseEntity<ObservationDto> {
        val observation = observationService.enableObservation(id)
        return ResponseEntity.ok(ObservationDto.fromObservationModel(observation))
    }

    /**
     * Publish an observation (grant public read access)
     */
    @PatchMapping("/{id}/publish")
    fun publishObservation(
        @PathVariable id: String,
        authentication: Authentication
    ): ResponseEntity<ObservationDto> {
        logger.info { "User ${authentication.name} attempting to publish observation $id" }
        val observation = observationService.publishObservation(id, authentication.name)
        return ResponseEntity.ok(ObservationDto.fromObservationModel(observation))
    }

    /**
     * Unpublish an observation (revoke public read access)
     */
    @PatchMapping("/{id}/unpublish")
    fun unpublishObservation(
        @PathVariable id: String,
        authentication: Authentication
    ): ResponseEntity<ObservationDto> {
        logger.info { "User ${authentication.name} attempting to unpublish observation $id" }
        val observation = observationService.unpublishObservation(id)
        return ResponseEntity.ok(ObservationDto.fromObservationModel(observation))
    }

    /**
     * Get current user's observations
     */
    @GetMapping("/my-observations")
    fun getMyObservations(authentication: Authentication): List<ObservationDto> {
        return observationService.getObservationsByUser(authentication.name)
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
     * Admin-only endpoint to get all observations for admin purposes
     */
    @GetMapping("/admin/all")
    fun getAllObservations(authentication: Authentication): List<ObservationDto> {
        logger.info { "Admin ${authentication.name} accessing all observations" }
        return observationService.getAllObservations()
            .map { ObservationDto.fromObservationModel(it) }
    }
}