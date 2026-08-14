import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { map, Observable } from 'rxjs';
import { AppEventsService } from 'src/app-events/app-events.service';
import { appEventSchema } from 'src/app-events/models/app-event';

@Controller('sse')
export class SseController {
  constructor(private readonly appEventsService: AppEventsService) {}

  @Sse()
  @ApiOperation({
    summary: 'Subscribe to application events',
  })
  @ApiResponse({
    status: 200,
    description: 'Server-Sent Events stream',
    content: {
      'text/event-stream': {
        schema: appEventSchema,
      },
    },
  })
  stream(): Observable<MessageEvent> {
    return this.appEventsService.events$.pipe(
      map(({ type, data }) => ({
        data: {
          type,
          data,
        },
      })),
    );
  }
}
