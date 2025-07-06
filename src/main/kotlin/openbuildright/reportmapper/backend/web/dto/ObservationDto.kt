package openbuildright.reportmapper.backend.web.dto

import openbuildright.reportmapper.backend.db.jpa.entity.Observation
import openbuildright.reportmapper.backend.model.ObservationModel
import java.time.Instant

data class GeoLocationDto(
    val latitude: Float,
    val longitude: Float
)

data class ObservationCreateDto(
    val observationTime: Instant,
    val createdTime: Instant,
    val updatedTime: Instant,
    val location: GeoLocationDto,
    val imageIds: List<Long>,
    val properties: Map<String, String>
    )

data class ObservationDto(
    val id: Long,
    val observationTime: Instant,
    val createdTime: Instant,
    val updatedTime: Instant,
    val location: GeoLocationDto,
    val imageIds: List<Long>,
    val properties: Map<String, String>
)
