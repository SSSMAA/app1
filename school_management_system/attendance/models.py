from django.db import models
from django.conf import settings # To reference the User model
from academics.models import Class # To reference the Class model

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Excused', 'Excused'),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'student'},
        related_name='attendance_records'
    )
    class_instance = models.ForeignKey(
        Class, # Use the imported Class model
        on_delete=models.CASCADE,
        related_name='attendance_logs'
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.username} - {self.class_instance.name} - {self.date} - {self.status}"

    class Meta:
        unique_together = ('student', 'class_instance', 'date')
        ordering = ['-date', 'class_instance__name', 'student__username'] # Default ordering
