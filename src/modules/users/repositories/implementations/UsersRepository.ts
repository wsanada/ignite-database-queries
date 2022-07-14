import { getRepository, Repository } from 'typeorm';
import { Game } from '../../../games/entities/Game';

import { IFindUserWithGamesDTO, IFindUserByFullNameDTO } from '../../dtos';
import { User } from '../../entities/User';
import { IUsersRepository } from '../IUsersRepository';

export class UsersRepository implements IUsersRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = getRepository(User);
  }

  async findUserWithGamesById({
    user_id,
  }: IFindUserWithGamesDTO): Promise<User> {
    const item = await this.repository
      .createQueryBuilder("users")
      .leftJoin("users.games", "games")
      .leftJoinAndSelect("users.games", "usersSelect")
      .where("users.id = :id", { id: user_id })
      .getOne()

    if (!item || item.games?.length === 0)
      throw new Error("Usuário não encontrado")

    return item
  }

  async findAllUsersOrderedByFirstName(): Promise<User[]> {
    return this.repository.query(`
      select *
        from users
        order by first_name
    `)
  }

  async findUserByFullName({
    first_name,
    last_name,
  }: IFindUserByFullNameDTO): Promise<User[] | undefined> {
    return this.repository
      .createQueryBuilder("users")
      .leftJoin("users.games", "games")
      .leftJoinAndSelect("users.games", "usersSelect")
      .where("lower(users.first_name) = :first_name and lower(users.last_name) = :last_name", { first_name: first_name.toLowerCase(), last_name: last_name.toLowerCase() })
      .getMany()
  }
}
