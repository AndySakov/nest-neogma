[![Nest Logo](https://kamilmysliwiec.com/public/nest-logo.png#1)](http://nestjs.com/) [![Neogma Logo](https://themetalfleece.github.io/neogma/assets/logo-text-horizontal.svg)](https://themetalfleece.github.io/neogma/)

# Nest Neogma

> Neogma integration for Nest

## Description

This repository provides a [Neogma](https://themetalfleece.github.io/neogma/) integration for [Nest](http://nestjs.com/).

## Installation

```sh
yarn add nest-neogma
```

## Quick Start

Register the Neogma Module in your application using the `forRoot` method, passing the Neogma connection information as an object:

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NeogmaModule } from 'nest-neogma'

@Module({
  imports: [
    NeogmaModule.forRoot({
      scheme: 'neo4j',
      host: 'localhost',
      port: 7687,
      username: 'neo4j',
      password: 'neo'
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Querying with Neogma

The `Neogma` instance is `@Injectable`, so can be passed into any constructor with the `@InjectConnection` decorator:

```ts
import { InjectConnection } from 'nest-neogma'
import { Neogma } from 'neogma'

@Controller()
export class AppController {
  constructor(
    @InjectConnection()
    private neogma: Neogma,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    const res =  await this.neogma.queryRunner
      .run("MATCH (n) RETURN COUNT(n) as count LIMIT 5")

    return `There are ${res.records[0].get('count')} nodes in the database`
  }
}
```

## More Information

For more information about running Neogma in your Node.js or TypeScript project, check out the official [Neogma Documentation](https://themetalfleece.github.io/neogma/).

## TODO

- Add support for models with `NeogmaModule.forFeature`
  