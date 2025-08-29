package com.openbuildright.reportmapper.backend.security

import org.springframework.security.access.prepost.PreAuthorize

/**
 * Annotation for operations that require owner access OR admin role
 * Users can only edit their own observations, but admins can disable any observation
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasScope('admin') or @permissionService.hasPermission('OBSERVATION', #id, 'UPDATE', authentication)")
annotation class OwnerOrAdminAccess

/**
 * Annotation for operations that require owner access OR admin role with custom parameter
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasScope('admin') or @permissionService.hasPermission('OBSERVATION', #resourceId, 'UPDATE', authentication)")
annotation class OwnerOrAdminAccessById(val resourceId: String = "resourceId")

/**
 * Annotation for operations that require admin role only
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasScope('admin')")
annotation class AdminOnly

/**
 * Annotation for operations that require admin role with custom parameter
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("hasScope('admin')")
annotation class AdminOnlyById(val resourceId: String = "resourceId")

/**
 * Annotation for operations that require read permission
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("@permissionService.hasPermission('OBSERVATION', #id, 'READ', authentication)")
annotation class RequireReadAccess

/**
 * Annotation for operations that require update permission
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("@permissionService.hasPermission('OBSERVATION', #id, 'UPDATE', authentication)")
annotation class RequireUpdateAccess

/**
 * Annotation for operations that require disable permission
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@PreAuthorize("@permissionService.hasPermission('OBSERVATION', #id, 'DISABLE', authentication)")
annotation class RequireDisableAccess
