// Extarnal Libs
import { promisify } from 'util'
import { IsString, IsNotEmpty } from 'class-validator'
import redis = require('redis')
import uuidv4 = require('uuid/v4')

// External Files

// Interfaces
import { IAccount } from '../interfaces/account'

class Account {
  constructor(params: IAccount) {
    const { name, description, contactEmail } = params
    this.name = name
    this.description = description
    this.contactEmail = contactEmail
    this.uuid = uuidv4()
  }

  @IsNotEmpty()
  @IsString()
  public name: string
  @IsNotEmpty()
  @IsString()
  public description: string
  @IsNotEmpty()
  @IsString()
  public contactEmail: string
  public uuid: string

  public async store(): Promise<void> {
    try {
      const _client = redis.createClient()
      const _setAsync = promisify(_client.set).bind(_client)

      const _accountKey = this.generateRedisKey()
      const _stringifiedAccount = this.generateRedisPayload()
      await _setAsync(_accountKey, _stringifiedAccount, 'EX', this.lifeSpan)
      _client.quit()
    } catch (error) {
      throw new Error(`Account - failed to store account: ${error.message}`)
    }
  }

  private readonly lifeSpan = 432000

  private generateRedisPayload(): string {
    const _accountDetails = {
      name: this.name,
      description: this.description,
      contactEmail: this.contactEmail,
      uuid: this.uuid
    }
    return JSON.stringify(_accountDetails)
  }

  private generateRedisKey(): string {
    try {
      if (!this.uuid) {
        throw new Error('no uuid found')
      }

      return `account:${this.uuid}`
    } catch (error) {
      throw new Error(`Account - failed to generate rkey: ${error.message}`)
    }
  }
}

export = Account
