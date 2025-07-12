package openbuildright.reportmapper.backend.db.jpa.entity

import geoLocationModelToPoint
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import openbuildright.reportmapper.backend.model.ImageModel
import openbuildright.reportmapper.backend.model.ObservationModel
import org.springframework.data.geo.Point
import pointToGeoLocationModel
import java.time.Instant
import jakarta.persistence.CascadeType

@Entity
class Observation(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val observation_id: Long? = null,
    var observationTime: Instant,
    val createdTime: Instant,
    var updatedTime: Instant,
    var location: Point,
    var enabled: Boolean,
    val observationSignature: String,

    @OneToMany(mappedBy = "observation", cascade = arrayOf(CascadeType.REFRESH ))
    val images: MutableList<Image>
    ) {
    fun toObservationModel() : ObservationModel {
        return ObservationModel(
            id = observation_id,
            observationTime = observationTime,
            createdTime = createdTime,
            updatedTime = updatedTime,
            location = pointToGeoLocationModel(location),
            images = images.asSequence().map { it.toImageModel() }.toList(),
            observationSignature = observationSignature,
            properties = mapOf(),
            enabled = enabled

        )
    }

    companion object {
        fun fromObservationModel(value: ObservationModel) : Observation {
            return Observation(
                observation_id = value.id,
                observationTime = value.observationTime,
                createdTime = value.createdTime,
                updatedTime = value.updatedTime,
                location = geoLocationModelToPoint(value.location),
                images = value.images.asSequence().map { Image.fromImageModel(it) }.toMutableList(),
                observationSignature = value.observationSignature,
                enabled = value.enabled
            )
        }
    }
}



@Entity
class Image(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val imageId: Long? = null,

    @ManyToOne
    @JoinColumn(name = "observation_id", nullable = true)
    val observation: Observation? = null,
    val objectKey: String,
    val createdTime: Instant,
    val location: Point?
) {
    fun toImageModel() : ImageModel {
        return ImageModel(
            id = imageId,
            key = objectKey,
            createdTime = createdTime,
            location = location?.let { pointToGeoLocationModel(it ) }
        )
    }

    companion object {
        fun fromImageModel(value: ImageModel) : Image{
            return Image(
                imageId = value.id,
                objectKey = value.key,
                createdTime = value.createdTime,
                location = value.location?.let { geoLocationModelToPoint(it) },
                observation = null
            )
        }
    }

}
