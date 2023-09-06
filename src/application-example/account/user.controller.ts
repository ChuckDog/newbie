import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {PermissionAction, Prisma, Role, User, UserStatus} from '@prisma/client';
import {UserService} from '@microservices/account/user/user.service';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {compareHash} from '@toolkit/utilities/common.util';
import {verifyUuid} from '@toolkit/validators/user.validator';
import {
  generatePaginationParams,
  generatePaginationResponse,
} from '@toolkit/pagination/pagination';

@ApiTags('Account / User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.User)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          email: '',
          phone: '',
          username: 'dispatcher',
          password: 'Abc1234!',
          status: UserStatus.ACTIVE,
          roles: [{id: '013f92b0-4a53-45cb-8eca-e66089a3919f'}],
        },
      },
    },
  })
  async createUser(
    @Body()
    body: Prisma.UserCreateInput & {roles?: Role[]}
  ): Promise<User> {
    const {roles, ...user} = body;
    const userCreateInput: Prisma.UserCreateInput = user;
    // Construct roles.
    if (roles && roles.length > 0) {
      userCreateInput.roles = {
        connect: roles,
      };
    }

    return await this.userService.create({
      data: userCreateInput,
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        profile: true,
      },
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.User)
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'roleId', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getUsers(
    @Query('name') name?: string,
    @Query('roleId') roleId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput | undefined;
    const whereConditions: object[] = [];
    if (name) {
      name = name.trim();
      if (name.length > 0) {
        whereConditions.push({name: {contains: name}});
      }
    }

    if (roleId) {
      roleId = roleId.trim();
      if (verifyUuid(roleId)) {
        whereConditions.push({userToRoles: {some: {roleId: roleId}}});
      }
    }

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: page,
      pageSize: pageSize,
    });

    // [step 3] Get users.
    const [users, total] = await this.userService.findManyWithTotal({
      where: where,
      take: take,
      skip: skip,
      include: {
        roles: true,
        profile: true,
      },
    });

    // [step 4] Return users without password.
    const records = users.map(user => {
      return this.userService.withoutPassword(user);
    });

    return generatePaginationResponse({page, pageSize, records, total});
  }

  @Get(':userId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getUser(@Param('userId') userId: string) {
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
      include: {
        roles: true,
        profile: true,
      },
    });

    return this.userService.withoutPassword(user);
  }

  @Patch(':userId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description:
      'Set roleIds with an empty array to remove all the roles of the user.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          email: '',
          phone: '',
          username: 'dispatcher',
          password: 'Abc1234!',
          status: UserStatus.INACTIVE,
          roleIds: [{id: '013f92b0-4a53-45cb-8eca-e66089a3919f'}],
          locationNames: ['Harley Davidson Lifestyle Centers'],
        },
      },
    },
  })
  async updateUser(
    @Param('userId') userId: string,
    @Body()
    body: Prisma.UserUpdateInput & {roles?: Role[]}
  ): Promise<User> {
    const {roles, ...user} = body;
    const userUpdateInput: Prisma.UserUpdateInput = user;

    // Construct roles.
    if (roles && Array.isArray(roles)) {
      userUpdateInput.roles = {
        set: roles, // Overwrite the connections with roles.
      };
    }

    return await this.userService.update({
      where: {id: userId},
      data: userUpdateInput,
    });
  }

  @Delete(':userId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteUser(@Param('userId') userId: string): Promise<User> {
    return await this.userService.delete({
      where: {id: userId},
    });
  }

  @Get(':userId/profiles')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getUserProfiles(@Param('userId') userId: string) {
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
      include: {profile: true},
    });

    return this.userService.withoutPassword(user);
  }

  @Get(':userId/roles')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getUserRoles(@Param('userId') userId: string) {
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
      include: {roles: true},
    });

    return this.userService.withoutPassword(user);
  }

  @Patch(':userId/change-password')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description:
      "The 'userId', 'currentPassword' and 'newPassword' are required in request body.",
    examples: {
      a: {
        summary: '1. new password != current password',
        value: {
          currentPassword: 'Abc1234!',
          newPassword: 'Abc12345!',
        },
      },
      b: {
        summary: '2. new password == current password',
        value: {
          currentPassword: 'Abc1234!',
          newPassword: 'Abc1234!',
        },
      },
    },
  })
  async changePassword(
    @Param('userId') userId: string,
    @Body() body: {currentPassword: string; newPassword: string}
  ): Promise<User> {
    // [step 1] Guard statement.
    if (!('currentPassword' in body) || !('newPassword' in body)) {
      throw new BadRequestException(
        "Please carry 'currentPassword' and 'newPassword' in the request body."
      );
    }

    // [step 2] Verify if the new password is same with the current password.
    if (body.currentPassword.trim() === body.newPassword.trim()) {
      throw new BadRequestException(
        'The new password is same with the current password.'
      );
    }

    // [step 3] Verify the current password.
    const user = await this.userService.findUnique({where: {id: userId}});
    if (!user) {
      throw new NotFoundException('Not found the user.');
    }
    const match = await compareHash(body.currentPassword, user.password);
    if (match === false) {
      throw new BadRequestException('The current password is incorrect.');
    }

    // [step 4] Change password.
    return await this.userService.update({
      where: {id: userId},
      data: {password: body.newPassword},
      select: {id: true, email: true, phone: true},
    });
  }

  /* End */
}