import {Controller, Post, Body, BadRequestException} from '@nestjs/common';
import {ApiTags, ApiBody} from '@nestjs/swagger';
import {Prisma, User} from '@prisma/client';
import {UserService} from '../../microservices/user/user.service';
import {Public} from './authentication/public/public.decorator';
import {
  verifyEmail,
  verifyPassword,
  verifyPhone,
  verifyUsername,
} from '../../toolkit/validators/user.validator';

@ApiTags('[Application] Account')
@Controller('account')
export class AccountSignupController {
  constructor(private readonly userService: UserService) {}

  /**
   * Sign up by:
   * [1] username: password is required
   * [2] email: password is optional
   * [3] phone: password is optional
   *
   * [Constraint] 'password' is required if neither email nor phone is provided.
   */
  @Public()
  @Post('signup')
  @ApiBody({
    description:
      "The request body should contain at least one of the three attributes ['username', 'email', 'phone']. If 'username' is contained, then 'password' is required, or 'password' is optional.",
    examples: {
      a: {
        summary: '1. Sign up with username',
        value: {
          username: 'henry',
          password: 'Abc1234!',
        },
      },
      b: {
        summary: '2. Sign up with email',
        value: {
          email: 'email@example.com',
        },
      },
      c: {
        summary: '3. Sign up with phone',
        value: {
          phone: '13960068008',
        },
      },
      d: {
        summary: '4. Sign up with profile',
        value: {
          profile: {
            prefix: 'Mr',
            firstName: 'Robert',
            middleName: 'William',
            lastName: 'Smith',
            suffix: 'PhD',
            dateOfBirth: '2019-05-27',
          },
        },
      },
    },
  })
  async signup(
    @Body()
    body: Prisma.UserCreateInput
  ): Promise<User> {
    let usernameCount = 0;
    let emailCount = 0;
    let phoneCount = 0;
    let profileCount = 0;

    // [step 1] Validate parameters.
    if (body.password) {
      if (!verifyPassword(body.password)) {
        throw new BadRequestException(
          'Your password is not strong enough. (length >= 8, lowercase >= 1, uppercase >= 1, numbers >= 1, symbols >= 1)'
        );
      } else {
        // Go on validating...
        usernameCount += 1;
      }
    }

    if (body.username) {
      if (!verifyUsername(body.username)) {
        throw new BadRequestException('Your username is not valid.');
      } else {
        // Go on validating...
        usernameCount += 1;
      }
    }

    if (body.email) {
      if (!verifyEmail(body.email)) {
        throw new BadRequestException('Your email is not valid.');
      } else {
        // Go on validating...
        emailCount += 1;
      }
    }

    if (body.phone) {
      if (!verifyPhone(body.phone)) {
        throw new BadRequestException('Your phone is not valid.');
      } else {
        // End of validating.
        phoneCount += 1;
      }
    }

    if (body.profiles) {
      profileCount += 1;
    }

    // [step 2] Check account existence.
    const users = await this.userService.findMany({
      where: {
        OR: [
          {username: body.username},
          {email: body.email},
          {phone: body.phone},
        ],
      },
    });
    if (users.length > 0) {
      throw new BadRequestException('Your username exists.');
    }

    // [step 3] Create(Sign up) a new account.
    if (
      usernameCount === 2 ||
      emailCount === 1 ||
      phoneCount === 1 ||
      profileCount === 1
    ) {
      // Generate password hash if needed.
      return await this.userService.create({
        data: body,
        select: {
          id: true,
          email: true,
          phone: true,
          username: true,
          status: true,
          profiles: true,
        },
      });
    } else {
      throw new BadRequestException('Your parameters are invalid.');
    }
  }

  /* End */
}
