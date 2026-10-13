from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Object-level check: the object must belong to the requesting user.

    This is a second line of defence. The queryset is already filtered by
    user, so other people's objects never even reach this check (they 404).
    """

    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id