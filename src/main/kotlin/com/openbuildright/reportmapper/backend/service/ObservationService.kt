package com.openbuildright.reportmapper.backend.service

import com.openbuildright.reportmapper.backend.db.mongo.ObservationDocumentRepository
import com.openbuildright.reportmapper.backend.db.mongo.ObservationDocument
import com.openbuildright.reportmapper.backend.exception.NotFoundException
import com.openbuildright.reportmapper.backend.model.ObservationCreateModel
import com.openbuildright.reportmapper.backend.model.ObservationModel
import com.openbuildright.reportmapper.backend.security.ObjectType
import com.openbuildright.reportmapper.backend.security.PermissionService
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
            published = false,
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
    fun unpublishObservation(id: String): ObservationModel {
        val observationResponse: Optional<ObservationDocument?> = observationRepository.findById(id)
        if (observationResponse.isEmpty) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Observation ${id} not found.")
        }
        val observation: ObservationDocument = observationResponse.get()
        val now: Instant = Instant.now()
        observation.updatedTime = now
        observation.published = false
        val updatedObservation = observationRepository.save(observation)
        imageService.unpublishImages(observation.imageIds)
        logger.info{ "Observation ${id} disabled." }
        // Revoke public read access when disabled
        permissionService.revokePublicRead(objectType = ObjectType.OBSERVATION, objectId=id)
        return updatedObservation.toObservationModel()
    }
    
    /**
     * Re-enable a disabled observation
     */
    fun publishObservation(id: String): ObservationModel {
        val observationResponse: Optional<ObservationDocument?> = observationRepository.findById(id)
        if (observationResponse.isEmpty) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Observation ${id} not found.")
        }
        val observation: ObservationDocument = observationResponse.get()
        val now: Instant = Instant.now()
        observation.updatedTime = now
        observation.published = true
        val updatedObservation = observationRepository.save(observation)
        permissionService.grantPublicRead(ObjectType.OBSERVATION, id)
        imageService.publishImages(observation.imageIds)
        observation.imageIds.parallelStream().forEach {

        }
        return updatedObservation.toObservationModel()
    }

    /**
     * Get all observations for a specific user (only enabled ones)
     */
    fun getObservationsByUser(username: String): List<ObservationModel> {
        return observationRepository.findByReporterId(username)
            .filter { it.published } // Only return enabled observations
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
        return observationRepository.findByPublishedTrue()
            .map { it.toObservationModel() }
    }

    /*
    * Delete observations and associated permissions.
     */
    fun  deleteObservations(ids: List<String>) {
        for (id in ids) {
            logger.info { "Deleting observation ${id}" }
        }
        observationRepository.deleteAllById(ids)
        for (id in ids) {
            logger.debug { "Observation ${id} successfully deleted." }
        }
        // ToDo: Make a deleteAll method in the repository. However, this is rare so
        //  we don't need to optimize.
        logger.debug{"Deleting all permissions for observations ${ids} due to deletion of objects.."}
        ids.parallelStream().forEach{
            permissionService.revokeObjectPermissions(ObjectType.OBSERVATION, it)
        }
        logger.debug { "All permissions revoked on Observations ${ids}" }
    }

    fun deleteObservationsWithImages(ids: List<String>) {
        val documents = observationRepository.findAllById(ids)
        val images : List<String> = documents.map{it.id}.toList()
        logger.info{ "Deleting images for observations: ${ids}." }
        imageService.deleteImages(images)
        deleteObservations(ids)
    }
}