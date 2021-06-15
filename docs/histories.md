## GET /histories
Get watched videos of authorized user.

### Request
```http
Authorization: Bearer <token>
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `limit` | `number` | query | **Optional**. 0 - 100 |
| `offset` | `number` | query | **Optional**. 0 -Infinity |

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
		},
		"watchedAt": date-string
	}]
}
```

## DELETE /histories
Delete all watched videos of authorized user.

### Request
```http
Authorization: Bearer <token>
```
### Response
```
{
	"data": { "message": "deleted history"}
}
```
