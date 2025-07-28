package openbuildright.reportmapper.backend.web.dto

import org.springframework.web.multipart.MultipartFile

data class ImageCreateDto(
    val file: MultipartFile,
    val latitude: Double?,
    val longitude: Double?,
)
