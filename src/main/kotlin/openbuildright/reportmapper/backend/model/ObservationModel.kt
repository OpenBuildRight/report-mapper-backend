package openbuildright.reportmapper.backend.model

import org.springframework.data.geo.Point
import java.time.Instant

data class GeoLocationModel(
    val latitude: Double,
    val longitude: Double
)

data class ObservationCreateModel(
    val observationTime: Instant,
    val location: GeoLocationModel,
    val imageIds: List<Long>,
    val properties: Map<String, String>
)

data class ObservationModel(
    val id: Long?,
    val observationTime: Instant,
    val createdTime: Instant,
    val updatedTime: Instant,
    val location: GeoLocationModel,
    val images: List<ImageModel>,
    val properties: Map<String, String>,
    val enabled: Boolean,
    val observationSignature: String
)

data class ImageModel(
    val id: Long? = null,
    val key: String,
    val createdTime: Instant,
    val location: GeoLocationModel?
)