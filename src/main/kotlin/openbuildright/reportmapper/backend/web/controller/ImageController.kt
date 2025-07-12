package openbuildright.reportmapper.backend.web.controller

import openbuildright.reportmapper.backend.service.ImageService
import openbuildright.reportmapper.backend.web.dto.ImageCreateDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestBody

@RestController
@RequestMapping("/image")
class ImageController(
    @param:Autowired val imageService: ImageService
) {
    @PostMapping()
    fun createImage(
        @RequestBody dto: ImageCreateDto
    ) {}
}