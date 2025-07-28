package openbuildright.reportmapper.backend.web.dto

import openbuildright.reportmapper.backend.model.GeoLocationModel
import openbuildright.reportmapper.backend.model.ImageMetadataModel
import openbuildright.reportmapper.backend.model.ObservationModel
import java.time.Instant

data class GeoLocationDto(
    val latitude: Double,
    val longitude: Double
) {
    fun toGeoLocationModel() : GeoLocationModel {
        return GeoLocationModel(
            latitude = latitude,
            longitude = longitude
        )
    }

    companion object {
        fun fromGeoLocationModel(value: GeoLocationModel) : GeoLocationDto {
            return GeoLocationDto(
                latitude = value.latitude,
                longitude = value.longitude
            )
        }
    }
}

data class ImageDto(
    val id: Long,
    val key: String,
    val createdTime: Instant,
    val location: GeoLocationDto?
) {
    fun toImageModel() : ImageMetadataModel {
        return ImageMetadataModel(
            id = id,
            key = key,
            createdTime = createdTime,
            location = location?.toGeoLocationModel()
        )
    }

    companion object {
        fun fromImageModel(value: ImageMetadataModel) : ImageDto {
            return ImageDto(
                id = value.id!!,
                key = value.key,
                createdTime = value.createdTime,
                location = value.location?.let { GeoLocationDto.fromGeoLocationModel(it) }
            )
        }
    }
}

data class ObservationCreateDto(
    val observationTime: Instant,
    val location: GeoLocationDto,
    val imageIds: List<Long> = ArrayList(),
    val properties: Map<String, String>
    )

data class ObservationDto(
    val id: Long,
    val observationTime: Instant,
    val createdTime: Instant,
    val updatedTime: Instant,
    val location: GeoLocationDto,
    val images: List<ImageDto> = ArrayList(),
    val properties: Map<String, String> = HashMap(),
    val enabled: Boolean,
    val observationSignature: String
) {
    fun toObservationModel() : ObservationModel {
        return ObservationModel(
            id = id,
            observationTime = observationTime,
            createdTime = createdTime,
            updatedTime = updatedTime,
            location = location.toGeoLocationModel(),
            images = images.stream().map { it.toImageModel() }.toList(),
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
                location=GeoLocationDto.fromGeoLocationModel(observation.location),
                images = observation.images.asSequence().map { ImageDto.fromImageModel(it) }.toList(),
                properties = observation.properties,
                enabled = observation.enabled,
                observationSignature = observation.observationSignature
            )
        }

    }
}


