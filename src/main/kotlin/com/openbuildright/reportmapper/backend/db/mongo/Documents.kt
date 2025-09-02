package com.openbuildright.reportmapper.backend.db.mongo

import geoLocationModelToPoint
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.model.ObservationModel
import org.springframework.data.annotation.Id
import org.springframework.data.geo.Point
import org.springframework.data.mongodb.core.mapping.Document
import pointToGeoLocationModel
import java.time.Instant

@Document("Observation")
class ObservationDocument(
    @Id
    val id: String,
    var observationTime: Instant,
    val createdTime: Instant,
    var updatedTime: Instant,
    var location: Point,
    var published: Boolean,
    var imageIds: Set<String>,
    val reporterId: String,
    var properties: Map<String, String>,
    var description: String,
    var title: String
) {
    fun toObservationModel(): ObservationModel {
        return ObservationModel(
            id = id,
            observationTime = observationTime,
            createdTime = createdTime,
            updatedTime = updatedTime,
            location = pointToGeoLocationModel(location),
            published = published,
            imageIds = imageIds,
            reporterId = reporterId,
            properties = properties,
            description = description,
            title = title
        )
    }

    companion object {
        fun fromObservationModel(model: ObservationModel): ObservationDocument {
            return ObservationDocument(
                id = model.id,
                observationTime = model.observationTime,
                createdTime = model.createdTime,
                location = geoLocationModelToPoint(model.location),
                updatedTime = model.updatedTime,
                published = model.published,
                imageIds = model.imageIds,
                reporterId = model.reporterId,
                properties = model.properties,
                description = model.description,
                title = model.title,
            )
        }

    }
}

@Document("Image")
class ImageMetadataDocument(
    @Id
    val id: String,
    val key: String,
    val thumbnailKey: String,
    var location: Point?,
    var description: String?,
    val createdTime: Instant,
    var updatedTime: Instant,
    var imageGeneratedTime: Instant?,
) {
    fun toImageMetadataModel(): ImageMetadataModel {
        val _location = location
        return ImageMetadataModel(
            id = id,
            key = key,
            thumbnailKey = thumbnailKey,
            location = _location?.let { pointToGeoLocationModel(_location) },
            description = description,
            createdTime = createdTime,
            updatedTime = updatedTime,
            imageGeneratedTime = imageGeneratedTime,
        )
    }

    companion object {
        fun fromImageMetadataModel(value: ImageMetadataModel): ImageMetadataDocument {
            return ImageMetadataDocument(
                id = value.id,
                key = value.key,
                thumbnailKey = value.thumbnailKey,
                location = value.location?.let { geoLocationModelToPoint(value.location) },
                description = value.description,
                createdTime = value.createdTime,
                updatedTime = value.updatedTime,
                imageGeneratedTime = value.imageGeneratedTime
            )
        }
    }
}