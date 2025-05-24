from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy, reverse
from django.contrib import messages
from django.db.models import Q # For complex queries
from .models import Message
from .forms import MessageComposeForm
from users.models import User # For type hinting

class InboxView(LoginRequiredMixin, View):
    template_name = 'communication/inbox.html'

    def get(self, request, *args, **kwargs):
        messages_list = Message.objects.filter(
            recipient=request.user, 
            recipient_deleted=False
        ).select_related('sender').order_by('-timestamp')
        
        unread_count = messages_list.filter(is_read=False).count()
        
        context = {
            'messages_list': messages_list,
            'unread_count': unread_count,
            'page_title': 'Inbox',
            'is_inbox': True # To differentiate in template if reusing for sent items
        }
        return render(request, self.template_name, context)

class SentMessagesView(LoginRequiredMixin, View):
    template_name = 'communication/sent_messages.html' # Can be same as inbox.html

    def get(self, request, *args, **kwargs):
        messages_list = Message.objects.filter(
            sender=request.user, 
            sender_deleted=False
        ).select_related('recipient').order_by('-timestamp')
        
        context = {
            'messages_list': messages_list,
            'page_title': 'Sent Messages',
            'is_inbox': False
        }
        return render(request, self.template_name, context)

class MessageDetailView(LoginRequiredMixin, View):
    template_name = 'communication/message_detail.html'

    def get(self, request, message_id, *args, **kwargs):
        message_obj = get_object_or_404(Message, id=message_id)

        # Check if user is either sender or recipient
        is_sender = (message_obj.sender == request.user)
        is_recipient = (message_obj.recipient == request.user)

        if not (is_sender or is_recipient):
            messages.error(request, "You do not have permission to view this message.")
            return redirect('inbox') # Or a more generic access denied page

        # Check if the message has been soft-deleted by the current user
        if is_sender and message_obj.sender_deleted:
            messages.error(request, "This message has been deleted from your sent items.")
            return redirect('sent_messages')
        if is_recipient and message_obj.recipient_deleted:
            messages.error(request, "This message has been deleted from your inbox.")
            return redirect('inbox')

        # Mark as read if recipient views it
        if is_recipient and not message_obj.is_read:
            message_obj.is_read = True
            message_obj.save(update_fields=['is_read'])
        
        context = {
            'message_obj': message_obj,
            'is_current_user_sender': is_sender
        }
        return render(request, self.template_name, context)

class ComposeMessageView(LoginRequiredMixin, View):
    template_name = 'communication/compose_message.html'
    form_class = MessageComposeForm

    def get(self, request, *args, **kwargs):
        initial_data = {}
        reply_to_id = request.GET.get('reply_to')
        to_user_id = request.GET.get('to_user') # For direct message from a user profile, for example

        if reply_to_id:
            try:
                original_message = get_object_or_404(Message, id=reply_to_id)
                # User must be sender or recipient of the original message to reply
                if not (original_message.sender == request.user or original_message.recipient == request.user):
                    messages.error(request, "You cannot reply to this message.")
                    return redirect('inbox')
                
                # If current user was the recipient, reply to sender. Else, reply to recipient.
                # This logic for reply_to might be slightly off; usually reply is to the sender.
                if original_message.sender == request.user: # User sent this, now wants to "reply" (more like follow-up)
                    initial_data['recipient'] = original_message.recipient
                else: # User received this, replying to sender
                    initial_data['recipient'] = original_message.sender
                
                initial_data['subject'] = f"Re: {original_message.subject}"
                if "\n--- Original Message ---" not in original_message.body: # Avoid multiple quote blocks
                    initial_data['body'] = f"\n\n\n--- Original Message ---\nFrom: {original_message.sender.username}\nTo: {original_message.recipient.username}\nDate: {original_message.timestamp.strftime('%Y-%m-%d %H:%M')}\nSubject: {original_message.subject}\n\n{original_message.body}"

            except Message.DoesNotExist:
                messages.error(request, "Original message not found for reply.")
        elif to_user_id:
            try:
                recipient = User.objects.get(id=to_user_id)
                # Check if the current user is allowed to message this recipient based on form's queryset logic
                temp_form_for_queryset_check = self.form_class(user=request.user)
                if recipient not in temp_form_for_queryset_check.fields['recipient'].queryset:
                    messages.error(request, f"You are not permitted to send a message to {recipient.username}.")
                    # Redirect to a safe page, perhaps the compose page without recipient filled
                    return redirect('compose_message') 
                initial_data['recipient'] = recipient
            except User.DoesNotExist:
                messages.error(request, "Recipient not found.")
        
        form = self.form_class(user=request.user, initial=initial_data)
        return render(request, self.template_name, {'form': form})

    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST, user=request.user)
        if form.is_valid():
            message = form.save(commit=False)
            message.sender = request.user
            message.save()
            messages.success(request, f"Message sent to {message.recipient.username} successfully.")
            return redirect('sent_messages')
        
        messages.error(request, "Please correct the errors below.")
        return render(request, self.template_name, {'form': form})


class DeleteMessageView(LoginRequiredMixin, View):
    def post(self, request, message_id, *args, **kwargs):
        message_obj = get_object_or_404(Message, id=message_id)
        
        # Determine if the request is from inbox or sent view to redirect appropriately
        # The 'origin' should be passed in the POST request from the template
        origin = request.POST.get('origin', 'inbox') 

        if message_obj.sender == request.user:
            if not message_obj.sender_deleted:
                message_obj.sender_deleted = True
                message_obj.save(update_fields=['sender_deleted'])
                messages.success(request, "Message deleted from sent items.")
            else:
                messages.info(request, "Message was already deleted from sent items.")
            redirect_url = 'sent_messages'

        elif message_obj.recipient == request.user:
            if not message_obj.recipient_deleted:
                message_obj.recipient_deleted = True
                message_obj.save(update_fields=['recipient_deleted'])
                messages.success(request, "Message deleted from inbox.")
            else:
                messages.info(request, "Message was already deleted from inbox.")
            redirect_url = 'inbox'
        else:
            messages.error(request, "You do not have permission to delete this message.")
            # Redirect based on origin if possible, otherwise default to inbox
            redirect_url = 'sent_messages' if origin == 'sent_messages' else 'inbox'
            return redirect(redirect_url)

        # Optional: Check for permanent deletion
        # if message_obj.sender_deleted and message_obj.recipient_deleted:
        #     actual_deletion_timestamp = message_obj.timestamp # Save for message
        #     message_obj.delete()
        #     messages.info(request, f"Message from {actual_deletion_timestamp.strftime('%Y-%m-%d')} permanently deleted.")

        return redirect(redirect_url)
