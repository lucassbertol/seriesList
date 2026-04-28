from django.db import models

# Create your models here.

class Series(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default='ongoing')
    grade = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    dateEnded = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.title

