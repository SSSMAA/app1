from django.urls import path
from .views import (
    InboxView,
    SentMessagesView,
    MessageDetailView,
    ComposeMessageView,
    DeleteMessageView,
)

urlpatterns = [
    path('inbox/', InboxView.as_view(), name='inbox'),
    path('sent/', SentMessagesView.as_view(), name='sent_messages'),
    path('message/<int:message_id>/', MessageDetailView.as_view(), name='message_detail'),
    path('compose/', ComposeMessageView.as_view(), name='compose_message'), # Will handle GET params for ?to_user=<id> or ?reply_to=<id>
    path('delete/<int:message_id>/', DeleteMessageView.as_view(), name='delete_message'),
]
