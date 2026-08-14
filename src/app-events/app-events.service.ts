import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { AppEvent } from './models/app-event';

@Injectable()
export class AppEventsService {
  private readonly eventsSubject = new Subject<AppEvent>();

  readonly events$: Observable<AppEvent> = this.eventsSubject.asObservable();

  emit(event: AppEvent): void {
    this.eventsSubject.next(event);
  }
}
