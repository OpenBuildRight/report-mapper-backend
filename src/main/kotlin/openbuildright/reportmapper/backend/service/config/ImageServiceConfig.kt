package openbuildright.reportmapper.backend.service.config

import openbuildright.reportmapper.backend.db.mongo.ImageMetadataDocumentRepository
import openbuildright.reportmapper.backend.db.objectstore.ImageObjectRepository
import openbuildright.reportmapper.backend.service.ImageService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.context.properties.bind.ConstructorBinding
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@ConfigurationProperties(prefix="openbuildrigth.reportmapper.objectstore.image")
data class ImageServiceConfigProperties (
    val maxWidth: Long = 500,
    val maxHeight: Long = 500,
    val normalizeImage: Boolean = true
)

@Configuration
@EnableConfigurationProperties(ImageServiceConfigProperties::class)
class ImageConfig() {

    @Bean
    fun imageService(
        @Autowired imageRepository: ImageMetadataDocumentRepository,
        @Autowired imageObjectRepository: ImageObjectRepository,
        @Autowired imageServiceConfigProperties: ImageServiceConfigProperties
    ) : ImageService {
        return ImageService(
            imageRepository,
            imageObjectRepository,
            imageServiceConfigProperties.maxWidth.toInt(),
            imageServiceConfigProperties.maxHeight.toInt(),
            imageServiceConfigProperties.normalizeImage
        )
    }
}