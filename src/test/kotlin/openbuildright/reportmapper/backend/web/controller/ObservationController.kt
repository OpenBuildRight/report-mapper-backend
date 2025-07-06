package openbuildright.reportmapper.backend.web.controller

import openbuildright.reportmapper.backend.web.dto.ObservationCreateDto
import openbuildright.reportmapper.backend.web.dto.ObservationDto
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController

@RestController("/observation")
class ObservationController {

    @PostMapping()
    fun createObservation(dto: ObservationCreateDto) : ObservationDto {

    }

}