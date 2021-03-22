## GET /users/:username/profile
Get profile of specific user.

### Request
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `username` | `string` | path | **Required**. |

### Response
```
{
	"data": {
		"id": number,
		"username": string,
		"firstName": string,
		"lastName": string,
		"female": boolean,
		"avatarPath": slug-url,
		"iconPath": slug-url,
		"totalViews": number,
		"totalSubscribers": number
	}
}
```
## GET /users/:username/videos
Get videos of specific user.

### Request
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `username` | `string` | path | **Required**. |
| `limit` | `number` | query | **Optional**. 0 - 100, default: 30 |
| `offset` | `number` | query | **Optional**. 0 - Infinity, default: 0 |

### Response
```
{
	"data": [{
		"id": number,
		"title": string,
		"videoPath": slug-url,
		"thumbnailPath": slug-url,
		"duration": number,
		"description": string,
		"views": number,
		"uploadedAt": date-string,
		"categories": [{
			"id": number,
			"category": string
		}],
		"uploadedBy": {
			"username": string,
			"iconPath": slug-url
		}
	}]
}
```
## GET /users/profile
Get profile of authorized user.

### Request
```http
Authorization: Bearer <token>
```


### Response
```
{
	"data": {
		"id": number,
		"username": string,
		"firstName": string,
		"lastName": string,
		"female": boolean,
		"avatarPath": slug-url,
		"iconPath": slug-url,
		"totalViews": number,
		"totalSubscribers": number
	}
}
```
## GET /users/videos
Get videos of authorized user.

### Request
```http
Authorization: Bearer <token>
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `limit` | `number` | query | **Optional**. 0 - 100, default: 30 |
| `offset` | `number` | query | **Optional**. 0 - Infinity, default: 0 |

### Response
```
{
	"data": [{
		"id": number,
		"title": string,
		"videoPath": slug-url,
		"thumbnailPath": slug-url,
		"duration": number,
		"description": string,
		"views": number,
		"uploadedAt": date-string,
		"categories": [{
			"id": number,
			"category": string
		}],
		"uploadedBy": {
			"username": string,
			"iconPath": slug-url
		}
	}]
}
```
## GET /users/subscriptions
Get subscriptions of authorized user.

### Request
```http
Authorization: Bearer <token>
```

| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `limit` | `number` | query | **Optional**. 0 - 100, default: 30 |
| `offset` | `number` | query | **Optional**. 0 - Infinity, default: 0 |

### Response
```
{
	"data": [{
		"username": string,
		"iconPath": slug-url,
		"firstName": string,
		"lastName": string
	}]
}
```
## GET /users/subscribers
Get subscribers of authorized user.

### Request
```http
Authorization: Bearer <token>
```

| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `limit` | `number` | query | **Optional**. 0 - 100, default: 30 |
| `offset` | `number` | query | **Optional**. 0 - Infinity, default: 0 |

### Response
```
{
	"data": [{
		"username": string,
		"iconPath": slug-url,
		"firstName": string,
		"lastName": string
	}]
}
```
## PATCH /users/profile
Update authorized user profile.

### Request
```http
Authorization: Bearer <token>
Content-type: multipart/form-data
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `first_name` | `string` | form | **Optional**. Not contain special character. |
| `last_name` | `string` | form | **Optional**. Not contain special character. |
| `female` | `binary` | form | **Optional**. Accept only 0 and 1. |
| `avatar` | `file` | form | **Optional**. Must be image. |
### Response
```
{
	"data": {
		"id": number,
		"username": string,
		"firstName": string,
		"lastName": string,
		"female": boolean,
		"avatarPath": slug-url,
		"iconPath": slug-url
	}
}
```
