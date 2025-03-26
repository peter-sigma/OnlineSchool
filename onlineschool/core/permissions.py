from rest_framework import permissions

class IsInstructorOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow instructors or admins to create, update, or delete courses.
    """
    def has_permission(self, request, view):
        # For safe methods (GET, HEAD, OPTIONS), allow access.
        if request.method in permissions.SAFE_METHODS:
            return True

        # For unsafe methods (POST, PUT, PATCH, DELETE), check if the user is an instructor or admin.
        return request.user.is_authenticated and request.user.role in ['instructor', 'admin']