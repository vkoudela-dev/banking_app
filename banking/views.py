from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.db.models import Value
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json, decimal

from .models import *



# Create your views here.
def index(request):
    return render(request, "banking/index.html")

@csrf_exempt
def register(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        first_name = data.get("firstname")
        last_name = data.get("lastname")
        email = data.get("email")
        password = data.get("password")

        # Try to create a new user
        try:
            user = User.objects.create_user(username, email, password)
            user.first_name = first_name
            user.last_name = last_name
            user.save()
        except IntegrityError:
            return JsonResponse({"msg": "Username already taken!"}, status=400)
        
        # Try to create a new account
        user_instance = User.objects.get(username=user)
        try:
            Account.objects.get_or_create(user=user_instance)
        except IntegrityError:
            return JsonResponse({"msg": "Account cannot be created"}, status=400)

        login(request, user)
        return JsonResponse({"msg": "Registered successfully!"}, status=201)
    
    else:
        return render(request, "index")

#  Log in user
@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        # Validate user's name
        try:
            user = User.objects.get(username=username) 
        except User.DoesNotExist:
            return JsonResponse({"msg": "Cannot find such user!"}, status=400)

        #  Check if the account wasn't closed
        account = Account.objects.get(user=user)
        if account.is_active == False:
            return JsonResponse({"msg": "Account doesn't exist!"}, status=400)

        # Validate password and log in if correct
        if authenticate(request, username=username, password=password):
            login(request, user)
            return JsonResponse({"msg": "Logged in succesfully!"}, status=201)
        else:
            return JsonResponse({"msg": "Wrong password!"})

    else:
        return render(request, "index")

# Select all users' transactions
def load_transactions(request):
    user_instance = User.objects.get(username=request.user)
    user = user_instance.username
    account = Account.objects.get(user=request.user)
    transactions = Transaction.objects.filter(payer=request.user).annotate(type=Value('withdrawal')).union(Transaction.objects.filter(payee=request.user).annotate(type=Value('deposit'))).order_by('-timestamp')
    
    transactions = [transaction.serialize() for transaction in transactions]

    context = {
        'user': user,
        'balance': account.balance,
        'transactions': transactions
    }
    
    return JsonResponse(context)

#  Request loan
@csrf_exempt
def loan(request):
    if request.method == 'PUT':
        data = json.loads(request.body)
        loan = decimal.Decimal(data.get('loan'))
        if loan > 0:
            payer = User.objects.get(username='banking')
            transaction = Transaction.objects.create(payee=request.user, payer=payer, amount=loan)

            if transaction:
                # Update payee's balance
                payee_account_instance = Account.objects.get(user=request.user)
                new_balance = payee_account_instance.balance + loan
                payee_account_instance.balance = new_balance
                payee_account_instance.save()

            return load_transactions(request)
        else:
            return JsonResponse({'msg': 'The amount must be a positive number'})

#  Request transfer
@csrf_exempt
def transfer(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        amount = decimal.Decimal(data.get('amount'))
        payee = data.get('payee')
        # Verify payer's input - Transfer to
        try:
            payee_instance = User.objects.get(username=payee)
        except User.DoesNotExist:
            return JsonResponse({"msg": "Such payee does not exist! Try again!"}, status=400)

        # Check payer's balance
        payer_account_instance = Account.objects.get(user=request.user)
        payer_balance = payer_account_instance.balance

        if payer_balance >= amount:
            # Check payer's input - Amount
            if amount > 0:
                with transaction.atomic():
                    payer = User.objects.get(username=request.user)
                    Transaction.objects.create(payer=payer, payee=payee_instance, amount=amount)

                    #  Update payee's balance
                    payee_account_instance = Account.objects.get(user=payee_instance)
                    payee_account_instance.balance += amount
                    payee_account_instance.save()

                    #  Update payer's balance
                    payer_account_instance.balance -= amount
                    payer_account_instance.save()
                    
                    return JsonResponse({"msg": "Transaction successfully created"}, status=200)
            else:
                JsonResponse({"msg": "The amount must be a positive number!"}, status=400)
        else:
            return JsonResponse({"msg": "Unfortunately, you don't have enough money in your account!"}, status=400)

# Close account
@csrf_exempt
def close(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_input = data.get('user')
        password = data.get('password')
        user = User.objects.get(username=request.user)

        #  Compare user's input(username) with database
        if user.username != user_input:
            return JsonResponse({"msg": "User is incorrect! Please, type in the user correctly."}, status=400)

        if authenticate(request, username=user_input, password=password):
            Account.objects.filter(user=user).update(is_active=False)
            return JsonResponse({"msg": "Account closed successfully"}, status=200)
        else:
            return JsonResponse({"msg": "Password doesn't match!"}, status=400)

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))