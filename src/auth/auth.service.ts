import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface User {
  id: number;
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  private readonly users: User[] = [
    {
      id: 1,
      username: 'admin',
      password: bcrypt.hashSync('admin123', 10),
    },
  ];

  constructor(private readonly jwtService: JwtService) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = this.users.find((u) => u.username === username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return { id: user.id, username: user.username };
    }
    return null;
  }

  login(user: Omit<User, 'password'>) {
    const payload = { sub: user.id, username: user.username };
    return { access_token: this.jwtService.sign(payload) };
  }
}
