package openbuildright.reportmapper.backend.db.jpa.repository

import openbuildright.reportmapper.backend.db.jpa.entity.Observation
import org.springframework.data.repository.CrudRepository

interface ObservationRepository : CrudRepository<Observation, Long>{
}