package openbuildright.reportmapper.backend.web.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import openbuildright.reportmapper.backend.model.GeoLocationModel
import openbuildright.reportmapper.backend.model.ObservationModel
import openbuildright.reportmapper.backend.service.ObservationService
import openbuildright.reportmapper.backend.web.dto.GeoLocationDto
import openbuildright.reportmapper.backend.web.dto.ObservationCreateDto
import openbuildright.reportmapper.backend.web.dto.ObservationDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/observation")
class ObservationController(
    @Autowired
    val observationService: ObservationService

) {
    private val logger = KotlinLogging.logger {}

    @PostMapping()
    fun createObservation(@RequestBody dto: ObservationCreateDto) : ObservationDto {
        logger.info { "Received request to create observation." }

        val observationModel: ObservationModel = ObservationModel(
            null,
            dto.observationTime,
            dto.createdTime,
            dto.updatedTime,
            GeoLocationModel(dto.location.latitude, dto.location.longitude),
            dto.imageIds,
            dto.properties
        )
        val observationModelResult = observationService.createObservation(
            observationModel
        )
        return ObservationDto(
            observationModelResult.id!!,
            observationModelResult.observationTime,
            observationModelResult.createdTime,
            observationModelResult.updatedTime,
            GeoLocationDto(
                observationModelResult.location.latitude,
                observationModelResult.location.longitude
            ),
            observationModelResult.imageIds,
            observationModelResult.properties

        )

    }

}