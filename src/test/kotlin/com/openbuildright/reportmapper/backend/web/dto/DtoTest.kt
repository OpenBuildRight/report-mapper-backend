package com.openbuildright.reportmapper.backend.web.dto

import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.model.ObservationModel
import org.junit.jupiter.api.Test
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertNull

class DtoTest {

    @Test
    fun geoLocationDtoToGeoLocationModelShouldConvertCorrectly() {
        // Given
        val latitude = 40.7128
        val longitude = -74.0060
        val dto = GeoLocationDto(latitude = latitude, longitude = longitude)

        // When
        val result = dto.toGeoLocationModel()

        // Then
        assertEquals(latitude, result.latitude)
        assertEquals(longitude, result.longitude)
    }

    @Test
    fun geoLocationDtoFromGeoLocationModelShouldConvertCorrectly() {
        // Given
        val latitude = 50.0
        val longitude = -100.0
        val model = GeoLocationModel(latitude = latitude, longitude = longitude)

        // When
        val result = GeoLocationDto.fromGeoLocationModel(model)

        // Then
        assertEquals(latitude, result.latitude)
        assertEquals(longitude, result.longitude)
    }

    @Test
    fun imageDtoFromImageModelShouldConvertCorrectlyWithAllFields() {
        // Given
        val id = "test-image-id"
        val createdTime = Instant.now()
        val imageGeneratedTime = Instant.now().minusSeconds(3600)
        val location = GeoLocationModel(latitude = 40.7128, longitude = -74.0060)
        val description = "Test image description"

        val model = ImageMetadataModel(
            id = id,
            key = "test-key",
            thumbnailKey = "test-thumbnail-key",
            createdTime = createdTime,
            updatedTime = Instant.now(),
            imageGeneratedTime = imageGeneratedTime,
            location = location,
            description = description
        )

        // When
        val result = ImageDto.fromImageModel(model)

        // Then
        assertEquals(id, result.id)
        assertEquals(createdTime, result.createdTime)
        assertEquals(imageGeneratedTime, result.imageGeneratedTime)
        assertEquals(location.latitude, result.location?.latitude)
        assertEquals(location.longitude, result.location?.longitude)
        assertEquals(description, result.description)
    }

    @Test
    fun imageDtoFromImageModelShouldHandleNullFields() {
        // Given
        val id = "test-image-id"
        val createdTime = Instant.now()

        val model = ImageMetadataModel(
            id = id,
            key = "test-key",
            thumbnailKey = "test-thumbnail-key",
            createdTime = createdTime,
            updatedTime = Instant.now(),
            imageGeneratedTime = null,
            location = null,
            description = null
        )

        // When
        val result = ImageDto.fromImageModel(model)

        // Then
        assertEquals(id, result.id)
        assertEquals(createdTime, result.createdTime)
        assertNull(result.imageGeneratedTime)
        assertNull(result.location)
        assertNull(result.description)
    }

    @Test
    fun observationDtoFromObservationModelShouldConvertCorrectly() {
        // Given
        val id = "test-observation-id"
        val observationTime = Instant.now()
        val createdTime = Instant.now()
        val updatedTime = Instant.now()
        val location = GeoLocationModel(latitude = 40.7128, longitude = -74.0060)
        val imageIds = setOf("image1", "image2")
        val properties = mapOf("key1" to "value1", "key2" to "value2")
        val enabled = true
        val description = "Test observation description"
        val title = "Test Observation"

        val model = ObservationModel(
            id = id,
            observationTime = observationTime,
            createdTime = createdTime,
            updatedTime = updatedTime,
            location = location,
            properties = properties,
            enabled = enabled,
            imageIds = imageIds,
            reporterId = "reporter123",
            description = description,
            title = title
        )

        // When
        val result = ObservationDto.fromObservationModel(model)

        // Then
        assertEquals(id, result.id)
        assertEquals(observationTime, result.observationTime)
        assertEquals(createdTime, result.createdTime)
        assertEquals(updatedTime, result.updatedTime)
        assertEquals(location.latitude, result.location.latitude)
        assertEquals(location.longitude, result.location.longitude)
        assertEquals(imageIds, result.imageIds)
        assertEquals(properties, result.properties)
        assertEquals(enabled, result.enabled)
        assertEquals(description, result.description)
        assertEquals(title, result.title)
    }

    @Test
    fun observationDtoFromObservationModelShouldHandleEmptyCollections() {
        // Given
        val id = "test-observation-id"
        val observationTime = Instant.now()
        val createdTime = Instant.now()
        val updatedTime = Instant.now()
        val location = GeoLocationModel(latitude = 40.7128, longitude = -74.0060)
        val imageIds = emptySet<String>()
        val properties = emptyMap<String, String>()
        val enabled = false
        val description = "Test observation description"
        val title = "Test Observation"

        val model = ObservationModel(
            id = id,
            observationTime = observationTime,
            createdTime = createdTime,
            updatedTime = updatedTime,
            location = location,
            properties = properties,
            enabled = enabled,
            imageIds = imageIds,
            reporterId = "reporter123",
            description = description,
            title = title
        )

        // When
        val result = ObservationDto.fromObservationModel(model)

        // Then
        assertEquals(id, result.id)
        assertEquals(observationTime, result.observationTime)
        assertEquals(createdTime, result.createdTime)
        assertEquals(updatedTime, result.updatedTime)
        assertEquals(location.latitude, result.location.latitude)
        assertEquals(location.longitude, result.location.longitude)
        assertEquals(imageIds, result.imageIds)
        assertEquals(properties, result.properties)
        assertEquals(enabled, result.enabled)
        assertEquals(description, result.description)
        assertEquals(title, result.title)
    }

    @Test
    fun geoLocationDtoShouldHandleNegativeCoordinates() {
        // Given
        val latitude = -33.8688
        val longitude = 151.2093
        val dto = GeoLocationDto(latitude = latitude, longitude = longitude)

        // When
        val result = dto.toGeoLocationModel()

        // Then
        assertEquals(latitude, result.latitude)
        assertEquals(longitude, result.longitude)
    }

    @Test
    fun geoLocationDtoShouldHandleZeroCoordinates() {
        // Given
        val latitude = 0.0
        val longitude = 0.0
        val dto = GeoLocationDto(latitude = latitude, longitude = longitude)

        // When
        val result = dto.toGeoLocationModel()

        // Then
        assertEquals(latitude, result.latitude)
        assertEquals(longitude, result.longitude)
    }

    @Test
    fun imageDtoFromImageModelShouldHandleExtremeCoordinates() {
        // Given
        val id = "test-image-id"
        val createdTime = Instant.now()
        val location = GeoLocationModel(latitude = 90.0, longitude = 180.0) // North Pole
        val description = "North Pole image"

        val model = ImageMetadataModel(
            id = id,
            key = "test-key",
            thumbnailKey = "test-thumbnail-key",
            createdTime = createdTime,
            updatedTime = Instant.now(),
            imageGeneratedTime = null,
            location = location,
            description = description
        )

        // When
        val result = ImageDto.fromImageModel(model)

        // Then
        assertEquals(id, result.id)
        assertEquals(createdTime, result.createdTime)
        assertEquals(location.latitude, result.location?.latitude)
        assertEquals(location.longitude, result.location?.longitude)
        assertEquals(description, result.description)
    }
}
