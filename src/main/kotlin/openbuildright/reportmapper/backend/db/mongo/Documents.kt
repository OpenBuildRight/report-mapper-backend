package openbuildright.reportmapper.backend.db.mongo

import openbuildright.reportmapper.backend.model.ObservationModel
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.annotation.Id;
import org.springframework.data.geo.Point
import pointToGeoLocationModel
import geoLocationModelToPoint
import openbuildright.reportmapper.backend.model.ImageMetadataModel
import java.time.Instant

@Document("Observation")
class ObservationDocument(
    @Id
    val id: String,
    var observationTime: Instant,
    val createdTime: Instant,
    var updatedTime: Instant,
    var location: Point,
    var enabled: Boolean,
    var imageIds: Set<String>,
    val reporterId: String,
    var properties: Map<String, String>,
    var description: String,
    var title: String
) {
    fun toObservationModel() : ObservationModel {
        return ObservationModel(
            id=id,
            observationTime=observationTime,
            createdTime=createdTime,
            updatedTime=updatedTime,
            location=pointToGeoLocationModel(location),
            enabled=enabled,
            imageIds=imageIds,
            reporterId=reporterId,
            properties=properties,
            description=description,
            title=title
        )
    }
    companion object {
        fun fromObservationModel(model: ObservationModel) : ObservationDocument {
            return ObservationDocument(
                id = model.id,
                observationTime = model.observationTime,
                createdTime = model.createdTime,
                location = geoLocationModelToPoint(model.location),
                updatedTime = model.updatedTime,
                enabled = model.enabled,
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
    var location: Point?,
    var description: String?,
    val createdTime: Instant,
    var updatedTime: Instant,
    var imageGeneratedTime: Instant?,
    val reporterId: String,
) {
    fun toImageMetadataModel() : ImageMetadataModel {
        return ImageMetadataModel(
            id = id,
            key = key,
            location = location?.let { pointToGeoLocationModel(location) },
            description = description,
            createdTime = createdTime,
            updatedTime = updatedTime,
            reporterId = reporterId,
            imageGeneratedTime = imageGeneratedTime,
        )
    }

    companion object {
        fun fromImageMetadataModel(value: ImageMetadataModel) : ImageMetadataDocument {
            return ImageMetadataDocument(
                id = value.id,
                key = value.key,
                location = value.location?.let {geoLocationModelToPoint(value.location)},
                description = value.description,
                createdTime = value.createdTime,
                updatedTime = value.updatedTime,
                reporterId = value.reporterId,
                imageGeneratedTime = value.imageGeneratedTime
            )
        }
    }
}