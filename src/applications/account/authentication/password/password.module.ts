import {Module} from '@nestjs/common';
import {UserModule} from '../../user/user.module';
import {AuthPasswordStrategy} from './password.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthPasswordStrategy],
})
export class AuthPasswordModule {}
