package com.openbuildright.reportmapper.backend.service

import com.openbuildright.reportmapper.backend.db.mongo.ImageMetadataDocument
import com.openbuildright.reportmapper.backend.db.mongo.ImageMetadataDocumentRepository
import com.openbuildright.reportmapper.backend.db.objectstore.ImageObjectRepository
import com.openbuildright.reportmapper.backend.exception.NotFoundException
import com.openbuildright.reportmapper.backend.model.GeoLocationModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataCreateModel
import com.openbuildright.reportmapper.backend.model.ImageMetadataModel
import com.openbuildright.reportmapper.backend.model.ImageModel
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.data.geo.Point
import java.time.Instant
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class ImageServiceTest {

    private lateinit var imageRepository: ImageMetadataDocumentRepository
    private lateinit var imageObjectRepository: ImageObjectRepository
    private lateinit var imageService: ImageService

    private val maxWidth = 1920
    private val maxHeight = 1080
    private val normalizeImage = true
    private val thumbnailMaxWidth = 300
    private val thumbnailMaxHeight = 300

    @BeforeEach
    fun setUp() {
        imageRepository = mock()
        imageObjectRepository = mock()
        imageService = ImageService(
            imageRepository = imageRepository,
            imageObjectRepository = imageObjectRepository,
            maxWidth = maxWidth,
            maxHeight = maxHeight,
            normalizeImage = normalizeImage,
            thumbnailMaxWidth = thumbnailMaxWidth,
            thumbnailMaxHeight = thumbnailMaxHeight
        )
    }

    @Test
    fun `createImage should create image with metadata and store in object repository`() {
        // Given
        val imageData = javaClass.getResourceAsStream("/test-data/jpeg/exif/2024-04-30_G012.JPG")?.readBytes() 
            ?: throw IllegalStateException("Test image not found")
        val location = GeoLocationModel(latitude = 40.7128, longitude = -74.0060)
        val description = "Test image description"
        val imageGeneratedTime = Instant.now()
        
        val metadata = ImageMetadataCreateModel(
            imageGeneratedTime = imageGeneratedTime,
            location = location,
            description = description
        )

        val savedDocument = mock<ImageMetadataDocument>()
        whenever(imageRepository.save(any())).thenReturn(savedDocument)
        whenever(savedDocument.toImageMetadataModel()).thenReturn(mock<ImageMetadataModel>())
        doNothing().whenever(imageObjectRepository).put(any(), any())

        // When
        val result = imageService.createImage(imageData, metadata)

        // Then
        verify(imageObjectRepository, times(2)).put(any(), any())
        verify(imageRepository).save(any())
        assertNotNull(result)
    }

    @Test
    fun `createImage should handle null location in metadata`() {
        // Given
        val imageData = javaClass.getResourceAsStream("/test-data/jpeg/exif/2024-04-30_G012.JPG")?.readBytes() 
            ?: throw IllegalStateException("Test image not found")
        val metadata = ImageMetadataCreateModel(
            imageGeneratedTime = Instant.now(),
            location = null,
            description = "Test description"
        )

        val savedDocument = mock<ImageMetadataDocument>()
        whenever(imageRepository.save(any())).thenReturn(savedDocument)
        whenever(savedDocument.toImageMetadataModel()).thenReturn(mock<ImageMetadataModel>())
        doNothing().whenever(imageObjectRepository).put(any(), any())

        // When
        val result = imageService.createImage(imageData, metadata)

        // Then
        verify(imageObjectRepository, times(2)).put(any(), any())
        verify(imageRepository).save(any())
        assertNotNull(result)
    }

    @Test
    fun `getImageMetadata should return image metadata when found`() {
        // Given
        val imageId = "test-image-id"
        val document = mock<ImageMetadataDocument>()
        val expectedModel = mock<ImageMetadataModel>()
        
        whenever(imageRepository.findById(imageId)).thenReturn(Optional.of(document))
        whenever(document.toImageMetadataModel()).thenReturn(expectedModel)

        // When
        val result = imageService.getImageMetadata(imageId)

        // Then
        assertEquals(expectedModel, result)
        verify(imageRepository).findById(imageId)
    }

    @Test
    fun `getImageMetadata should throw NotFoundException when image not found`() {
        // Given
        val imageId = "non-existent-image-id"
        whenever(imageRepository.findById(imageId)).thenReturn(Optional.empty())

        // When & Then
        assertThrows<NotFoundException> {
            imageService.getImageMetadata(imageId)
        }
        verify(imageRepository).findById(imageId)
    }

    @Test
    fun `getImage should return image with metadata when found`() {
        // Given
        val imageId = "test-image-id"
        val imageData = "test image data".toByteArray()
        val metadataModel = mock<ImageMetadataModel>()
        val expectedImageModel = ImageModel(image = imageData, metadata = metadataModel)
        
        whenever(metadataModel.key).thenReturn("test-key")
        whenever(imageObjectRepository.get("test-key")).thenReturn(imageData)
        
        // Mock getImageMetadata
        val document = mock<ImageMetadataDocument>()
        whenever(imageRepository.findById(imageId)).thenReturn(Optional.of(document))
        whenever(document.toImageMetadataModel()).thenReturn(metadataModel)

        // When
        val result = imageService.getImage(imageId, thumbnail = false)

        // Then
        assertEquals(expectedImageModel.image, result.image)
        assertEquals(expectedImageModel.metadata, result.metadata)
    }

    @Test
    fun `getImage should return thumbnail when thumbnail flag is true`() {
        // Given
        val imageId = "test-image-id"
        val thumbnailData = "thumbnail data".toByteArray()
        val metadataModel = mock<ImageMetadataModel>()
        
        whenever(metadataModel.thumbnailKey).thenReturn("thumbnail-key")
        whenever(imageObjectRepository.get("thumbnail-key")).thenReturn(thumbnailData)
        
        // Mock getImageMetadata
        val document = mock<ImageMetadataDocument>()
        whenever(imageRepository.findById(imageId)).thenReturn(Optional.of(document))
        whenever(document.toImageMetadataModel()).thenReturn(metadataModel)

        // When
        val result = imageService.getImage(imageId, thumbnail = true)

        // Then
        assertEquals(thumbnailData, result.image)
        verify(imageObjectRepository).get("thumbnail-key")
    }

    @Test
    fun `listImagesMetadata should return set of image metadata for given ids`() {
        // Given
        val imageIds = setOf("id1", "id2", "id3")
        val metadata1 = mock<ImageMetadataModel>()
        val metadata2 = mock<ImageMetadataModel>()
        val metadata3 = mock<ImageMetadataModel>()
        
        val document1 = mock<ImageMetadataDocument>()
        val document2 = mock<ImageMetadataDocument>()
        val document3 = mock<ImageMetadataDocument>()
        
        whenever(imageRepository.findById("id1")).thenReturn(Optional.of(document1))
        whenever(imageRepository.findById("id2")).thenReturn(Optional.of(document2))
        whenever(imageRepository.findById("id3")).thenReturn(Optional.of(document3))
        whenever(document1.toImageMetadataModel()).thenReturn(metadata1)
        whenever(document2.toImageMetadataModel()).thenReturn(metadata2)
        whenever(document3.toImageMetadataModel()).thenReturn(metadata3)

        // When
        val result = imageService.listImagesMetadata(imageIds)

        // Then
        assertEquals(3, result.size)
        assertTrue(result.contains(metadata1))
        assertTrue(result.contains(metadata2))
        assertTrue(result.contains(metadata3))
    }

    @Test
    fun `listImagesMetadata should handle empty set`() {
        // Given
        val imageIds = emptySet<String>()

        // When
        val result = imageService.listImagesMetadata(imageIds)

        // Then
        assertTrue(result.isEmpty())
    }
}
