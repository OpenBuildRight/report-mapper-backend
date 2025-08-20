package com.openbuildright.reportmapper.backend.service

import com.openbuildright.reportmapper.backend.db.mongo.ObservationDocument
import com.openbuildright.reportmapper.backend.db.mongo.ObservationDocumentRepository
import com.openbuildright.reportmapper.backend.exception.NotFoundException
import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.model.ObservationCreateModel
import com.openbuildright.reportmapper.backend.model.ObservationModel
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class ObservationServiceTest {

    private lateinit var observationRepository: ObservationDocumentRepository
    private lateinit var imageService: ImageService
    private lateinit var observationService: ObservationService

    @BeforeEach
    fun setUp() {
        observationRepository = mock()
        imageService = mock()
        observationService = ObservationService(
            observationRepository = observationRepository,
            imageService = imageService
        )
    }

    @Test
    fun `createObservation should create observation with valid data`() {
        // Given
        val observationTime = Instant.now()
        val location = GeoLocationModel(latitude = 40.7128, longitude = -74.0060)
        val imageIds = setOf("image1", "image2")
        val properties = mapOf("key1" to "value1", "key2" to "value2")
        val reporterId = "reporter123"
        val description = "Test observation description"
        val title = "Test Observation"

        val observationModel = ObservationCreateModel(
            observationTime = observationTime,
            location = location,
            imageIds = imageIds,
            properties = properties,
            reporterId = reporterId,
            description = description,
            title = title
        )

        val imageMetadata1 = mock<ImageMetadataModel>()
        val imageMetadata2 = mock<ImageMetadataModel>()
        whenever(imageMetadata1.id).thenReturn("image1")
        whenever(imageMetadata2.id).thenReturn("image2")
        whenever(imageService.listImagesMetadata(imageIds)).thenReturn(setOf(imageMetadata1, imageMetadata2))

        val savedDocument = mock<ObservationDocument>()
        whenever(observationRepository.save(any())).thenReturn(savedDocument)
        whenever(savedDocument.toObservationModel()).thenReturn(mock<ObservationModel>())

        // When
        val result = observationService.createObservation(observationModel)

        // Then
        verify(imageService).listImagesMetadata(imageIds)
        verify(observationRepository).save(any())
        assertNotNull(result)
    }

    @Test
    fun `createObservation should handle empty image ids`() {
        // Given
        val observationTime = Instant.now()
        val location = GeoLocationModel(latitude = 40.7128, longitude = -74.0060)
        val imageIds = emptySet<String>()
        val properties = mapOf("key1" to "value1")
        val reporterId = "reporter123"
        val description = "Test observation description"
        val title = "Test Observation"

        val observationModel = ObservationCreateModel(
            observationTime = observationTime,
            location = location,
            imageIds = imageIds,
            properties = properties,
            reporterId = reporterId,
            description = description,
            title = title
        )

        whenever(imageService.listImagesMetadata(imageIds)).thenReturn(emptySet())

        val savedDocument = mock<ObservationDocument>()
        whenever(observationRepository.save(any())).thenReturn(savedDocument)
        whenever(savedDocument.toObservationModel()).thenReturn(mock<ObservationModel>())

        // When
        val result = observationService.createObservation(observationModel)

        // Then
        verify(imageService).listImagesMetadata(imageIds)
        verify(observationRepository).save(any())
        assertNotNull(result)
    }

    @Test
    fun `updateObservation should update existing observation`() {
        // Given
        val observationId = "observation123"
        val observationTime = Instant.now()
        val location = GeoLocationModel(latitude = 40.7128, longitude = -74.0060)
        val imageIds = setOf("image1", "image2")
        val properties = mapOf("key1" to "value1", "key2" to "value2")
        val reporterId = "reporter123"
        val description = "Updated observation description"
        val title = "Updated Observation"

        val observationModel = ObservationCreateModel(
            observationTime = observationTime,
            location = location,
            imageIds = imageIds,
            properties = properties,
            reporterId = reporterId,
            description = description,
            title = title
        )

        val existingDocument = mock<ObservationDocument>()
        whenever(observationRepository.findById(observationId)).thenReturn(Optional.of(existingDocument))
        whenever(observationRepository.save(any())).thenReturn(existingDocument)
        whenever(existingDocument.toObservationModel()).thenReturn(mock<ObservationModel>())

        val imageMetadata1 = mock<ImageMetadataModel>()
        val imageMetadata2 = mock<ImageMetadataModel>()
        whenever(imageMetadata1.id).thenReturn("image1")
        whenever(imageMetadata2.id).thenReturn("image2")
        whenever(imageService.listImagesMetadata(imageIds)).thenReturn(setOf(imageMetadata1, imageMetadata2))

        // When
        val result = observationService.updateObservation(observationId, observationModel)

        // Then
        verify(observationRepository).findById(observationId)
        verify(imageService).listImagesMetadata(imageIds)
        verify(observationRepository).save(existingDocument)
        assertNotNull(result)
    }

    @Test
    fun `updateObservation should throw ResponseStatusException when observation not found`() {
        // Given
        val observationId = "non-existent-observation"
        val observationModel = mock<ObservationCreateModel>()
        whenever(observationRepository.findById(observationId)).thenReturn(Optional.empty())

        // When & Then
        assertThrows<ResponseStatusException> {
            observationService.updateObservation(observationId, observationModel)
        }
        verify(observationRepository).findById(observationId)
        verify(observationRepository, never()).save(any())
    }

    @Test
    fun `getObservation should return observation when found`() {
        // Given
        val observationId = "observation123"
        val document = mock<ObservationDocument>()
        val expectedModel = mock<ObservationModel>()
        
        whenever(observationRepository.findById(observationId)).thenReturn(Optional.of(document))
        whenever(document.toObservationModel()).thenReturn(expectedModel)

        // When
        val result = observationService.getObservation(observationId)

        // Then
        assertEquals(expectedModel, result)
        verify(observationRepository).findById(observationId)
    }

    @Test
    fun `getObservation should throw NotFoundException when observation not found`() {
        // Given
        val observationId = "non-existent-observation"
        whenever(observationRepository.findById(observationId)).thenReturn(Optional.empty())

        // When & Then
        assertThrows<NotFoundException> {
            observationService.getObservation(observationId)
        }
        verify(observationRepository).findById(observationId)
    }

    @Test
    fun `updateObservation should update all fields correctly`() {
        // Given
        val observationId = "observation123"
        val observationTime = Instant.now()
        val location = GeoLocationModel(latitude = 50.0, longitude = -100.0)
        val imageIds = setOf("newImage1", "newImage2")
        val properties = mapOf("newKey" to "newValue")
        val description = "New description"
        val title = "New title"

        val observationModel = ObservationCreateModel(
            observationTime = observationTime,
            location = location,
            imageIds = imageIds,
            properties = properties,
            reporterId = "newReporter",
            description = description,
            title = title
        )

        val existingDocument = mock<ObservationDocument>()
        whenever(observationRepository.findById(observationId)).thenReturn(Optional.of(existingDocument))
        whenever(observationRepository.save(any())).thenReturn(existingDocument)
        whenever(existingDocument.toObservationModel()).thenReturn(mock<ObservationModel>())

        val imageMetadata1 = mock<ImageMetadataModel>()
        val imageMetadata2 = mock<ImageMetadataModel>()
        whenever(imageMetadata1.id).thenReturn("newImage1")
        whenever(imageMetadata2.id).thenReturn("newImage2")
        whenever(imageService.listImagesMetadata(imageIds)).thenReturn(setOf(imageMetadata1, imageMetadata2))

        // When
        observationService.updateObservation(observationId, observationModel)

        // Then
        verify(existingDocument).updatedTime = any()
        verify(existingDocument).location = any()
        verify(existingDocument).imageIds = any()
        verify(existingDocument).description = description
        verify(existingDocument).properties = properties
        verify(existingDocument).title = title
    }
}
