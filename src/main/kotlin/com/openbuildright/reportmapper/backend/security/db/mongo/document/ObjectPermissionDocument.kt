package com.openbuildright.reportmapper.backend.security.db.mongo.document

import com.openbuildright.reportmapper.backend.security.ObjectPermissionModel
import com.openbuildright.reportmapper.backend.security.ObjectType
import com.openbuildright.reportmapper.backend.security.Permission
import com.openbuildright.reportmapper.backend.security.PermissionGranteeType
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "ObjectPermissions")
@CompoundIndex(
    def = "{'objectType': 'string', 'objectId': 'string', ´granteeType´: ´śtring´,'grantee': 'text'}"
)
data class ObjectPermissionDocument(
    @Id
    val id: String,
    val objectType: ObjectType,
    val objectId: String,
    val granteeType: PermissionGranteeType,  // ROLE or USER
    val grantee: String,
    val permission: Permission
) {
    fun toObjectPermissionModel() : ObjectPermissionModel {
        return ObjectPermissionModel(
            id,
            objectType,
            objectId,
            granteeType,
            grantee,
            permission
        )
    }

    companion object {
        fun fromObjectPermissionModel(model: ObjectPermissionModel) : ObjectPermissionDocument {
            return ObjectPermissionDocument(
                model.id,
                model.objectType,
                model.objectId,
                model.granteeType,
                model.grantee,
                model.permission
            )
        }
    }
}

