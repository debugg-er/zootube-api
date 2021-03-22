## GET /videos/:video_id/comments
Get video comments.
### Request
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |
| `limit` | `number` | query | **Optional**. 0 - 100, default: 30 |
| `offset` | `number` | query | **Optional**. 0 - Infinity, default: 0 |

### Response
```
{
	"data": [{
		"id": number,
		"content": string,
		"createdAt": date-string,
		"user": {
			"username": string,
			"iconPath": slug-url
		},
		"totalReplies": number,
		"like": number,
		"dislike": number
	}]
}
```
## GET /videos/:video_id/comments/:comment_id
Get comment replies **(comment must exist in video).** 
### Request
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |
| `comment_id` | `number` | path | **Required**. |
| `limit` | `number` | query | **Optional**. 0 - 100, default: 30 |
| `offset` | `number` | query | **Optional**. 0 - Infinity, default: 0 |

### Response
```
{
	"data": [{
		"id": number,
		"content": string,
		"createdAt": date-string,
		"user": {
			"username": string,
			"iconPath": slug-url
		},
		"like": number,
		"dislike": number
	}]
}
```
## POST /videos/:video_id/comments
Post a comment to specific video.
### Request
```http
Authorization: Bearer <token>
Content-Type: x-www-form-urlencoded
```

| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |
| `content` | `string` | form | **Required**. |

### Response
```
{
	"data": {
		"id": number,
		"content": string,
		"createdAt": date-string,
		"user": {
			"id": number
		},
		"video": {
			"id": string
		}
	}
}
```
## POST /videos/:video_id/comments/:comment_id
Reply specific comment **(comment must exist in video and can not reply a reply comment)**.
### Request
```http
Authorization: Bearer <token>
Content-Type: x-www-form-urlencoded
```

| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |
| `comment_id` | `number` | path | **Required**. |
| `content` | `string` | form | **Required**. |

### Response
```
{
	"data": {
		"id": number,
		"content": string,
		"createdAt": date-string,
		"parent": {
			"id": number
		},
		"user": {
			"id": number
		},
		"video": {
			"id": string
		}
	}
}
```
## POST /videos/:video_id/comments/:comment_id/reaction
Like or dislike a comment **(comment must exist in video).**

### Request
```http
Authorization: Bearer <token>
Content-Type: x-www-form-urlencoded
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |
| `comment_id` | `number` | path | **Required**. |
| `reaction` | `string` | form | **Required**. Accept only "like" and "dislike" |

### Response
```
{
	"data": {
		"message": "liked"|"disliked"
	}
}
```
## PATCH /videos/:video_id/comments/:comment_id
Update a comment **(must own that comment and comment must exist in video)**.

### Request
```http
Authorization: Bearer <token>
Content-Type: x-www-form-urlencoded
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |
| `comment_id` | `number` | path | **Required**. |
| `content` | `string` | form | **Required**. |

### Response
```
{
	"data": {
		"id": number,
		"content": string,
		"createdAt": date-string
	}
}
```
## DELETE /videos/:video_id/comments/:comment_id
Delete a comment of authorized user **(must own that comment and comment must exist in video)**.

### Request
```http
Authorization: Bearer <token>
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |
| `comment_id` | `number` | path | **Required**. |

### Response
```
{
	"data": {
		"message": "deleted comment"
	}
}
```
## DELETE /videos/:video_id/comments/:comment_id/reaction
Delete reaction of a comment **(comment must exist in video)**.

### Request
```http
Authorization: Bearer <token>
```
| Parameter | Type | Place | Description |
| :- | :- | :- | :- |
| `video_id` | `string` | path | **Required**. |
| `comment_id` | `number` | path | **Required**. |

### Response
```
{
	"data": {
		"message": "deleted reaction"
	}
}
```
