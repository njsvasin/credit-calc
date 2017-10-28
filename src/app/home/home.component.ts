import { Component } from '@angular/core';

import { AppState } from '../app.service';
import { Payments } from './payments';
import { Payment } from './payments/payment';
import { round } from './math';


@Component({
  selector: 'home',
  providers: [
    Payments
  ],
  styleUrls: [ './home.component.styl' ],
  templateUrl: './home.component.pug'
})
export class HomeComponent {
  public localState = { value: '' };

  amount: string;
  interest: string;
  term: string;

  monthlyPayment: string;
  allInterestsPayments: string;
  totalAmount: string;

  payments: Payment[];

  constructor(
    public appState: AppState,
    private paymentsService: Payments,
  ) {}

  calc() {
    const amount = parseFloat(this.amount);
    const annualInterest = parseFloat(this.interest) / 100;
    const i = annualInterest /12;
    const n = parseFloat(this.term) * 12;

    // const annuityRatio = i / (1 - Math.pow(1 + i, -(n-1)) );
    const annuityRatio = i * Math.pow((1 + i), n) / (Math.pow(1 + i, n) - 1);

    const monthlyPayment = round(annuityRatio * amount);

    if (isFinite(monthlyPayment)) {
      this.monthlyPayment = String(monthlyPayment);
      this.allInterestsPayments = String(monthlyPayment * n -  amount);
      this.totalAmount = String(monthlyPayment * n);

      this.payments = this.paymentsService.calcPayments(amount, annualInterest, monthlyPayment, n);
    } else {
      this.monthlyPayment = null;
      this.allInterestsPayments = null;
      this.totalAmount = null;
    }
  }
}
