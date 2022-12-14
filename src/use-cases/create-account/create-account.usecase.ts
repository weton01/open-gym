import { Configuration, Hasher, Notifier } from '@/use-cases/common/packages'
import { FindByEmailAccountRepository, SaveAccountRepository } from '@/use-cases/common/repositories'
import { AccountDTO, CreateAccountDTO } from '@/use-cases/create-account/create-account.dtos'
import { Account } from '@/entities/account'
import { ConflictError } from '@/use-cases/common/errors'

export class CreateAccount {
  constructor (
    private readonly findByEmailRepo: FindByEmailAccountRepository,
    private readonly saveAccount: SaveAccountRepository,
    private readonly configuration: Configuration,
    private readonly notifier: Notifier,
    private readonly hasher: Hasher
  ) {}

  async execute (dto: CreateAccountDTO): Promise<AccountDTO> {
    const image = this.configuration.defaultProfileImage
    const exists = await this.findByEmailRepo.findByEmail(dto.email)
    if (exists !== undefined) { throw new ConflictError('E-mail already exists') }
    const password = await this.hasher.hash(dto.password)
    const account = Account.build({ ...dto, password, image, active: false })
    const response = await this.saveAccount.save(account)
    await this.notifier.notify(account, {})
    return response
  }
}
