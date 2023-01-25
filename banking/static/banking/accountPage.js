'use strict';
import * as helpers from './helpers.js';

const header = document.querySelector('.header');
const transactionDiv = document.createElement('div');
let transactions;


// Prepare the account page
export const startPage = function () {
  header.style.height = '200px';
  const sectionAccount = document.createElement('div');
  sectionAccount.className = 'sectionAccount';
  header.insertAdjacentElement('afterend', sectionAccount);
  const balanceValue = createStructure(sectionAccount);
  showTransactions(balanceValue);
};

//  Create structure of the page
function createStructure(section) {
  // Create grid
  const mainContainer = document.createElement('div');
  mainContainer.className = 'main';

  // Balance div
  const now = new Date();
  const currentDate = new Intl.DateTimeFormat('en-US').format(now);

  const balance = document.createElement('div');
  balance.className = 'balance';
  const balanceDiv1 = document.createElement('div');
  const balanceLabel = document.createElement('p');
  balanceLabel.className = 'balance_label';
  balanceLabel.textContent = 'Current balance';
  const balanceDate = document.createElement('p');
  balanceDate.className = 'balance_date';
  balanceDate.textContent = `As of ${currentDate}`;
  const balanceDiv2 = document.createElement('div');
  const balanceValue = document.createElement('p');
  balanceValue.className = 'balance_value';

  balanceDiv1.appendChild(balanceLabel);
  balanceDiv1.appendChild(balanceDate);
  balanceDiv2.appendChild(balanceValue);
  balance.appendChild(balanceDiv1);
  balance.appendChild(balanceDiv2);

  // Summary div
  const summary = document.createElement('div');
  summary.className = 'summary';
  const summaryLabelIn = document.createElement('p');
  summaryLabelIn.className = 'summary_label';
  summaryLabelIn.textContent = 'In';
  const summaryValueIn = document.createElement('p');
  summaryValueIn.className = 'summary_value_in';
  const summaryLabelOut = document.createElement('p');
  summaryLabelOut.className = 'summary_label';
  summaryLabelOut.textContent = 'Out';
  const summaryValueOut = document.createElement('p');
  summaryValueOut.className = 'summary_value_out';
  const btnSort = document.createElement('button');
  btnSort.className = 'btn_sort';
  btnSort.textContent = '↓ Sort';

  summary.appendChild(summaryLabelIn);
  summary.appendChild(summaryValueIn);
  summary.appendChild(summaryLabelOut);
  summary.appendChild(summaryValueOut);
  summary.appendChild(btnSort);

  // Transfer div
  const transfer = document.createElement('div');
  transfer.className = 'operation';
  transfer.classList.add('operation_transfer');
  transfer.innerHTML = '<h2>Transfer money</h2>'
  const form1 = document.createElement('form');
  form1.className = 'form';
  form1.innerHTML = '<input type="text" class="form_input form_input_to"><input type="number" class="form_input form_input_amount"><button class="form_btn form_btn_transfer">→</button><label class="form_label">Transfer to</label><label class="form_label">Amount</label>';
  transfer.appendChild(form1);

  // Loan div
  const loan = document.createElement('div');
  loan.className = 'operation';
  loan.classList.add('operation_loan');
  loan.innerHTML = '<h2>Request loan</h2>';
  const form2 = document.createElement('form');
  form2.className = 'form';
  form2.innerHTML = '<input type="number" class="form_input form_input_loan"><button class="form_btn form_btn_loan">→</button><label class="form_label form_label_loan">Amount</label>';
  loan.appendChild(form2);
  
  // Close account div
  const close = document.createElement('div');
  close.className = 'operation';
  close.classList.add('operation_close');
  close.innerHTML = '<h2>Close account</h2>';
  const form3 = document.createElement('form');
  form3.className = 'form';
  form3.innerHTML = '<input type="text" class="form_input form_input_user"><input type="password" class="form_input form_input_password"><button class="form_btn form_btn_close">→</button><label class="form_label">Confirm user</label><label class="form_label">Confirm password</label>';
  close.appendChild(form3);

  // Add divs into the page structure
  mainContainer.appendChild(balance);
  mainContainer.appendChild(summary);
  mainContainer.appendChild(transfer);
  mainContainer.appendChild(loan);
  mainContainer.appendChild(close);
  section.appendChild(mainContainer);

  // Add eventListeners
  document.querySelector('.form_btn_loan').addEventListener('click', (e) => {
    e.preventDefault();
    requestLoan();
  });
  document.querySelector('.form_btn_transfer').addEventListener('click', (e) => {
    e.preventDefault();
    makeTransfer();
  })
  document.querySelector('.btn_sort').addEventListener('click', (e) => {
    e.preventDefault();
    transactionDiv.innerHTML = '';
    sortTransactions();
    transactions.forEach((transaction, i) => helpers.createTransactionDivs(transaction, transactionDiv, i))
  })
  document.querySelector('.form_btn_close').addEventListener('click', (e) => {
    e.preventDefault();
    closeAccount();
  })

  return balanceValue;
}

async function showTransactions (balanceValue) {

   await fetch('/banking/transactions')
  .then((response) => response.json())
  .then((JsonResponse) => {
    balanceValue.textContent = `$ ${JsonResponse.balance}`

    transactions = JsonResponse.transactions;
    const balance = JsonResponse.balance;

    const container = document.querySelector('.main');
    transactionDiv.className = 'movements';
    container.appendChild(transactionDiv);
    
    // Display No transactions if database empty
    if (transactions.length === 0) {
      transactionDiv.textContent = "No transactions";
      return;
    };

    // Create rows for each transaction
    transactions.forEach((transaction, i) => helpers.createTransactionDivs(transaction, transactionDiv, i))
  });

  // Populate summary fields
  const sumIn = helpers.summary(transactions, 'deposit');
  const sumOut = helpers.summary(transactions, 'withdrawal');
  helpers.insertSummary(sumIn, sumOut);
}

function requestLoan () {
  const loan = document.querySelector('.form_input_loan').value;

  if(loan > 0) {
    fetch('/banking/loan', {
      method: 'PUT',
      body: JSON.stringify({
        loan: loan
      })
    })
    .then(location.reload());
  } else {
    helpers.displayMsg(header, "The amount must be a positive number!");
  }
}

function makeTransfer () {
  const amount = document.querySelector('.form_input_amount').value;
  const payee = document.querySelector('.form_input_to').value;

  // Verify Transfer To input
  if (payee === "") return helpers.displayMsg (header, "Payee must be specified!");

  // Verify Amount input, proceed with fetch request if amount a positive number
  if (amount > 0) {
    fetch('/banking/transfer', {
      method: 'POST',
      body: JSON.stringify({
        amount: amount,
        payee: payee
      })
    })
    .then((response) => Promise.all([response.status, response.json()]))
    .then(([status, msg]) => {      
      if (status === 200) {
        helpers.displayMsg(header, msg.msg, status);
        setTimeout(() => {
        location.reload()}, 4000);
        return};

      helpers.displayMsg(header, msg.msg);
    });
  } else {
    return helpers.displayMsg (header, "The amount must be a positive number!")
  }
}

// Sort transaction rows from the greatest to the lowest number
function sortTransactions () {
  const deposits = transactions.map((transaction) => (transaction.type === 'deposit') && transaction).filter((val) => val != false).sort((a, b) => Number(b.amount) - Number(a.amount));
  const withdrawals = transactions.map((transaction) => (transaction.type === 'withdrawal') && transaction).filter((val) => val != false).sort((a, b) => Number(a.amount) - Number(b.amount));
  transactions = [...deposits, ...withdrawals];

  return transactions
}

function closeAccount () {
  const user = document.querySelector('.form_input_user').value;
  const password = document.querySelector('.form_input_password').value;

  (!user || !password) && helpers.displayMsg(header, "Please fill out all fields");

  fetch('./banking/close', {
    method: 'POST',
    body: JSON.stringify({
      user: user,
      password:password
    })
  })
  .then(response => Promise.all([response.status, response.json()]))
  .then(([status, JsonResponse]) => {
    helpers.displayMsg(header, JsonResponse.msg, status);
    if (status === 200) {
      const logout = document.querySelector('.logout');
      setTimeout(() => {
        logout.click()}, 3000)
    }
  })
}