from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from academics.models import Subject, Class # Assuming these are in academics.models
from .models import Attendance

User = get_user_model()

class TestAttendanceModel(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(username='attendancestudent', password='password123', role='student')
        self.teacher = User.objects.create_user(username='attendanceteacher', password='password123', role='teacher')
        self.subject = Subject.objects.create(name="AttendanceSubject")
        self.class_instance = Class.objects.create(
            name="Attendance Class",
            subject=self.subject,
            teacher=self.teacher,
            start_date=timezone.now().date(),
            end_date=timezone.now().date() + timezone.timedelta(days=30)
        )
        self.class_instance.enrolled_students.add(self.student)

    def test_create_attendance_record(self):
        attendance_date = timezone.now().date()
        record = Attendance.objects.create(
            student=self.student,
            class_instance=self.class_instance,
            date=attendance_date,
            status='Present'
        )
        self.assertEqual(record.student, self.student)
        self.assertEqual(record.class_instance, self.class_instance)
        self.assertEqual(record.date, attendance_date)
        self.assertEqual(record.status, 'Present')
        self.assertEqual(str(record), f"{self.student.username} - {self.class_instance.name} - {attendance_date} - Present")

    def test_attendance_unique_together_constraint(self):
        attendance_date = timezone.now().date()
        Attendance.objects.create(
            student=self.student,
            class_instance=self.class_instance,
            date=attendance_date,
            status='Present'
        )
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Attendance.objects.create(
                student=self.student,
                class_instance=self.class_instance,
                date=attendance_date, # Same student, class, and date
                status='Absent'
            )
