import {Module} from '@nestjs/common';
import {UserModule} from '../../user/user.module';
import {AuthVerificationCodeStrategy} from './verification-code.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthVerificationCodeStrategy],
})
export class AuthVerificationCodeModule {}
