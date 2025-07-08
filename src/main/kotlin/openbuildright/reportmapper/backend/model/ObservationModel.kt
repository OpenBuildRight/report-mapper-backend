package openbuildright.reportmapper.backend.model

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
    val imageIds: List<Long>,
    val properties: Map<String, String>,
    val enabled: Boolean,
    val observationSignature: String
) {
}