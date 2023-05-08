'use strict';

// Displaying messages
export function displayMsg (header, msg, status) {
    const msgDiv = document.querySelector('.msg');
    msgDiv && msgDiv.remove();

    const message = document.createElement('p');
    message.className = 'msg';
    (status === 200) && message.classList.add('msg_true');
    message.textContent = msg;
    header.insertAdjacentElement('beforeend', message)
}

// Display all transactions
export function createTransactionDivs (transaction, transactionDiv, i) {
        
  const transactionRow = document.createElement('div');
  transactionRow.className = 'movements-row';
  transaction.type === 'deposit' ? transactionRow.classList.add('movements-row-deposit') : transactionRow.classList.add('movements-row-withdrawal')
  ;
  const transactionTypeDiv = document.createElement('div');
  transactionTypeDiv.className = 'movements-type';
  transaction.type === 'deposit' ? transactionRow.classList.add('movements-row-deposit') : transactionRow.classList.add('movements-row-withdrawal')
  ;
  transactionTypeDiv.innerHTML = `${i+1}. ${transaction.type === 'deposit' ? "Sent from" : "Sent to"} <span>${transaction.type === 'deposit' ? transaction.payer : transaction.payee}</span> on ${transaction.timestamp}`;
  const transactionValue = document.createElement('div');
  transactionValue.className = 'movements-value';
  transactionValue.textContent = `${transaction.type === 'deposit' ? "$" : "- $"}${transaction.amount}`;
  // Append children
  transactionRow.appendChild(transactionTypeDiv);
  transactionRow.appendChild(transactionValue);
  transactionDiv.appendChild(transactionRow);
};

//  Count positive or negative transactions
export function summary (transactions, type) {
  const sum = transactions.map((transaction) => transaction.type === type ? Number(transaction.amount) : 0).reduce((acc, cur) => {return acc + cur}, 0);
  return sum;
};

//  Insert sums values into IN and OUT fields
export function insertSummary (sumIn, sumOut) {
  const inDiv = document.querySelector('.summary_value_in');
  const outDiv = document.querySelector('.summary_value_out');
  inDiv.innerText = `$${sumIn}`;
  outDiv.innerText = `$${sumOut}`;
}
