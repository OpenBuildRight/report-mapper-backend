package com.openbuildright.reportmapper.backend.security

import org.springframework.security.access.prepost.PreAuthorize

/**
 * Annotation for operations that require owner access OR moderator role
 * Users can only edit their own observations, but moderators can edit any observation
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MODERATOR') or @observationAccessService.isOwner(#id, authentication.name)")
annotation class OwnerOrModeratorAccess

/**
 * Annotation for operations that require owner access OR moderator role with custom parameter
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MODERATOR') or @observationAccessService.isOwner(#resourceId, authentication.name)")
annotation class OwnerOrModeratorAccessById(val resourceId: String = "resourceId")

/**
 * Annotation for operations that require moderator role only
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MODERATOR')")
annotation class ModeratorOnly

/**
 * Annotation for operations that require moderator role with custom parameter
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasRole('MODERATOR')")
annotation class ModeratorOnlyById(val resourceId: String = "resourceId")
