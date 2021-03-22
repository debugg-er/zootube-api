## POST /auth/register
Create an account
### Request
```
Content-Type: application/x-www-form-urlencoded
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `username` | `string` | form | **Required**. Only contain alphabelt letters, numbers, dot and underscore. |
| `password` | `string` | form | **Required**. Not contain white space. |
| `first_name` | `string` | form | **Required**. Not contain special character|
| `last_name` | `string` | form | **Required**. Not contain special character|
| `female` | `binary` | form | **Required**. Accept only 0 and 1.|

### Response
```
{
	"data": { "token": string }
}
```
## POST /auth/login
Login
### Request
```
Content-Type: application/x-www-form-urlencoded
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `username` | `string` | form | **Required**. Only contain alphabelt letters, numbers, dot and underscore. |
| `password` | `string` | form | **Required**. Not contain white space.

### Response
```
{
	"data": { "token": string }
}
```

## POST /auth/reset
Reset password
### Request
```
Authorization: Bearer <token>
Content-Type: application/x-www-form-urlencoded
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `username` | `string` | form | **Required**. Only contain alphabelt letters, numbers, dot and underscore. |
| `old_password` | `string` | form | **Required**. Not contain white space.
| `password` | `string` | form | **Required**. Not contain white space.

### Response
```
{
	"data": "change password success"
}
```
