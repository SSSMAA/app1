from django import forms
from .models import Message
from users.models import User # Assuming User model is in users.models
from academics.models import Class # To get teachers/students of a class

class MessageComposeForm(forms.ModelForm):
    recipient = forms.ModelChoiceField(
        queryset=User.objects.none(), # To be populated in the view
        label="Recipient",
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = Message
        fields = ['recipient', 'subject', 'body']
        widgets = {
            'subject': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Subject of your message'}),
            'body': forms.Textarea(attrs={'class': 'form-control', 'rows': 5, 'placeholder': 'Enter your message here...'}),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None) # The currently logged-in user (sender)
        super().__init__(*args, **kwargs)

        if user:
            recipient_queryset = User.objects.none() # Start with an empty queryset

            if user.role == 'admin':
                # Admins can message anyone except themselves
                recipient_queryset = User.objects.exclude(id=user.id).order_by('username')

            elif user.role == 'teacher':
                # Teachers can message Admins
                admins = User.objects.filter(role='admin').order_by('username')

                # Teachers can message students enrolled in any of their classes
                students_in_my_classes = User.objects.filter(
                    role='student',
                    enrolled_classes__teacher=user
                ).distinct().order_by('username')

                recipient_queryset = admins | students_in_my_classes
                # Exclude self if by any chance teacher is also an admin (unlikely based on current model)
                recipient_queryset = recipient_queryset.exclude(id=user.id).distinct().order_by('username')

            elif user.role == 'student':
                # Students can message Admins
                admins = User.objects.filter(role='admin').order_by('username')

                # Students can message teachers of any class they are enrolled in
                teachers_of_my_classes = User.objects.filter(
                    role='teacher',
                    taught_classes__enrolled_students=user # taught_classes is related_name from Class.teacher
                ).distinct().order_by('username')

                recipient_queryset = admins | teachers_of_my_classes
                recipient_queryset = recipient_queryset.exclude(id=user.id).distinct().order_by('username')

            self.fields['recipient'].queryset = recipient_queryset
        else:
            # No user provided (should not happen in practice for a logged-in feature)
            # Or if it's an admin using the raw form somehow without a 'user' context
            self.fields['recipient'].queryset = User.objects.exclude(id=getattr(self.instance, 'sender_id', None)).order_by('username')
