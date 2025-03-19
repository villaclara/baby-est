import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { interval, map, Subject, Subscription, takeUntil, timer } from 'rxjs';
import { TimerCounterPipe } from '../../pipes/timer-counter.pipe';
import { KidActivity } from '../../models/kid-activity';
import { ActivityNameTranslator } from '../../utils/activity-name-translator';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateConverter } from '../../utils/date-converter';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-main-timer',
  standalone: true,
  imports: [CommonModule, TimerCounterPipe, NgIf, FormsModule],
  templateUrl: './main-timer.component.html',
  styleUrl: './main-timer.component.css',
  providers: [DateConverter],
  animations: [
    trigger('slideIn', [                // name of animation and trigger
      transition(':enter', [            // animation when the some condition (state) is met. ':enter' - when *ngIf= true
        style({                         // the style what is BEFORE
          // transform: 'translateY(-20px)', // Starting position (off-screen)
          opacity: 0
        }),
        animate('300ms ease-in', style({ opacity: 1, 
          // transform: 'translateY(0)' 
        }))   // animation: has time and the style what is AFTER
      ]),
      transition(':leave', [         // ':leave' - when *ngIf = false. 
        animate('200ms ease-out', style({ opacity: 0, 
          // transform: 'translateY(-20px)'
         }))  // animation - return to default state
      ])
      // ,
      // transition('false <=> true', [
      //   animate('0.5s ease-in-out') // Duration and easing
      // ])
    ]),

    trigger('moveDown', [
      state('initial',            // animation when the some condition (state) is met. ':enter' - when *ngIf= true
        style({                         // the style what is BEFORE
          'margin-top': '-30%',
          opacity: 0 // Starting position (off-screen)
        })),
      state('moved',
        style({                         // the style what is BEFORE
          'margin-top': '0',
          opacity: 1
        })),
        transition('initial => moved', [
          animate('150ms',
            keyframes([
              style({'margin-top' : '-30%', opacity: 0, }),
              style({'margin-top' : '-20%', opacity: 0, }),
              style({'margin-top' : '-10%', opacity: 0, }),
              style({'margin-top' : '0', opacity: 1, })

            ]))]),
        transition('moved => initial', [
              animate('0.1s',
                keyframes([
                  style({'margin-top' : '0', opacity: 1, }),
                  style({'margin-top' : '-10%', opacity: 0, }),
                  style({'margin-top' : '-20%', opacity: 0, }),
                  style({'margin-top' : '-30%', opacity: 0, })
                ]))
      ])
      // transition(':enter', [
      //   style({ transform: 'translateY(0)' }), // Starting position
      //   animate('300ms ease-in', style({ transform: 'translateY(50px)' })) // Move items down when new element appears
      // ]),
      // transition(':leave', [
      //   animate('300ms ease-out', style({ transform: 'translateY(0)' })) // Reset position when leaving
      // ]),
    ]),

    trigger('playIconAnim', [
      state('defaultSize',            // animation when the some condition (state) is met. ':enter' - when *ngIf= true
        style({                         // the style what is BEFORE
          transform : 'scale(1)' // Starting position (off-screen)
        })),
      state('smallerSize',
        style({                         // the style what is BEFORE
          transform : 'scale(1)'
        })),
        transition('defaultSize => smallerSize', [
          animate('150ms',
            keyframes([
              style({transform : 'scale(0.9)' }),
              style({transform : 'scale(0.8)' }),
              style({transform : 'scale(0.9)' }),
            ])
          )
        ])
      ])

  ]
})

export class MainTimerComponent implements OnChanges, OnDestroy {

  constructor(private dateConverter : DateConverter) {

  }
  private translator: ActivityNameTranslator = new ActivityNameTranslator();

  @Output() newKidActivity: EventEmitter<KidActivity> = new EventEmitter<KidActivity>();
  // @Input() currentActivity: KidActivity = { ActivityType: '', Id: 0, KidName: '', StartDate: undefined, EndDate: undefined, IsActiveNow: false };
  @Input() currentActivity!: KidActivity;


  isRunningTimer: boolean = false;
  startStopImageLink: string = this.isRunningTimer ? '../../../assets/img/stop_icon.png' : '../../../assets/img/play_icon.png';

  timerDone$: Subject<boolean> = new Subject<boolean>();
  timePassed: number = 0;
  timePass$ = timer(1, 1000).pipe(map(n => (this.timePassed + n) * 1000));

  currentActivityNameUA: string = 'Чіл';
  isEatingSelected: boolean = false;
  
  isEditingActivityTimes: boolean = false;
  
  nowDateStartActivityInputTime: string = '';
  nowDateEndActivityInputTime: string = '';
  

  timerSub: Subscription = new Subscription();

  moveActTypeAnimation: string = 'initial';   // animation for Play/Stop icons to Move down-up

  playIconAnimation: string = 'defaultSize';

  // When the parent has set CurrentActivity property (in Http get) we want to display actual values of timer etc.
  ngOnChanges(changes: SimpleChanges): void {
    
    // Only refresh values if the changes is CurrentActivity object.
    if(changes['currentActivity'])
    {
      if(this.timerSub)
      {
        this.timerSub.unsubscribe();
      }

      if (this.currentActivity.IsActiveNow == true) {
        let timeDiff = new Date().getTime() - new Date(this.currentActivity.StartDate!).getTime();
        this.timePassed = Math.floor(timeDiff / 1000);
        this.isRunningTimer = true;
        this.timerSub = timer(1, 1000).pipe(takeUntil(this.timerDone$)).subscribe(() => this.timePassed += 1);
        this.startStopImageLink = '../../../assets/img/stop_icon.png';
        this.currentActivityNameUA = this.translator.changeCurrentActivityNameUA(this.currentActivity.ActivityType);
        
        this.nowDateStartActivityInputTime = this.dateConverter.toHHmmString(this.currentActivity.StartDate!);
        // if ANY eating we set the IsEatingSelected to True
        this.isEatingSelected = this.currentActivity.ActivityType.toLowerCase() != 'sleeping'
        && this.currentActivity.ActivityType != ''
        ? true
        : false;

        this.moveActTypeAnimation = this.currentActivity.ActivityType.toLowerCase() != '' ? 'moved' : 'initial'
      }

      else
      {
        this.startStopImageLink = '../../../assets/img/play_icon.png';

      }
    }

  }


  ngOnDestroy(): void {
    this.timerDone$.unsubscribe();
  }

  startSelectEatingType(): void {
    this.isEatingSelected = !this.isEatingSelected;

    // Because we want to remove highlight from Sleeping (if it was selected before) as soon as we press 'Eating'.
    // Also we disable the 'Play' button if only pressed 'Eating' without specifying exact type.
    this.currentActivity.ActivityType = '';
    this.moveActTypeAnimation = 'initial';  //idk why, but it should be present here to hide the Play icon on second click on eating
  }

  selectActivity(actType: string): void {

    // Second click on Sleeping removing the highlight.
    if (this.currentActivity.ActivityType.toLowerCase() == 'sleeping' && actType.toLowerCase() == 'sleeping') {
      this.currentActivity.ActivityType = '';
    }
    // Normal behavior
    else {
      this.currentActivity.ActivityType = actType;
    }

    // Highlight proper activity type.
    this.isEatingSelected = this.currentActivity.ActivityType.toLowerCase() != 'sleeping'
      && this.currentActivity.ActivityType != ''
      ? true
      : false;
    


      this.moveActTypeAnimation = this.currentActivity.ActivityType.toLowerCase() != '' ? 'moved' : 'initial';
  }

  startActivity(): void {


    this.playIconAnimation = 'smallerSize';

      

    // When timer is stopped.
    // When we want to start activity and send the currentActivity to api.
    if (!this.isRunningTimer) {
      // Start the timer
      this.timerSub = interval(1000).pipe(takeUntil(this.timerDone$)).subscribe(() => this.timePassed += 1);
      this.timePassed = 0;
      this.isRunningTimer = true;

      // Set current Activity and Start tracking the activity
      this.nowDateEndActivityInputTime = '';
      this.currentActivity.StartDate = new Date();
      this.currentActivity.IsActiveNow = true;
      this.currentActivityNameUA = this.translator.changeCurrentActivityNameUA(this.currentActivity.ActivityType);

      this.nowDateStartActivityInputTime = this.dateConverter.toHHmmString(this.currentActivity.StartDate);

      // Send the info to the parent to send to Api.
      // Parent decides wheter to add or update activity.
      this.newKidActivity.emit(this.currentActivity);

      setTimeout(() => {
      this.startStopImageLink = '../../../assets/img/stop_icon.png';
        this.playIconAnimation = 'defaultSize';
      }, 300);
    }

    // When timer is running.
    // When we want to stop activity and send the FULL activity to api.
    else {
      // Stop the timer
      this.timerDone$.next(true);
      this.startStopImageLink = '../../../assets/img/play_icon.png';
      this.isRunningTimer = false;
      this.isEatingSelected = false;
      this.isEditingActivityTimes = false;

      
      // Stop tracking. Set StartDate
      // The input value will be used, if not changed the input should display the this.currentActivity.StartDate
      let origStartDate = new Date(this.currentActivity.StartDate!);
      const [hours, minutes] = this.nowDateStartActivityInputTime.split(':').map(Number);

      origStartDate.setHours(hours);
      origStartDate.setMinutes(minutes);
      this.currentActivity.StartDate = origStartDate;

      // Stop tracking current Activity. Set EndDate
      if (this.nowDateEndActivityInputTime != '') {
        // let y = new Date().getFullYear();
        // let m = new Date().getMonth() < 9 ? "0" + (new Date().getMonth() + 1) : new Date().getMonth();
        // let d = new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate();
        // let ddd = y + "-" + m + "-" + d + "T" + this.nowDateEndActivityInputTime + ":00";
        // this.currentActivity.EndDate = new Date(ddd);
        this.currentActivity.EndDate = this.dateConverter.toDate(this.nowDateEndActivityInputTime);
      }
      else {
        this.currentActivity.EndDate = new Date();
      }


      this.currentActivity.IsActiveNow = false;
      this.currentActivityNameUA = 'Чіл';
      this.timePassed = 0;

      this.moveActTypeAnimation = 'initial';
      // Send the info to the parent to send to Api.
      // Parent decides wheter to add or update activity.
      this.newKidActivity.emit(this.currentActivity);

      // Reset this.currentActivity
      // this.currentActivity = { 
      //   ActivityType : '', 
      //   Id : 0, 
      //   KidName : '', 
      //   EndDate : undefined, 
      //   StartDate : undefined, 
      //   IsActiveNow : false 
      // };

        this.playIconAnimation = 'defaultSize';
    }

   
  }


  
}
