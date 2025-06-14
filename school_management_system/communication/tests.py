from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Message

User = get_user_model()

class TestMessageModel(TestCase):
    def setUp(self):
        self.sender = User.objects.create_user(username='msgsender', password='password123', role='student')
        self.recipient = User.objects.create_user(username='msgrecipient', password='password123', role='teacher')

    def test_create_message(self):
        message = Message.objects.create(
            sender=self.sender,
            recipient=self.recipient,
            subject="Test Subject",
            body="This is a test message body."
        )
        self.assertEqual(message.sender, self.sender)
        self.assertEqual(message.recipient, self.recipient)
        self.assertEqual(message.subject, "Test Subject")
        self.assertEqual(message.body, "This is a test message body.")
        self.assertFalse(message.is_read)
        self.assertFalse(message.sender_deleted)
        self.assertFalse(message.recipient_deleted)
        self.assertIsNotNone(message.timestamp)
        self.assertEqual(str(message), f"Test Subject (from: {self.sender.username} to: {self.recipient.username})")

    def test_message_soft_delete(self):
        message = Message.objects.create(
            sender=self.sender,
            recipient=self.recipient,
            subject="Delete Test",
            body="Test body for deletion."
        )

        # Sender deletes
        message.sender_deleted = True
        message.save()
        self.assertTrue(message.sender_deleted)
        self.assertFalse(message.recipient_deleted)

        # Recipient deletes
        message.recipient_deleted = True
        message.save()
        self.assertTrue(message.recipient_deleted)
