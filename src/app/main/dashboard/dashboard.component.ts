import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../../core/store/app.reducer';
import * as fromAuth from '../../core/store/auth/auth.reducer';
import { FirebaseService } from '../../core/firebase/firebase.service';
import { firestore } from 'firebase/app';
import { Observable, timer, merge, of, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { mergeMap, tap, map, withLatestFrom, take, takeUntil, timestamp } from 'rxjs/operators';

import { DashboardState } from './+state/dashboard.state';
import { DashboardSelectors } from './+state/dashboard.state.selectors';

import { LoadData, Cleanup } from './+state/dashboard.state.actions';
import { RouterNavigate } from '../../core/store/app.actions';

import { User, SetupType } from '../../core/store/user/user.model';
import { CalendarEvent } from '../../core/store/calendar-event/calendar-event.model';
import { WeekGoal } from '../../core/store/week-goal/week-goal.model';
import { QuarterGoal } from '../../core/store/quarter-goal/quarter-goal.model';
import { WeekGoalWithEvents, UpcomingEventsData, WeekGoalProgress, QuarterDates } from './+state/dashboard.model';
import { startOfWeek, endOfTomorrow, endOfToday, timestampAfterMilliseconds } from '../../core/utils/date.utils';

/** The day-to-day view for compass. */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {

  // --------------- ROUTE PARAMS & CURRENT USER ---------
  
  /** The currently signed in user. */
  currentUser$: Observable<User> = this.store.pipe(select(fromAuth.selectUser));

  /** The beginning of the current week. */
  startOfWeek$: Observable<Date> = of(new Date()).pipe(
    mergeMap(date => {

      const beginning = startOfWeek(date);
      const delayTillNextWeek = beginning.getTime() + 604800000 - date.getTime() + 10;

      return merge(
        of(startOfWeek(date)),
        timer(delayTillNextWeek, 604800000).pipe(
          map(() => startOfWeek(new Date()))
        )
      );
    })
  );

  /** The current time, updated at the start of each minute. */
  time$: Observable<Date> = of(new Date()).pipe(
    mergeMap(date => {
      const seconds = date.getSeconds();
      const milliseconds = date.getMilliseconds();

      const delayTillNextMin = (59 - seconds) * 1000 + (1000 - milliseconds) + 10;

      return merge(
        of(date),
        timer(delayTillNextMin, 60*1000).pipe(
          map(() => new Date())
        )
      );
    })
  );

 
  // --------------- DB ENTITY DATA ----------------------

  // --------------- LOCAL UI STATE ----------------------

  activityTitle: string = 'Act It Out';
  text1: string = 'Facilitator picks a subject and each player finishes the following prompts about it: I like, I wish, I feel...';
  text2: string = 'A submission is projected and a random player is chosen to stand with their back to the screen.';
  text3: string = 'Based on clues from the team, the person must guess the answer, guess which prompt it is and who is the submitter.';
  imageURL1: string = 'placeholder';
  imageURL2: string = 'placeholder';
  imageURL3: string = 'placeholder';  

  // --------------- DATA BINDING STREAMS ----------------
  
  /** Whether it is time to reorient. */
  reorientType$: Observable<SetupType> = combineLatest(
    this.currentUser$,
    this.startOfWeek$
  ).pipe(
    map(([user, startOfWeek]) => {
      if (user.setupInProgress) {
        // If there is already setup in progress, then return the type
        return user.setupInProgress.type;
      } else {
        // Otherwise, check if we need to initiate a setup process
        // TODO: implement this logic. For now, just return undefined to indicate no setup needed
        return undefined;
      }
    })
  );

  // --------------- EVENT BINDING STREAMS ---------------

  // --------------- OTHER -------------------------------

  /** Unsubscribe observable for subscriptions. */
  unsubscribe$: Subject<void> = new Subject();

  constructor(
    private state: DashboardState,
    private route: ActivatedRoute, 
    private selectors: DashboardSelectors,
    private store: Store<fromStore.State>,
    private db: FirebaseService,
  ) { 
    // --------------- EVENT HANDLING ----------------------
    
  }

  ngOnInit() {
    // Once everything is set up, load the data for the role.
    this.currentUser$.pipe(
      withLatestFrom(this.startOfWeek$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([user, startOfWeek]) => {
      this.store.dispatch( new LoadData({ 
        currentUser: user,
        startOfWeek: startOfWeek
      }) );
    });
  }

  ngOnDestroy() {
    // Unsubscribe subscriptions.
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    // Unsubscribe from firebase connection from load and free up memoized selector values.
    this.store.dispatch( new Cleanup() );
    this.selectors.cleanup();
  }
}
