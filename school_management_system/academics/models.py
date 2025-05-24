from django.db import models
from django.conf import settings # To reference the User model

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Class(models.Model): # Renamed from ClassModel for brevity
    name = models.CharField(max_length=100, help_text="e.g., Mathematics Grade 10A")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='classes')
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, # Or models.PROTECT if a class should not exist without a teacher
        null=True,
        blank=False, # A class should ideally have a teacher
        limit_choices_to={'role': 'teacher'},
        related_name='taught_classes'
    )
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    enrolled_students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='enrolled_classes',
        limit_choices_to={'role': 'student'},
        blank=True
    )

    def __str__(self):
        return f"{self.name} ({self.subject.name} - {self.teacher.username if self.teacher else 'N/A'})"

    class Meta:
        verbose_name_plural = "Classes"


class Schedule(models.Model):
    DAY_CHOICES = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
        ('SUN', 'Sunday'),
    ]
    class_instance = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.CharField(max_length=3, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room_number = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.class_instance.name} - {self.get_day_of_week_display()} at {self.start_time.strftime('%H:%M')}"

    class Meta:
        unique_together = ('class_instance', 'day_of_week', 'start_time') # Prevent duplicate schedules


class LessonMaterial(models.Model):
    class_instance = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='lesson_materials')
    title = models.CharField(max_length=200, help_text="e.g., Week 1: Introduction to Algebra")
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='lesson_materials/%Y/%m/%d/') # Organize by year/month/day
    upload_date = models.DateField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, # Keep material even if teacher account is deleted, or use PROTECT
        null=True,
        limit_choices_to={'role': 'teacher'},
        related_name='uploaded_lesson_materials'
    )

    def __str__(self):
        return f"{self.class_instance.name} - {self.title}"

    class Meta:
        ordering = ['-upload_date', 'title']
