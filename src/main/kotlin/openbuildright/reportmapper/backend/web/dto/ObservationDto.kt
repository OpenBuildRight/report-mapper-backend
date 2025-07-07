package openbuildright.reportmapper.backend.web.dto

import openbuildright.reportmapper.backend.service.model.GeoLocationModel
import openbuildright.reportmapper.backend.service.model.ObservationModel
import java.time.Instant

data class GeoLocationDto(
    val latitude: Double,
    val longitude: Double
)

data class ObservationCreateDto(
    val observationTime: Instant,
    val location: GeoLocationDto,
    val imageIds: List<Long>,
    val properties: Map<String, String>
    )

data class ObservationDto(
    val id: Long,
    val observationTime: Instant,
    val createdTime: Instant,
    val updatedTime: Instant,
    val location: GeoLocationDto,
    val imageIds: List<Long>,
    val properties: Map<String, String>,
    val enabled: Boolean,
    val observationSignature: String
) {
    fun toObservationModel() : ObservationModel {
        return ObservationModel(
            id = id,
            observationTime = observationTime,
            createdTime = createdTime,
            updatedTime = updatedTime,
            location = GeoLocationModel(
                latitude = location.latitude,
                longitude = location.longitude
            ),
            imageIds = imageIds,
            properties = properties,
            enabled = enabled,
            observationSignature = observationSignature
        )
    }
    companion object {
        fun fromObservationModel(observation: ObservationModel) : ObservationDto {
            return ObservationDto(
                id = observation.id!!,
                observationTime = observation.observationTime,
                createdTime = observation.createdTime,
                updatedTime =  observation.updatedTime,
                location=GeoLocationDto(
                    latitude = observation.location.latitude,
                    longitude = observation.location.longitude
                ),
                imageIds = observation.imageIds,
                properties = observation.properties,
                enabled = observation.enabled,
                observationSignature = observation.observationSignature
            )
        }

    }
}


