package openbuildright.reportmapper.backend.db.jpa.entity

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.Instant

@Entity
class Observation(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val observationTime: Instant,
    val createdTime: Instant,
    val updatedTime: Instant,
    val latitude: Float,
    val longitude: Float,
    ) {}