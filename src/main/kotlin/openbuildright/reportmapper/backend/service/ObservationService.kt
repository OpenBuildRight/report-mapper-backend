package openbuildright.reportmapper.backend.service

import geoLocationModelToPoint
import openbuildright.reportmapper.backend.db.jpa.entity.Image
import openbuildright.reportmapper.backend.db.jpa.entity.Observation
import openbuildright.reportmapper.backend.db.jpa.repository.ImageRepository
import openbuildright.reportmapper.backend.db.jpa.repository.ObservationRepository
import openbuildright.reportmapper.backend.exception.NotFoundException
import openbuildright.reportmapper.backend.model.ObservationCreateModel
import openbuildright.reportmapper.backend.model.ObservationModel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.Optional

@Service
class ObservationService(

    @param:Autowired
    val observationRepository: ObservationRepository,

    @param:Autowired
    val imageRepository: ImageRepository,

    @param:Autowired
    val cryptoService: CryptoService
){

    fun createObservation(observationModel: ObservationCreateModel, observationToken: String) : ObservationModel {
        val now: Instant = Instant.now()

        val observation = Observation(
            observationTime = observationModel.observationTime,
            createdTime = now,
            updatedTime = now,
            location = geoLocationModelToPoint(observationModel.location),
            observationSignature = cryptoService.hmac(observationToken),
            enabled = true,
            images = mutableListOf()
        )
        val returnedObservation = observationRepository.save(observation)
        return returnedObservation.toObservationModel()
    }
    fun updateObservation(
        id: Long, observationCreateModel: ObservationCreateModel,
        observationToken: String,
        force: Boolean
        ) : ObservationModel {
        val observationResponse: Optional<Observation?> = observationRepository.findById(id)
        if (observationResponse.isEmpty) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Observation not found.")
        }
        val observation: Observation = observationResponse.get()
        val now: Instant = Instant.now()
        if (!force) {
            val requestSignature: String = cryptoService.hmac(observationToken)
            if (requestSignature != observation.observationSignature) {
                throw ResponseStatusException(HttpStatus.FORBIDDEN, "Observation signature does not match request signature.")
            }
        }
        observation.updatedTime = now
        observation.location = geoLocationModelToPoint(observationCreateModel.location)
        val images: List<Image> = imageRepository.findAllById(observationCreateModel.imageIds).toList()
        observation.images.clear()
        observation.images.addAll(images)
        val observationPutResponse: Observation = observationRepository.save(observation)
        return observationPutResponse.toObservationModel()
    }

    fun getObservation(id: Long) : ObservationModel {
        val observation : Optional<Observation> = observationRepository.findById(id)
        if (observation.isEmpty) {
            throw NotFoundException(String.format("Observation %s not found", id))
        }
        return observation.get().toObservationModel()
    }

}