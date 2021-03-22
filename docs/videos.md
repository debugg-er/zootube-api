## GET /videos
Get homepage videos.
### Request
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

## GET /videos/:video_id
Get specific video.

### Request
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |

### Response
```
{
	"data": {
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
		"like": number,
		"dislike": number,
		"comment": number
	}
}
```
## GET /videos/subsciptions
Get subscription videos of authorized user.

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
## GET /videos/watched
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
## POST /videos
Upload a video.

### Request
```http
Authorization: Bearer <token>
Content-type: multipart/form-data
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video` | `file` | form | **Required**. Must be video. |
| `title` | `string` | form | **Required**. |
| `description` | `string` | form | **Optional**. |
| `categories` | `string` | form | **Optional**. List of categories separated by comma. |

### Response
```
{
	"data": {
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
			"id": number
		}
	}
}
```
## POST /videos/:video_id/reaction
Like or dislike a video.

### Request
```http
Authorization: Bearer <token>
Content-Type: x-www-form-urlencoded
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |
| `reaction` | `string` | form | **Required**. Accept only "like" and "dislike" |

### Response
```
{
	"data": {
		"message": "liked"|"disliked"
	}
}
```
## PATCH /videos/:video_id
Update a video of authorized user **(must own that video)**.

### Request
```http
Authorization: Bearer <token>
Content-type: multipart/form-data
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |
| `thumbnail` | `file` | form | **Optional**. Must be an image|
| `title` | `string` | form | **Optional**. |
| `description` | `string` | form | **Optional**. |
| `categories` | `string` | form | **Optional**. List of categories separated by comma. |

### Response
```
{
	"data": {
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
		}]
	}
}
```
## DELETE /videos/:video_id
Delete a video of authorized user **(must own that video)**.

### Request
```http
Authorization: Bearer <token>
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |

### Response
```
{
	"data": {
		"message": "deleted video"
	}
}
```
## DELETE /videos/:video_id/reaction
Delete reaction of specific video.

### Request
```http
Authorization: Bearer <token>
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |

### Response
```
{
	"data": {
		"message": "deleted reaction"
	}
}
```
