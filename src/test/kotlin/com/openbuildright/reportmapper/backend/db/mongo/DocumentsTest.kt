package com.openbuildright.reportmapper.backend.db.mongo

import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.model.ObservationModel
import org.junit.jupiter.api.Test
import org.springframework.data.geo.Point
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertNull

class DocumentsTest {

    @Test
    fun observationDocumentToObservationModelShouldConvertCorrectly() {
        // Given
        val id = "test-observation-id"
        val observationTime = Instant.now()
        val createdTime = Instant.now()
        val updatedTime = Instant.now()
        val location = Point(40.7128, -74.0060)
        val enabled = true
        val imageIds = setOf("image1", "image2")
        val reporterId = "reporter123"
        val properties = mapOf("key1" to "value1", "key2" to "value2")
        val description = "Test observation description"
        val title = "Test Observation"

        val document = ObservationDocument(
            id = id,
            observationTime = observationTime,
            createdTime = createdTime,
            updatedTime = updatedTime,
            location = location,
            enabled = enabled,
            imageIds = imageIds,
            reporterId = reporterId,
            properties = properties,
            description = description,
            title = title
        )

        // When
        val result = document.toObservationModel()

        // Then
        assertEquals(id, result.id)
        assertEquals(observationTime, result.observationTime)
        assertEquals(createdTime, result.createdTime)
        assertEquals(updatedTime, result.updatedTime)
        assertEquals(location.x, result.location.latitude)
        assertEquals(location.y, result.location.longitude)
        assertEquals(enabled, result.enabled)
        assertEquals(imageIds, result.imageIds)
        assertEquals(reporterId, result.reporterId)
        assertEquals(properties, result.properties)
        assertEquals(description, result.description)
        assertEquals(title, result.title)
    }

    @Test
    fun observationDocumentFromObservationModelShouldConvertCorrectly() {
        // Given
        val id = "test-observation-id"
        val observationTime = Instant.now()
        val createdTime = Instant.now()
        val updatedTime = Instant.now()
        val location = GeoLocationModel(latitude = 40.7128, longitude = -74.0060)
        val enabled = false
        val imageIds = setOf("image1", "image2")
        val reporterId = "reporter123"
        val properties = mapOf("key1" to "value1", "key2" to "value2")
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
            reporterId = reporterId,
            description = description,
            title = title
        )

        // When
        val result = ObservationDocument.fromObservationModel(model)

        // Then
        assertEquals(id, result.id)
        assertEquals(observationTime, result.observationTime)
        assertEquals(createdTime, result.createdTime)
        assertEquals(updatedTime, result.updatedTime)
        assertEquals(location.latitude, result.location.x)
        assertEquals(location.longitude, result.location.y)
        assertEquals(enabled, result.enabled)
        assertEquals(imageIds, result.imageIds)
        assertEquals(reporterId, result.reporterId)
        assertEquals(properties, result.properties)
        assertEquals(description, result.description)
        assertEquals(title, result.title)
    }

    @Test
    fun imageMetadataDocumentToImageMetadataModelShouldConvertCorrectlyWithAllFields() {
        // Given
        val id = "test-image-id"
        val key = "test-key"
        val thumbnailKey = "test-thumbnail-key"
        val location = Point(40.7128, -74.0060)
        val description = "Test image description"
        val createdTime = Instant.now()
        val updatedTime = Instant.now()
        val imageGeneratedTime = Instant.now()

        val document = ImageMetadataDocument(
            id = id,
            key = key,
            thumbnailKey = thumbnailKey,
            location = location,
            description = description,
            createdTime = createdTime,
            updatedTime = updatedTime,
            imageGeneratedTime = imageGeneratedTime
        )

        // When
        val result = document.toImageMetadataModel()

        // Then
        assertEquals(id, result.id)
        assertEquals(key, result.key)
        assertEquals(thumbnailKey, result.thumbnailKey)
        assertEquals(location.x, result.location?.latitude)
        assertEquals(location.y, result.location?.longitude)
        assertEquals(description, result.description)
        assertEquals(createdTime, result.createdTime)
        assertEquals(updatedTime, result.updatedTime)
        assertEquals(imageGeneratedTime, result.imageGeneratedTime)
    }

    @Test
    fun imageMetadataDocumentToImageMetadataModelShouldHandleNullFields() {
        // Given
        val id = "test-image-id"
        val key = "test-key"
        val thumbnailKey = "test-thumbnail-key"
        val createdTime = Instant.now()
        val updatedTime = Instant.now()

        val document = ImageMetadataDocument(
            id = id,
            key = key,
            thumbnailKey = thumbnailKey,
            location = null,
            description = null,
            createdTime = createdTime,
            updatedTime = updatedTime,
            imageGeneratedTime = null
        )

        // When
        val result = document.toImageMetadataModel()

        // Then
        assertEquals(id, result.id)
        assertEquals(key, result.key)
        assertEquals(thumbnailKey, result.thumbnailKey)
        assertNull(result.location)
        assertNull(result.description)
        assertEquals(createdTime, result.createdTime)
        assertEquals(updatedTime, result.updatedTime)
        assertNull(result.imageGeneratedTime)
    }

    @Test
    fun imageMetadataDocumentFromImageMetadataModelShouldConvertCorrectlyWithAllFields() {
        // Given
        val id = "test-image-id"
        val key = "test-key"
        val thumbnailKey = "test-thumbnail-key"
        val location = GeoLocationModel(latitude = 40.7128, longitude = -74.0060)
        val description = "Test image description"
        val createdTime = Instant.now()
        val updatedTime = Instant.now()
        val imageGeneratedTime = Instant.now()

        val model = ImageMetadataModel(
            id = id,
            key = key,
            thumbnailKey = thumbnailKey,
            location = location,
            description = description,
            createdTime = createdTime,
            updatedTime = updatedTime,
            imageGeneratedTime = imageGeneratedTime
        )

        // When
        val result = ImageMetadataDocument.fromImageMetadataModel(model)

        // Then
        assertEquals(id, result.id)
        assertEquals(key, result.key)
        assertEquals(thumbnailKey, result.thumbnailKey)
        assertEquals(location.latitude, result.location?.x)
        assertEquals(location.longitude, result.location?.y)
        assertEquals(description, result.description)
        assertEquals(createdTime, result.createdTime)
        assertEquals(updatedTime, result.updatedTime)
        assertEquals(imageGeneratedTime, result.imageGeneratedTime)
    }

    @Test
    fun imageMetadataDocumentFromImageMetadataModelShouldHandleNullFields() {
        // Given
        val id = "test-image-id"
        val key = "test-key"
        val thumbnailKey = "test-thumbnail-key"
        val createdTime = Instant.now()
        val updatedTime = Instant.now()

        val model = ImageMetadataModel(
            id = id,
            key = key,
            thumbnailKey = thumbnailKey,
            location = null,
            description = null,
            createdTime = createdTime,
            updatedTime = updatedTime,
            imageGeneratedTime = null
        )

        // When
        val result = ImageMetadataDocument.fromImageMetadataModel(model)

        // Then
        assertEquals(id, result.id)
        assertEquals(key, result.key)
        assertEquals(thumbnailKey, result.thumbnailKey)
        assertNull(result.location)
        assertNull(result.description)
        assertEquals(createdTime, result.createdTime)
        assertEquals(updatedTime, result.updatedTime)
        assertNull(result.imageGeneratedTime)
    }

    @Test
    fun observationDocumentRoundTripConversionShouldPreserveValues() {
        // Given
        val originalModel = ObservationModel(
            id = "test-id",
            observationTime = Instant.now(),
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            location = GeoLocationModel(latitude = 40.7128, longitude = -74.0060),
            properties = mapOf("key1" to "value1"),
            enabled = true,
            imageIds = setOf("image1"),
            reporterId = "reporter123",
            description = "Test description",
            title = "Test title"
        )

        // When
        val document = ObservationDocument.fromObservationModel(originalModel)
        val convertedBack = document.toObservationModel()

        // Then
        assertEquals(originalModel.id, convertedBack.id)
        assertEquals(originalModel.observationTime, convertedBack.observationTime)
        assertEquals(originalModel.createdTime, convertedBack.createdTime)
        assertEquals(originalModel.updatedTime, convertedBack.updatedTime)
        assertEquals(originalModel.location.latitude, convertedBack.location.latitude)
        assertEquals(originalModel.location.longitude, convertedBack.location.longitude)
        assertEquals(originalModel.enabled, convertedBack.enabled)
        assertEquals(originalModel.imageIds, convertedBack.imageIds)
        assertEquals(originalModel.reporterId, convertedBack.reporterId)
        assertEquals(originalModel.properties, convertedBack.properties)
        assertEquals(originalModel.description, convertedBack.description)
        assertEquals(originalModel.title, convertedBack.title)
    }

    @Test
    fun imageMetadataDocumentRoundTripConversionShouldPreserveValues() {
        // Given
        val originalModel = ImageMetadataModel(
            id = "test-id",
            key = "test-key",
            thumbnailKey = "test-thumbnail-key",
            location = GeoLocationModel(latitude = 40.7128, longitude = -74.0060),
            description = "Test description",
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            imageGeneratedTime = Instant.now()
        )

        // When
        val document = ImageMetadataDocument.fromImageMetadataModel(originalModel)
        val convertedBack = document.toImageMetadataModel()

        // Then
        assertEquals(originalModel.id, convertedBack.id)
        assertEquals(originalModel.key, convertedBack.key)
        assertEquals(originalModel.thumbnailKey, convertedBack.thumbnailKey)
        assertEquals(originalModel.location?.latitude, convertedBack.location?.latitude)
        assertEquals(originalModel.location?.longitude, convertedBack.location?.longitude)
        assertEquals(originalModel.description, convertedBack.description)
        assertEquals(originalModel.createdTime, convertedBack.createdTime)
        assertEquals(originalModel.updatedTime, convertedBack.updatedTime)
        assertEquals(originalModel.imageGeneratedTime, convertedBack.imageGeneratedTime)
    }
}
