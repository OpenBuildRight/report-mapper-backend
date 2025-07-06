package openbuildright.reportmapper.backend.model

import java.time.Instant

data class GeoLocationModel(
    val latitude: Float,
    val longitude: Float
)

data class ObservationModel(
    val id: Long?,
    val observationTime: Instant,
    val createdTime: Instant,
    val updatedTime: Instant,
    val location: GeoLocationModel,
    val imageIds: List<Long>,
    val properties: Map<String, String>
) {
}