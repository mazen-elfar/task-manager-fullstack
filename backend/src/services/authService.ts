import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/User.js';
import { RegisterInput, LoginInput } from '../validators/authValidator.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';
import { env } from '../config/env.js';

export interface TokenPayload {
  id: string;
  email: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

export class AuthService {
  /**
   * Generate signed JWT
   */
  public generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
    });
  }

  /**
   * Verify JWT and return decoded payload
   */
  public verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }
  }

  /**
   * Register a new user
   */
  public async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists');
    }

    const user: IUserDocument = await User.create({
      name: input.name,
      email: input.email,
      password: input.password
    });

    const userJson = user.toJSON() as unknown as AuthResult['user'];
    const token = this.generateToken({ id: userJson.id, email: userJson.email });

    return {
      user: userJson,
      token
    };
  }

  /**
   * Authenticate user by email & password
   */
  public async login(input: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({ email: input.email });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const userJson = user.toJSON() as unknown as AuthResult['user'];
    const token = this.generateToken({ id: userJson.id, email: userJson.email });

    return {
      user: userJson,
      token
    };
  }

  /**
   * Fetch current user profile
   */
  public async getCurrentUser(userId: string): Promise<AuthResult['user']> {
    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User session expired or user no longer exists');
    }
    return user.toJSON() as unknown as AuthResult['user'];
  }
}

export const authService = new AuthService();
