<p align="left">

![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)
![GitHub](https://img.shields.io/github/license/worldzhy/newbie?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/newbie/@nestjs/core?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/newbie/@prisma/client?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/newbie/@pulumi/pulumi?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/newbie/passport?style=flat-square)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/worldzhy/newbie/validator?style=flat-square)

</p>

## Description

[Newbie](https://github.com/worldzhy/newbie) is a [Node.js](http://nodejs.org) project development framework based on [Nest](https://github.com/nestjs/nest), [Prisma](https://github.com/prisma/prisma), [Pulumi](https://github.com/pulumi/pulumi).

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>
  
![Prisma](https://i.imgur.com/h6UIYTu.png)

<p align="center">
  <a href="https://www.pulumi.com?utm_campaign=pulumi-pulumi-github-repo&utm_source=github.com&utm_medium=top-logo" title="Pulumi - Modern Infrastructure as Code - AWS Azure Kubernetes Containers Serverless"><img src="https://www.pulumi.com/images/logo/logo-on-white-box.svg?" width="350"></a>
</p>

## Environment

#### Nodejs

> https://nodejs.org/en/download/package-manager/

#### Nestjs

> https://docs.nestjs.com/first-steps

#### Pulumi

> [Install CLI] https://www.pulumi.com/docs/get-started/install/

> [Fix NotFound] Add the pulumi CLI path "~/.pulumi/bin" to $PATH.

```bash
PATH=~/.pulumi/bin:$PATH
export PATH
```

> [Install Plugin] https://www.pulumi.com/docs/reference/cli/pulumi_plugin/

```bash
$ pulumi plugin install resource aws
$ pulumi plugin install resource awsx v1.0.0-beta.5
$ pulumi plugin ls
```

## For development

### Install dependencies

```bash
$ npm install
$ cp .env.example .env
```

### Install database

```bash
$ npx prisma generate
$ npx prisma migrate dev
$ npx prisma db seed
$ npx prisma migrate deploy
```

### Install Google typescript lint

```bash
$ npx gts init
```

### Install husky

```bash
$ npx husky install
```

### Test

```bash
# unit tests
$ npm test

# e2e tests
$ npm test:e2e

# test coverage
$ npm test:cov
```

### Lint

```bash
$ npm run lint
```

### Start the app

```bash
$ npm run start:dev
```

## For production

### Install dependencies

```bash
$ npm install --production
$ cp .env.example .env

```

### Install database

```bash
$ npx prisma generate
$ npx prisma migrate dev
$ npx prisma db seed
$ npx prisma migrate deploy
```

### Start the app

```bash
$ npm run build
$ npm run start:prod
```

## Stay in touch

- Author - [worldzhy](https://blog.csdn.net/worldzhy)
- Website - [https://blog.csdn.net/worldzhy](https://blog.csdn.net/worldzhy)

## License

Newbie is [MIT licensed](LICENSE).
