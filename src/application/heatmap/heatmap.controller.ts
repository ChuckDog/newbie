import {Controller, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiQuery} from '@nestjs/swagger';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {UserService} from '@microservices/account/user/user.service';

@ApiTags('Heatmap')
@ApiBearerAuth()
@Controller('heatmap')
export class HeatmapController {
  constructor(
    private readonly coachService: UserService,
    private readonly availabilityTimeslotService: AvailabilityTimeslotService
  ) {}

  @Get('coach-availability')
  @ApiQuery({name: 'venueId', type: 'number'})
  @ApiQuery({name: 'year', type: 'number'})
  @ApiQuery({name: 'month', type: 'number'})
  @ApiQuery({name: 'classId', type: 'number'})
  async getCoachAvailabilityHeatmap(
    @Query()
    query: {
      venueId: number;
      year: number;
      month: number;
      classId: number;
    }
  ) {
    // [step 1] Get coaches in the location.
    const coaches = await this.coachService.findMany({
      where: {profile: {venueIds: {has: query.venueId}}},
    });

    // [step 2] Get timeslots of the coaches in the month.
    const timeslots = await this.availabilityTimeslotService.findMany({
      where: {
        hostUserId: {
          in: coaches.map(coach => {
            return coach.id;
          }),
        },
        year: query.year,
        month: query.month,
      },
    });

    // [step 3] Count coaches for each timeslot.
    const heatmapPoints: {
      year: number;
      month: number;
      dayOfMonth: number;
      hour: number;
      minute: number;
      minutesOfDuration: number;
      count: number;
    }[] = [];
    for (let i = 0; i < timeslots.length; i++) {
      const timeslot = timeslots[i];
      for (let j = 0; j < heatmapPoints.length; j++) {
        if (
          timeslot.year === heatmapPoints[j].year &&
          timeslot.month === heatmapPoints[j].month &&
          timeslot.dayOfMonth === heatmapPoints[j].dayOfMonth &&
          timeslot.hour === heatmapPoints[j].hour &&
          timeslot.minute === heatmapPoints[j].minute &&
          timeslot.minutesOfDuration === heatmapPoints[j].minutesOfDuration
        ) {
          heatmapPoints[j].count += 1;
        }
      }
      heatmapPoints.push({
        year: timeslot.year!,
        month: timeslot.month!,
        dayOfMonth: timeslot.dayOfMonth!,
        hour: timeslot.hour!,
        minute: timeslot.minute!,
        minutesOfDuration: timeslot.minutesOfDuration!,
        count: 1,
      });
    }

    return heatmapPoints;
  }

  /* End */
}
