package openbuildright.reportmapper.backend.service

import openbuildright.reportmapper.backend.db.jpa.entity.Observation
import openbuildright.reportmapper.backend.db.jpa.repository.ObservationRepository
import openbuildright.reportmapper.backend.model.GeoLocationModel
import openbuildright.reportmapper.backend.model.ObservationModel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ObservationService(
    @Autowired
    val observationRepository: ObservationRepository
){

    fun createObservation(observationModel: ObservationModel) : ObservationModel {
        val observation : Observation = Observation(
            observationTime = observationModel.observationTime,
            createdTime = observationModel.createdTime,
            updatedTime = observationModel.updatedTime,
            latitude = observationModel.location.latitude,
            longitude = observationModel.location.longitude
        )
        val returnedObservation = observationRepository.save(observation)
        return ObservationModel(
            id = returnedObservation.id,
            observationTime = returnedObservation.observationTime,
            createdTime = returnedObservation.createdTime,
            updatedTime = returnedObservation.updatedTime,
            location = GeoLocationModel(returnedObservation.latitude, returnedObservation.longitude),
            imageIds = listOf(),
            properties = mapOf()
        )
    }


}