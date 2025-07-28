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
    val images: List<ImageMetadataModel>,
    val properties: Map<String, String>,
    val enabled: Boolean,
    val observationSignature: String
) {

}

data class ImageMetadataModel(
    val id: Long? = null,
    val key: String,
    val createdTime: Instant,
    val location: GeoLocationModel?,
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
