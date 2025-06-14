from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User

class TeacherRegistrationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = UserCreationForm.Meta.fields + ('first_name', 'last_name', 'email', 'contact_number')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'teacher'
        if commit:
            user.save()
        return user

class StudentProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['contact_number', 'profile_picture', 'first_name', 'last_name', 'date_of_birth'] # Added first_name, last_name, date_of_birth for editing
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'type': 'date'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make email and role read-only, though they are not included in fields by default
        # If they were, this is how you might make them read-only:
        # self.fields['email'].disabled = True
        # self.fields['role'].disabled = True

class TeacherProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['contact_number', 'profile_picture', 'first_name', 'last_name', 'email'] # Added first_name, last_name, email for editing

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Optionally, make some fields read-only if needed, e.g., email, though it's included in fields.
        # self.fields['email'].disabled = True
        # self.fields['role'].disabled = True # Role is not in fields, but if it were.

class StudentRegistrationForm(UserCreationForm):
    date_of_birth = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}))

    class Meta(UserCreationForm.Meta):
        model = User
        fields = UserCreationForm.Meta.fields + ('first_name', 'last_name', 'email', 'date_of_birth', 'contact_number')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'student'
        if commit:
            user.save()
        return user
