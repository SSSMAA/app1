from django.db import models
from django.conf import settings

class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_messages'
    )
    subject = models.CharField(max_length=255)
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    sender_deleted = models.BooleanField(default=False) # For soft delete by sender
    recipient_deleted = models.BooleanField(default=False) # For soft delete by recipient

    def __str__(self):
        return f"{self.subject} (from: {self.sender.username} to: {self.recipient.username})"

    class Meta:
        ordering = ['-timestamp']
