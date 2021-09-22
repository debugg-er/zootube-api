
# Introduction

This project is a service of "vid" that provide RestfulAPI to build a video social network.

## Getting Started
- Clone the project:
```bash
	git clone https://github.com/backy4rd/vid
```
- Install dependencies:
```bash
	npm install
```

- Provide enviroment variables. _(you can use .env file to define)._
  - `PORT`: the port that the server will listen on. *(default: 8080)*
  - `MEDIA_SERVER_ENDPOINT`: url of media server, you could find the media server project at [here](https://github.com/backy4rd/vid-static). *(required)*
  - `DB_PORT`: port of database. *(default: 5432)*
  - `DB_HOST`: host of database. *(default: "127.0.0.1")*
  - `DB_USERNAME`: username to access database. *(default: "postgres")*
  - `DB_PASSWORD`: password of database user. *(default: null)*
  - `DB_NAME`: name of database. *(default: "test")*
  - `SALT_ROUND`: cost factor of bcrypt that use for hash the password. *(default: 10)*
  - `JWT_SECRET`: secret string to sign the token. *(default: "secret")*
  - `JWT_EXPIRE_TIME`: expire time of token. *(default: "7d")*
  - `NODE_ENV`: enviroment of application. *(default: "production")*
- Build the project:
```bash
npm run build
```
- Create database tables:
```bash
npm run migrate:up
```
## Authorization

Some API requests require authenticate to perform its job.
To authenticate an API request, you need to provide the jwt token in Authorization header:


```http
Authorization: Bearer <jwt-token>
```

## Responses

API returns a JSON response in the following format:
- success:

```
{
	"data" : any
}
```
- fail:

```
{
	"fail" : {
		"message": string
	}
}
```
- error:

```
{
	"error" : "Internal Server Error"
}
```
## Logging

If `NODE_ENV` variable is set to `production`, all the logs will be writed to .log directory. If `NODE_ENV` is `development`, it will print out all the things to the screen.

## Documentations

[/auth route](https://github.com/backy4rd/vid/tree/master/docs/auth.md) <br/>
[/users route](https://github.com/backy4rd/vid/tree/master/docs/users.md) <br/>
[/videos route](https://github.com/backy4rd/vid/tree/master/docs/videos.md) <br/>
[/comments route](https://github.com/backy4rd/vid/tree/master/docs/comments.md) <br/>
[/subscriptions route](https://github.com/backy4rd/vid/tree/master/docs/subscriptions.md) <br/>
[/categories route](https://github.com/backy4rd/vid/tree/master/docs/categories.md) <br/>
[/search route](https://github.com/backy4rd/vid/tree/master/docs/search.md) <br/>


