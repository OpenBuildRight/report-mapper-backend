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
    val id: String,
    val observationTime: Instant,
    val createdTime: Instant,
    val updatedTime: Instant,
    val location: GeoLocationModel,
    val properties: Map<String, String>,
    val enabled: Boolean,
    val imageIds: Set<String>,
    val reporterId: String,
    val description: String,
    val title: String
) {}

data class ImageMetadataCreateModel(
    val imageGeneratedTime: Instant?,
    val location: GeoLocationModel?,
    val description: String?,
    val reporterId: String
)

data class ImageMetadataModel(
    val id: String,
    val key: String,
    val createdTime: Instant,
    val updatedTime: Instant,
    val imageGeneratedTime: Instant?,
    val location: GeoLocationModel?,
    val description: String?,
    val reporterId: String
)



data class ImageModel(val image: ByteArray, val metadata: ImageMetadataModel) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ImageModel

        if (!image.contentEquals(other.image)) return false
        if (metadata != other.metadata) return false

        return true
    }

    override fun hashCode(): Int {
        var result = image.contentHashCode()
        result = 31 * result + metadata.hashCode()
        return result
    }
}
