package openbuildright.reportmapper.backend.db.jpa.entity

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn
import jakarta.persistence.OneToMany
import openbuildright.reportmapper.backend.model.GeoLocationModel
import openbuildright.reportmapper.backend.model.ObservationModel
import org.springframework.data.geo.Point
import java.time.Instant

@Entity
class Observation(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    var observationTime: Instant,
    val createdTime: Instant,
    var updatedTime: Instant,
    var location: Point,
    var enabled: Boolean,
    val observationSignature: String,

    @OneToMany(mappedBy = "observation")
    @JoinColumn(referencedColumnName = "id")
    val images: List<Image>
    ) {
    fun toObservationModel() : ObservationModel {
        return ObservationModel(
            id = id,
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
                id = value.id,
                observationTime = value.observationTime,
                createdTime = value.createdTime,
                updatedTime = value.updatedTime,
                location = geoLocationModelToPoint(value.location),
                images = value.images.asSequence().map { Image.fromImageModel(it) }.toList(),
                observationSignature = value.observationSignature,
                enabled = value.enabled
            )
        }
    }
}


fun pointToGeoLocationModel(value: Point) : GeoLocationModel {
    return GeoLocationModel(latitude = value.x, longitude = value.y)
}

fun geoLocationModelToPoint(value: GeoLocationModel) : Point {
    return Point(value.latitude,  value.longitude)
}