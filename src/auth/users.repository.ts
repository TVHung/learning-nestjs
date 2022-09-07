import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(autCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = autCredentialsDto;

    //hash
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(salt, hashedPassword);

    const user = this.create({ username, password: hashedPassword });
    try {
      await this.save(user);
    } catch (error) {
      console.log(error);
      if (error.code === 'ER_DUP_ENTRY')
        //duplicate username
        throw new ConflictException('Username already exists');
      else throw new InternalServerErrorException();
    }
  }
}
