package openbuildright.reportmapper.backend.db.jpa.entity

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import org.springframework.data.geo.Point
import java.time.Instant

@Entity
class Observation(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    var observationTime: Instant,
    val createdTime: Instant,
    var updatedTime: Instant,
    var location: Point,
    var enabled: Boolean,
    val observationSignature: String,
    val images: List<Image>
    ) {}