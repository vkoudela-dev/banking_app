from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('banking/register', views.register, name="register"),
    path('banking/login', views.login_view, name="login"),
    path('banking/logout', views.logout_view, name="logout"),

    # API Routes
    path('banking/transactions', views.load_transactions, name="transactions"),
    path('banking/loan', views.loan, name="loan"),
    path('banking/transfer', views.transfer, name="transfer"),
    path('banking/close', views.close, name="close")
]