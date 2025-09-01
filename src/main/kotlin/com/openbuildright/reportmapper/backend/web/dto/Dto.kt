package com.openbuildright.reportmapper.backend.web.dto

import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.model.ObservationModel
import com.openbuildright.reportmapper.backend.security.ControllableObject
import com.openbuildright.reportmapper.backend.security.ObjectType
import org.springframework.web.multipart.MultipartFile
import java.time.Instant

data class GeoLocationDto(
    val latitude: Double,
    val longitude: Double
) {
    fun toGeoLocationModel(): GeoLocationModel {
        return GeoLocationModel(
            latitude = latitude,
            longitude = longitude
        )
    }

    companion object {
        fun fromGeoLocationModel(value: GeoLocationModel): GeoLocationDto {
            return GeoLocationDto(
                latitude = value.latitude,
                longitude = value.longitude
            )
        }
    }
}

data class ImageDto(
    val id: String,
    val createdTime: Instant,
    val imageGeneratedTime: Instant?,
    val location: GeoLocationDto?,
    val description: String?
) : ControllableObject {
    override val objectType: ObjectType = ObjectType.OBSERVATION
    override fun getTargetId(): String? {
        return id
    }
    companion object {
        fun fromImageModel(value: ImageMetadataModel): ImageDto {
            return ImageDto(
                id = value.id,
                createdTime = value.createdTime,
                imageGeneratedTime = value.imageGeneratedTime,
                location = value.location?.let { GeoLocationDto.fromGeoLocationModel(it) },
                description = value.description
            )
        }
    }
}

data class ObservationCreateDto(
    val observationTime: Instant,
    val location: GeoLocationDto,
    val imageIds: Set<String>,
    val properties: Map<String, String>,
    val description: String,
    val title: String
 ) : ControllableObject{
    override val objectType: ObjectType = ObjectType.OBSERVATION
    override fun getTargetId(): String? {
        return null
    }
}

data class ObservationDto(
    val id: String,
    val observationTime: Instant,
    val createdTime: Instant,
    val updatedTime: Instant,
    val location: GeoLocationDto,
    val imageIds: Set<String>,
    val properties: Map<String, String>,
    val enabled: Boolean,
    val description: String,
    val title: String
) : ControllableObject {
    override val objectType: ObjectType = ObjectType.OBSERVATION
    override fun getTargetId(): String? {
        return id
    }
    companion object {
        fun fromObservationModel(observation: ObservationModel): ObservationDto {
            return ObservationDto(
                id = observation.id,
                observationTime = observation.observationTime,
                createdTime = observation.createdTime,
                updatedTime = observation.updatedTime,
                location = GeoLocationDto.fromGeoLocationModel(observation.location),
                properties = observation.properties,
                enabled = observation.enabled,
                imageIds = observation.imageIds,
                description = observation.description,
                title = observation.title,
            )
        }
    }
}


data class ImageCreateDto(
    val file: MultipartFile,
    val latitude: Double?,
    val longitude: Double?,
    val description: String?,
    val imageGeneratedTime: Instant?,
) : ControllableObject {
    override val objectType: ObjectType = ObjectType.IMAGE
    override fun getTargetId(): String? {
        return null
    }
}