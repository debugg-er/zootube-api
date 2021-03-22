## GET /search/videos
Search videos.
### Request
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `q` | `string` | query | **Required**. Search query |
| `max_upload_date` | `date-string` | query | **Optional**. Smaller will be filtered |
| `min_duration` | `number` | query | **Optional**. bigger will be filtered |
| `category` | `string` | query | **Optional**.  |
| `sort` | `string` | query | **Optional**. accept list ["views"], default is upload_date |
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

## GET /search/users
Search users.
### Request
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `q` | `string` | query | **Required**. Search query |
| `limit` | `number` | query | **Optional**. 0 - 100, default: 30 |
| `offset` | `number` | query | **Optional**. 0 - Infinity, default: 0 |

### Response
```
{
	"data": [{
		"username": string,
		"iconPath": slug-url,
		"firstName": string,
		"lastName": string,
		"subscribers": number
	}]
}
```
