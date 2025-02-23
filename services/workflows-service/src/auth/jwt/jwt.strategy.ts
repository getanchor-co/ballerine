import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAuthStrategy } from '../types';
import { UserInfo } from '../../user/user-info';
import { INJECTION_TOKEN_JWT_SECRET_KEY } from '@/injection-tokens';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements IAuthStrategy {
  constructor(
    protected readonly userService: UserService,
    @Inject(INJECTION_TOKEN_JWT_SECRET_KEY) secretOrKey: string,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(payload: UserInfo): Promise<UserInfo> {
    const { id } = payload;
    const user = await this.userService.getById(id);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!Array.isArray(user.roles) || typeof user.roles !== 'object' || user.roles === null) {
      throw new Error('User roles is not a valid value');
    }
    return { ...user, roles: user.roles as string[] };
  }
}
