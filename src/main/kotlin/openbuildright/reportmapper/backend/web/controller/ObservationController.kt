package openbuildright.reportmapper.backend.web.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import openbuildright.reportmapper.backend.model.GeoLocationModel
import openbuildright.reportmapper.backend.model.ObservationCreateModel
import openbuildright.reportmapper.backend.model.ObservationModel
import openbuildright.reportmapper.backend.service.ObservationService
import openbuildright.reportmapper.backend.web.dto.ObservationCreateDto
import openbuildright.reportmapper.backend.web.dto.ObservationDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/observation")
class ObservationController(
    @Autowired
    val observationService: ObservationService

) {
    private val logger = KotlinLogging.logger {}

    @PostMapping()
    fun createObservation(
        @RequestBody dto: ObservationCreateDto,
    ): ObservationDto {
        logger.info { "Received request to create observation." }

        val observationModel: ObservationCreateModel = ObservationCreateModel(
            dto.observationTime,
            GeoLocationModel(dto.location.latitude, dto.location.longitude),
            dto.imageIds,
            dto.properties,
            // ToDo: Derive subject from token.
            reporterId = "",
            description = dto.description,
            title = dto.title
        )
        val observationModelResult = observationService.createObservation(
            observationModel,
        )
        return ObservationDto.fromObservationModel(observationModelResult)
    }

    @PutMapping("/{id}")
    fun updateObservation(
        id: String,
        @RequestBody dto: ObservationCreateDto,
    ): ObservationDto {
        val observation: ObservationModel = observationService.updateObservation(
            id,
            ObservationCreateModel(
                observationTime = dto.observationTime,
                location = GeoLocationModel(dto.location.latitude, dto.location.longitude),
                imageIds = dto.imageIds,
                properties = dto.properties,
                reporterId = "",
                description = dto.description,
                title = dto.title
            )
        )
        return ObservationDto.fromObservationModel(observation)
    }

    @GetMapping("/{id}")
    fun getObservation(id: String): ObservationDto {
        return ObservationDto.fromObservationModel(observationService.getObservation(id))
    }

}