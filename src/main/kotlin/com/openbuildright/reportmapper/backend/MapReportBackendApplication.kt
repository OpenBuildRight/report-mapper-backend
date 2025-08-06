package com.openbuildright.reportmapper.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class MapReportBackendApplication

fun main(args: Array<String>) {
    runApplication<MapReportBackendApplication>(*args)
}
