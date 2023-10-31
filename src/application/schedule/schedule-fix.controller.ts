import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {
  Event,
  EventContainerNoteType,
  EventIssue,
  EventIssueStatus,
  EventIssueType,
} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {CoachService} from '../coach/coach.service';
import {EventContainerNoteService} from '@microservices/event-scheduling/event-container-note.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventFixController {
  constructor(
    private readonly eventService: EventService,
    private readonly eventIssueService: EventIssueService,
    private readonly eventContainerService: EventContainerService,
    private readonly eventContainerNoteService: EventContainerNoteService,
    private readonly coachService: CoachService
  ) {}

  @Get(':eventContainerId/fix')
  async fixEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Query('weekOfMonth') weekOfMonth: number
  ) {
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
    });
    // Get events.
    const events = await this.eventService.findMany({
      where: {
        containerId: eventContainerId,
        year: container.year,
        month: container.month,
        weekOfMonth,
      },
      include: {issues: {where: {status: EventIssueStatus.UNREPAIRED}}},
    });

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      for (let j = 0; j < event['issues'].length; j++) {
        const issue = event['issues'][j];
        switch (issue.type) {
          case EventIssueType.ERROR_COACH_NOT_EXISTED:
          case EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_TIME:
          case EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_TYPE:
          case EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_VENUE:
            await this.fixIssue(event, issue);
        }
      }
    }
  }

  async fixIssue(event: Event, issue: EventIssue) {
    const coaches = await this.coachService.getSortedCoachesForEvent(event);
    if (coaches.length > 0) {
      await this.eventService.update({
        where: {id: event.id},
        data: {hostUserId: coaches[0].id},
      });

      await this.eventIssueService.update({
        where: {id: issue.id},
        data: {status: EventIssueStatus.REPAIRED},
      });

      await this.eventContainerNoteService.create({
        data: {
          type: EventContainerNoteType.SYSTEM,
          description:
            'Coach changed: ' + event.hostUserId + ' -> ' + coaches[0].email,
          containerId: event.containerId,
        },
      });
    }
  }

  /* End */
}
