import { getRepository, Repository } from 'typeorm';

import { User } from '../../../users/entities/User';
import { Game } from '../../entities/Game';

import { IGamesRepository } from '../IGamesRepository';

export class GamesRepository implements IGamesRepository {
  private repository: Repository<Game>;

  constructor() {
    this.repository = getRepository(Game);
  }

  async findByTitleContaining(param: string): Promise<Game[]> {
    return this.repository
      .createQueryBuilder("games")
      .where("lower(games.title) like :param", { param: `%${param.toLowerCase()}%` })
      .getMany()
  }

  async countAllGames(): Promise<[{ count: string }]> {
    return this.repository.query("select count(0) as count from games")
  }

  async findUsersByGameId(id: string): Promise<User[]> {
    const item = await this.repository
      .createQueryBuilder("games")
      .leftJoin("games.users", "users")
      .leftJoinAndSelect("games.users", "usersSelect")
      .where("games.id = :id", { id })
      .getOne()

    if (!item)
      throw new Error("Game não encontrado.")

    return item.users
  }
}
