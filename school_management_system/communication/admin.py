from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'sender', 'recipient', 'timestamp', 'is_read', 'sender_deleted', 'recipient_deleted')
    list_filter = ('is_read', 'sender_deleted', 'recipient_deleted', 'timestamp', 'sender__username', 'recipient__username')
    search_fields = ('subject', 'body', 'sender__username', 'recipient__username')
    raw_id_fields = ('sender', 'recipient') # For performance with many users
    readonly_fields = ('timestamp',)

    def get_queryset(self, request):
        # Optimize query
        qs = super().get_queryset(request)
        return qs.select_related('sender', 'recipient')
