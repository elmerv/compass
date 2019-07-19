import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

/** Displays the date and time in the main dashboard view. */
@Component({
  selector: 'app-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateTimeComponent implements OnInit {

  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current time. */
  @Input() time: Date;

  // --------------- LOCAL UI STATE ----------------------
 

  constructor() { }

  ngOnInit() {
    console.log(this.time);
  }

  // --------------- DATA BINDING FUNCTIONS --------------

  /** Function to determine which suffix */
  calcSuffix(day) {
    if (day > 3 && day < 21) return 'th'; 
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  }

  // --------------- EVENT BINDING FUNCTIONS -------------



  // --------------- OTHER -------------------------------
}
