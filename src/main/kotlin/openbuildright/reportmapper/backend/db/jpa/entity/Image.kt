package openbuildright.reportmapper.backend.db.jpa.entity

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import org.springframework.data.geo.Point
import java.time.Instant

@Entity
class Image(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val key: String,
    val createdTime: Instant,
    val location: Point?
) {

}