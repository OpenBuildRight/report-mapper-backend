package com.openbuildright.reportmapper.backend.web.controller

import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ObservationCreateModel
import com.openbuildright.reportmapper.backend.model.ObservationModel
import com.openbuildright.reportmapper.backend.service.ObservationService
import com.openbuildright.reportmapper.backend.web.dto.GeoLocationDto
import com.openbuildright.reportmapper.backend.web.dto.ObservationCreateDto
import com.openbuildright.reportmapper.backend.web.dto.ObservationDto
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class ObservationControllerTest {

    private lateinit var observationService: ObservationService
    private lateinit var observationController: ObservationController

    @BeforeEach
    fun setUp() {
        observationService = mock()
        observationController = ObservationController(observationService)
    }

    @Test
    fun `createObservation should create observation with valid data`() {
        // Given
        val observationTime = Instant.now()
        val location = GeoLocationDto(latitude = 40.7128, longitude = -74.0060)
        val imageIds = setOf("image1", "image2")
        val properties = mapOf("key1" to "value1", "key2" to "value2")
        val description = "Test observation description"
        val title = "Test Observation"

        val dto = ObservationCreateDto(
            observationTime = observationTime,
            location = location,
            imageIds = imageIds,
            properties = properties,
            description = description,
            title = title
        )

        val expectedObservationModel = ObservationModel(
            id = "test-observation-id",
            observationTime = observationTime,
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            location = GeoLocationModel(location.latitude, location.longitude),
            imageIds = imageIds,
            properties = properties,
            enabled = true,
            description = description,
            title = title
        )

        whenever(observationService.createObservation(any())).thenReturn(expectedObservationModel)

        // When
        val result = observationController.createObservation(dto)

        // Then
        assertNotNull(result)
        assertEquals("test-observation-id", result.id)
        assertEquals(description, result.description)
        assertEquals(title, result.title)
        assertEquals(imageIds, result.imageIds)
        assertEquals(properties, result.properties)
        verify(observationService).createObservation(any())
    }

    @Test
    fun `createObservation should handle empty image ids`() {
        // Given
        val observationTime = Instant.now()
        val location = GeoLocationDto(latitude = 40.7128, longitude = -74.0060)
        val imageIds = emptySet<String>()
        val properties = mapOf("key1" to "value1")
        val description = "Test observation description"
        val title = "Test Observation"

        val dto = ObservationCreateDto(
            observationTime = observationTime,
            location = location,
            imageIds = imageIds,
            properties = properties,
            description = description,
            title = title
        )

        val expectedObservationModel = ObservationModel(
            id = "test-observation-id",
            observationTime = observationTime,
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            location = GeoLocationModel(location.latitude, location.longitude),
            imageIds = imageIds,
            properties = properties,
            enabled = true,
            description = description,
            title = title
        )

        whenever(observationService.createObservation(any())).thenReturn(expectedObservationModel)

        // When
        val result = observationController.createObservation(dto)

        // Then
        assertNotNull(result)
        assertEquals("test-observation-id", result.id)
        assertEquals(emptySet<String>(), result.imageIds)
        verify(observationService).createObservation(any())
    }

    @Test
    fun `createObservation should handle empty properties`() {
        // Given
        val observationTime = Instant.now()
        val location = GeoLocationDto(latitude = 40.7128, longitude = -74.0060)
        val imageIds = setOf("image1")
        val properties = emptyMap<String, String>()
        val description = "Test observation description"
        val title = "Test Observation"

        val dto = ObservationCreateDto(
            observationTime = observationTime,
            location = location,
            imageIds = imageIds,
            properties = properties,
            description = description,
            title = title
        )

        val expectedObservationModel = ObservationModel(
            id = "test-observation-id",
            observationTime = observationTime,
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            location = GeoLocationModel(location.latitude, location.longitude),
            imageIds = imageIds,
            properties = properties,
            enabled = true,
            description = description,
            title = title
        )

        whenever(observationService.createObservation(any())).thenReturn(expectedObservationModel)

        // When
        val result = observationController.createObservation(dto)

        // Then
        assertNotNull(result)
        assertEquals("test-observation-id", result.id)
        assertEquals(emptyMap<String, String>(), result.properties)
        verify(observationService).createObservation(any())
    }

    @Test
    fun `updateObservation should update existing observation`() {
        // Given
        val observationId = "observation123"
        val observationTime = Instant.now()
        val location = GeoLocationDto(latitude = 50.0, longitude = -100.0)
        val imageIds = setOf("newImage1", "newImage2")
        val properties = mapOf("newKey" to "newValue")
        val description = "Updated observation description"
        val title = "Updated Observation"

        val dto = ObservationCreateDto(
            observationTime = observationTime,
            location = location,
            imageIds = imageIds,
            properties = properties,
            description = description,
            title = title
        )

        val expectedObservationModel = ObservationModel(
            id = observationId,
            observationTime = observationTime,
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            location = GeoLocationModel(location.latitude, location.longitude),
            imageIds = imageIds,
            properties = properties,
            enabled = true,
            description = description,
            title = title
        )

        whenever(observationService.updateObservation(eq(observationId), any())).thenReturn(expectedObservationModel)

        // When
        val result = observationController.updateObservation(observationId, dto)

        // Then
        assertNotNull(result)
        assertEquals(observationId, result.id)
        assertEquals(description, result.description)
        assertEquals(title, result.title)
        verify(observationService).updateObservation(
            eq(observationId),
            any()
        )
    }

    @Test
    fun `getObservation should return observation`() {
        // Given
        val observationId = "observation123"
        val expectedObservationModel = ObservationModel(
            id = observationId,
            observationTime = Instant.now(),
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            location = GeoLocationModel(40.7128, -74.0060),
            imageIds = setOf("image1"),
            properties = mapOf("key1" to "value1"),
            enabled = true,
            description = "Test observation",
            title = "Test Observation"
        )

        whenever(observationService.getObservation(observationId)).thenReturn(expectedObservationModel)

        // When
        val result = observationController.getObservation(observationId)

        // Then
        assertNotNull(result)
        assertEquals(observationId, result.id)
        assertEquals("Test observation", result.description)
        assertEquals("Test Observation", result.title)
        verify(observationService).getObservation(observationId)
    }

    @Test
    fun `createObservation should handle null description`() {
        // Given
        val observationTime = Instant.now()
        val location = GeoLocationDto(latitude = 40.7128, longitude = -74.0060)
        val imageIds = setOf("image1")
        val properties = mapOf("key1" to "value1")
        val description = "" // Empty description
        val title = "Test Observation"

        val dto = ObservationCreateDto(
            observationTime = observationTime,
            location = location,
            imageIds = imageIds,
            properties = properties,
            description = description,
            title = title
        )

        val expectedObservationModel = ObservationModel(
            id = "test-observation-id",
            observationTime = observationTime,
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            location = GeoLocationModel(location.latitude, location.longitude),
            imageIds = imageIds,
            properties = properties,
            enabled = true,
            description = description,
            title = title
        )

        whenever(observationService.createObservation(any())).thenReturn(expectedObservationModel)

        // When
        val result = observationController.createObservation(dto)

        // Then
        assertNotNull(result)
        assertEquals("test-observation-id", result.id)
        assertEquals("", result.description)
        verify(observationService).createObservation(any())
    }

    @Test
    fun `updateObservation should handle different location coordinates`() {
        // Given
        val observationId = "observation123"
        val observationTime = Instant.now()
        val location = GeoLocationDto(latitude = -33.8688, longitude = 151.2093) // Sydney coordinates
        val imageIds = setOf("image1")
        val properties = mapOf("key1" to "value1")
        val description = "Test description"
        val title = "Test title"

        val dto = ObservationCreateDto(
            observationTime = observationTime,
            location = location,
            imageIds = imageIds,
            properties = properties,
            description = description,
            title = title
        )

        val expectedObservationModel = ObservationModel(
            id = observationId,
            observationTime = observationTime,
            createdTime = Instant.now(),
            updatedTime = Instant.now(),
            location = GeoLocationModel(location.latitude, location.longitude),
            imageIds = imageIds,
            properties = properties,
            enabled = true,
            description = description,
            title = title
        )

        whenever(observationService.updateObservation(eq(observationId), any())).thenReturn(expectedObservationModel)

        // When
        val result = observationController.updateObservation(observationId, dto)

        // Then
        assertNotNull(result)
        assertEquals(observationId, result.id)
        assertEquals(description, result.description)
        assertEquals(title, result.title)
        verify(observationService).updateObservation(
            eq(observationId),
            any()
        )
    }
}
