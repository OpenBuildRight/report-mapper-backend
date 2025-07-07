package openbuildright.reportmapper.backend.service

import openbuildright.reportmapper.backend.db.jpa.entity.Observation
import openbuildright.reportmapper.backend.db.jpa.repository.ObservationRepository
import openbuildright.reportmapper.backend.service.model.GeoLocationModel
import openbuildright.reportmapper.backend.service.model.ObservationCreateModel
import openbuildright.reportmapper.backend.service.model.ObservationModel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.geo.Point
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.Optional

@Service
class ObservationService(
    @Autowired
    val observationRepository: ObservationRepository,

    @Autowired
    val cryptoService: CryptoService
){

    fun createObservation(observationModel: ObservationCreateModel, observationToken: String) : ObservationModel {
        val now: Instant = Instant.now()

        val observation = Observation(
            observationTime = observationModel.observationTime,
            createdTime = now,
            updatedTime = now,
            location = Point(
                observationModel.location.latitude,
                observationModel.location.longitude
            ),
            observationSignature = cryptoService.hmac(observationToken),
            enabled = true,
            images = listOf()
        )
        val returnedObservation = observationRepository.save(observation)
        return ObservationModel(
            id = returnedObservation.id,
            observationTime = returnedObservation.observationTime,
            createdTime = returnedObservation.createdTime,
            updatedTime = returnedObservation.updatedTime,
            location = GeoLocationModel(
                returnedObservation.location.x, returnedObservation.location.y,
            ),
            imageIds = listOf(),
            properties = mapOf(),
            enabled = returnedObservation.enabled,
            observationSignature = returnedObservation.observationSignature
        )
    }
    fun updateObservation(
        id: Long, observationCreateModel: ObservationCreateModel,
        observationToken: String,
        force: Boolean
        ) : ObservationModel {
        val observationResponse: Optional<Observation?> = observationRepository.findById(id)
        if (observationResponse.isEmpty()) {
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
        observation.location = Point(observationCreateModel.location.latitude, observationCreateModel.location.longitude)
        val observationPutResponse: Observation = observationRepository.save(observation)
        return ObservationModel(
            observation.id,
            observation.observationTime,
            observation.createdTime,
            observation.updatedTime,
            GeoLocationModel(observation.location.x, observation.location.y),
            imageIds = listOf(),
            properties = mapOf(),
            enabled = observation.enabled,
            observationSignature = observation.observationSignature
        )
    }

}