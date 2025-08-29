package com.openbuildright.reportmapper.backend

import com.openbuildright.reportmapper.backend.config.CorsConfig
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableConfigurationProperties(CorsConfig::class)
class MapReportBackendApplication

fun main(args: Array<String>) {
    runApplication<MapReportBackendApplication>(*args)
}
