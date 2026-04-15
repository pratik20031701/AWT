from django.db import models

class Student(models.Model):
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=20)
    email = models.EmailField()
    course = models.CharField(max_length=50)

    def __str__(self):
        return self.name