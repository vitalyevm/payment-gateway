// src/common/guards/auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../../modules/user/services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new HttpException(
        'Missing authorization header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new HttpException('Invalid token format', HttpStatus.UNAUTHORIZED);
    }

    try {
      // Verify token. If valid, attach decoded user to request
      const decoded = await this.authService.verifyJwtToken(token);
      request.user = decoded; // e.g. { userId, email, iat, exp }
      return true;
    } catch (error) {
      throw new HttpException('Invalid/expired token', HttpStatus.UNAUTHORIZED);
    }
  }
}
