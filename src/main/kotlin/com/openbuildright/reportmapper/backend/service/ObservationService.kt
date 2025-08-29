package com.openbuildright.reportmapper.backend.service

import geoLocationModelToPoint
import com.openbuildright.reportmapper.backend.db.mongo.ObservationDocument
import com.openbuildright.reportmapper.backend.db.mongo.ObservationDocumentRepository
import com.openbuildright.reportmapper.backend.exception.NotFoundException
import com.openbuildright.reportmapper.backend.model.ObservationCreateModel
import com.openbuildright.reportmapper.backend.model.ObservationModel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.*

@Service
class ObservationService(

    @param:Autowired
    val observationRepository: ObservationDocumentRepository,

    @param:Autowired
    val imageService: ImageService,
) {

    fun createObservation(observationModel: ObservationCreateModel): ObservationModel {
        val now: Instant = Instant.now()

        // Make Sure Images Exist
        val images = imageService.listImagesMetadata(observationModel.imageIds.toSet())

        val observationId = UUID.randomUUID().toString()

        val observation = ObservationDocument(
            observationTime = observationModel.observationTime,
            createdTime = now,
            updatedTime = now,
            location = geoLocationModelToPoint(observationModel.location),
            enabled = false,
            imageIds = images.stream().map { it.id }.toList().toSet(),
            id = observationId,
            reporterId = observationModel.reporterId,
            properties = observationModel.properties,
            description = observationModel.description,
            title = observationModel.title
        )
        val returnedObservation = observationRepository.save(observation)
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

    fun deleteObservation(id: String) {
        val observation: Optional<ObservationDocument> = observationRepository.findById(id)
        if (observation.isEmpty) {
            throw NotFoundException(String.format("Observation %s not found", id))
        }
        observationRepository.deleteById(id)
    }

    fun publishObservation(id: String, enabled: Boolean): ObservationModel {
        val observationResponse: Optional<ObservationDocument?> = observationRepository.findById(id)
        if (observationResponse.isEmpty) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Observation ${id} not found.")
        }
        val observation: ObservationDocument = observationResponse.get()
        val now: Instant = Instant.now()
        observation.updatedTime = now
        observation.enabled = enabled
        val observationPutResponse: ObservationDocument = observationRepository.save(observation)
        return observationPutResponse.toObservationModel()
    }

    /**
     * Get all observations for a specific user
     */
    fun getObservationsByUser(username: String): List<ObservationModel> {
        return observationRepository.findByReporterId(username)
            .map { it.toObservationModel() }
    }

    /**
     * Get all observations (for admin/access control purposes)
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