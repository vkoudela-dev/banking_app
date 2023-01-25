from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    pass

class Account(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    timestamp = models.DateTimeField(auto_now_add=True)
    balance = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    is_active = models.BooleanField(default=True)

    def serialize(self):
        return {
            "user": self.user.username,
            "timestamp": self.timestamp.strftime("%b %d  %Y, %I:%M %p"),
            "balance": self.balance,
            "currency": self.currency,
            "active": self.is_active
        }

class Transaction(models.Model):
    payer = models.ForeignKey(User, on_delete=models.PROTECT, related_name='transactions')
    payee = models.ForeignKey(User, on_delete=models.PROTECT)
    timestamp = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)

    def serialize(self):
        return {
            "payer": self.payer.username,
            "payee": self.payee.username,
            "timestamp": self.timestamp.strftime("%b %d  %Y, %I:%M %p"),
            "type": self.type,
            "amount": self.amount
        }