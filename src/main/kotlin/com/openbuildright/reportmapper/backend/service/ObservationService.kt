package com.openbuildright.reportmapper.backend.service

import com.openbuildright.reportmapper.backend.db.mongo.ObservationDocumentRepository
import com.openbuildright.reportmapper.backend.db.mongo.ObservationDocument
import com.openbuildright.reportmapper.backend.exception.NotFoundException
import com.openbuildright.reportmapper.backend.model.ObservationCreateModel
import com.openbuildright.reportmapper.backend.model.ObservationModel
import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.security.ObjectType
import com.openbuildright.reportmapper.backend.security.PermissionService
import com.openbuildright.reportmapper.backend.security.PermissionGranteeType
import geoLocationModelToPoint
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.*

@Service
class ObservationService(
    @Autowired val observationRepository: ObservationDocumentRepository,
    @Autowired val imageService: ImageService,
    @Autowired val permissionService: PermissionService
) {
    private val logger = KotlinLogging.logger {}

    fun createObservation(observationModel: ObservationCreateModel): ObservationModel {
        val now: Instant = Instant.now()

        // Make Sure Images Exist
        val images = imageService.listImagesMetadata(observationModel.imageIds.toSet())

        val observationId = UUID.randomUUID().toString()

        val observation = ObservationDocument(
            id = observationId,
            observationTime = observationModel.observationTime,
            createdTime = now,
            updatedTime = now,
            location = geoLocationModelToPoint(observationModel.location),
            enabled = true, // Start as enabled
            imageIds = images.stream().map { it.id }.toList().toSet(),
            reporterId = observationModel.reporterId,
            properties = observationModel.properties,
            description = observationModel.description,
            title = observationModel.title
        )
        val returnedObservation = observationRepository.save(observation)
        
        // Grant ownership permissions to the creator
        logger.debug {
            "Granting permissions on observation ${observationId} to user ${observationModel.reporterId}"
        }
        permissionService.grantOwnership(ObjectType.OBSERVATION, observationId, observationModel.reporterId)
        
        return returnedObservation.toObservationModel()
    }

    fun updateObservation(
        id: String,
        observationCreateModel: ObservationCreateModel,
    ): ObservationModel {
        val observationResponse: Optional<ObservationDocument?> = observationRepository.findById(id)
        if (observationResponse.isEmpty) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Observation ${id} not found.")
        }
        val observation: ObservationDocument = observationResponse.get()
        return updateObservation(observation, observationCreateModel)
    }
    
    fun updateObservation(
        observation: ObservationDocument,
        observationCreateModel: ObservationCreateModel,
    ): ObservationModel {
        val now: Instant = Instant.now()
        observation.updatedTime = now
        observation.location = geoLocationModelToPoint(observationCreateModel.location)
        val images = imageService.listImagesMetadata(observationCreateModel.imageIds.toSet())
        observation.imageIds = images.stream().map { it.id }.toList().toSet()
        observation.description = observationCreateModel.description
        observation.properties = observationCreateModel.properties
        observation.title = observationCreateModel.title
        val observationPutResponse: ObservationDocument = observationRepository.save(observation)
        return observationPutResponse.toObservationModel()
    }

    fun getObservation(id: String): ObservationModel {
        val observation: Optional<ObservationDocument> = observationRepository.findById(id)
        if (observation.isEmpty) {
            throw NotFoundException(String.format("Observation %s not found", id))
        }
        return observation.get().toObservationModel()
    }

    /**
     * Soft delete - disable an observation
     */
    fun disableObservation(id: String): ObservationModel {
        val observationResponse: Optional<ObservationDocument?> = observationRepository.findById(id)
        if (observationResponse.isEmpty) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Observation ${id} not found.")
        }
        val observation: ObservationDocument = observationResponse.get()
        val now: Instant = Instant.now()
        observation.updatedTime = now
        observation.enabled = false
        val updatedObservation = observationRepository.save(observation)
        
        // Revoke public read access when disabled
        // ToDO: Revoke public permissions when disabling.
        return updatedObservation.toObservationModel()
    }
    
    /**
     * Re-enable a disabled observation
     */
    fun enableObservation(id: String): ObservationModel {
        val observationResponse: Optional<ObservationDocument?> = observationRepository.findById(id)
        if (observationResponse.isEmpty) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Observation ${id} not found.")
        }
        val observation: ObservationDocument = observationResponse.get()
        val now: Instant = Instant.now()
        observation.updatedTime = now
        observation.enabled = true
        val updatedObservation = observationRepository.save(observation)
        
        return updatedObservation.toObservationModel()
    }

    /**
     * Publish an observation (grant public read access)
     */
    fun publishObservation(id: String, publishedBy: String): ObservationModel {
        val observation = getObservation(id)
        
        // Grant public read access
        permissionService.grantPublicRead(ObjectType.OBSERVATION, id, publishedBy)
        
        return observation
    }

    /**
     * Get all observations for a specific user (only enabled ones)
     */
    fun getObservationsByUser(username: String): List<ObservationModel> {
        return observationRepository.findByReporterId(username)
            .filter { it.enabled } // Only return enabled observations
            .map { it.toObservationModel() }
    }

    /**
     * Get all observations (for admin purposes - includes disabled)
     */
    fun getAllObservations(): List<ObservationModel> {
        return observationRepository.findAll()
            .map { it.toObservationModel() }
    }

    /**
     * Get all published (enabled) observations
     */
    fun getPublishedObservations(): List<ObservationModel> {
        return observationRepository.findByEnabledTrue()
            .map { it.toObservationModel() }
    }
}