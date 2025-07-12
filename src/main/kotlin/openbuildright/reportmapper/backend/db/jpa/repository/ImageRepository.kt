package openbuildright.reportmapper.backend.db.jpa.repository

import openbuildright.reportmapper.backend.db.jpa.entity.Image
import org.springframework.data.repository.CrudRepository

interface ImageRepository : CrudRepository<Image, Long> {
}