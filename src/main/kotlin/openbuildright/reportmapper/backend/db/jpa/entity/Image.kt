package openbuildright.reportmapper.backend.db.jpa.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import openbuildright.reportmapper.backend.model.ImageModel
import org.springframework.data.geo.Point
import java.time.Instant

@Entity
class Image(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "observation_id", nullable = true)
    val observation: Observation?,
    val key: String,
    val createdTime: Instant,
    val location: Point?
) {
    fun toImageModel() : ImageModel {
        return ImageModel(
            id = id,
            key = key,
            createdTime = createdTime,
            location = location?.let { pointToGeoLocationModel(it ) }
        )
    }

    companion object {
        fun fromImageModel(value: ImageModel) : Image{
            return Image(
                id = value.id,
                key = value.key,
                createdTime = value.createdTime,
                location = value.location?.let { geoLocationModelToPoint(it) },
                observation = null
            )
        }
    }

}