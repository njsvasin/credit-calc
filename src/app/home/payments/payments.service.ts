import { Injectable } from '@angular/core';

import { Payment } from './payment';
import { round } from '../math';

@Injectable()
export class Payments {
  public calcPayments(amount, interest, monthlyPayment, term):Payment[] {
    let result:Payment[] = [];

    let interestRepayment;
    let principalRepayment;
    let principalBalance = amount;

    for (let i = 0; i < term -1 ; i++ ) {
      interestRepayment = round( principalBalance * interest / 12);
      principalRepayment = round(monthlyPayment - interestRepayment);
      principalBalance = round(principalBalance - principalRepayment);

      result.push({
        monthlyPayment,
        interestRepayment,
        principalRepayment,
        principalBalance,
      });
    }

    // last payment
    interestRepayment = round(principalBalance * interest / 12);
    principalRepayment = round(principalBalance);
    principalBalance = round(principalBalance - principalRepayment);

    result.push({
      monthlyPayment: interestRepayment + principalRepayment,
      interestRepayment,
      principalRepayment,
      principalBalance,
    });

    return result;
  }
}
