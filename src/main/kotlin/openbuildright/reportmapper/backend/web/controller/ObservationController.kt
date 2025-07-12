package openbuildright.reportmapper.backend.web.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import openbuildright.reportmapper.backend.model.GeoLocationModel
import openbuildright.reportmapper.backend.model.ObservationModel
import openbuildright.reportmapper.backend.service.ObservationService
import openbuildright.reportmapper.backend.model.ObservationCreateModel
import openbuildright.reportmapper.backend.web.dto.ObservationCreateDto
import openbuildright.reportmapper.backend.web.dto.ObservationDto
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
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
    fun createObservation(
        @RequestBody dto: ObservationCreateDto,
        @RequestHeader("x-observation-token") observationToken: String
        ) : ObservationDto {
        logger.info { "Received request to create observation." }

        val observationModel: ObservationCreateModel = ObservationCreateModel(
            dto.observationTime,
            GeoLocationModel(dto.location.latitude, dto.location.longitude),
            dto.imageIds,
            dto.properties
        )
        val observationModelResult = observationService.createObservation(
            observationModel,
            observationToken
        )
        return ObservationDto.fromObservationModel(observationModelResult)
    }

    @PutMapping("/{id}")
    fun updateObservation(
        id: Long,
        @RequestBody dto: ObservationCreateDto,
        @RequestHeader("x-observation-token") observationToken: String,
        ) : ObservationDto {
        val observation: ObservationModel = observationService.updateObservation(
            id,
            ObservationCreateModel(
                observationTime = dto.observationTime,
                location = GeoLocationModel(dto.location.latitude, dto.location.longitude),
                imageIds = dto.imageIds,
                properties = dto.properties
            ),
            observationToken,
            false
        )
        return ObservationDto.fromObservationModel(observation)
    }

    @GetMapping("/{id}")
    fun getObservation(id: Long) : ObservationDto {
        return ObservationDto.fromObservationModel(observationService.getObservation(id))
    }

}