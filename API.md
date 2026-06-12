# API Documentation

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

## Meetings

### Create Meeting
```
POST /api/meetings

{
  "title": "Q4 Planning",
  "description": "Quarterly planning meeting",
  "participants": ["john@example.com", "jane@example.com"],
  "scheduledFor": "2024-12-15T10:00:00Z"
}
```

### Get All Meetings
```
GET /api/meetings
```

### Get Meeting by ID
```
GET /api/meetings/:meetingId
```

### Update Meeting
```
PUT /api/meetings/:meetingId

{
  "title": "Updated Title",
  "status": "completed"
}
```

### Delete Meeting
```
DELETE /api/meetings/:meetingId
```

## Recordings

### Upload Recording
```
POST /api/recordings/upload
Content-Type: multipart/form-data

Form Data:
- recording: <video file>
- meetingId: <meeting-id>
- title: <recording-title>
```

### Get All Recordings
```
GET /api/recordings
```

### Get Recording by ID
```
GET /api/recordings/:recordingId
```

### Delete Recording
```
DELETE /api/recordings/:recordingId
```

## Notes

### Generate Notes
```
POST /api/notes/generate

{
  "recordingId": "recording-id",
  "meetingId": "meeting-id",
  "transcript": "Meeting transcript text..."
}
```

### Get Notes
```
GET /api/notes/:noteId
```

### Update Notes
```
PUT /api/notes/:noteId

{
  "content": "Updated notes content..."
}
```

## Reports

### Generate Report
```
POST /api/reports/generate

{
  "meetingId": "meeting-id",
  "meetingTitle": "Meeting Title",
  "notes": "Meeting notes content...",
  "attendees": ["john@example.com", "jane@example.com"]
}
```

### Get Report
```
GET /api/reports/:reportId
```

## Suggestions

### Generate Suggestions
```
POST /api/suggestions/generate

{
  "meetingId": "meeting-id",
  "meetingNotes": "Notes content...",
  "reportContent": "Report content...",
  "decisions": "Decisions made..."
}
```

### Get Suggestions
```
GET /api/suggestions/:suggestionId
```

## Emails

### Generate Email Draft
```
POST /api/emails/generate-draft

{
  "meetingTitle": "Meeting Title",
  "attendees": ["john@example.com"],
  "meetingNotes": "Notes...",
  "actionItems": "Action items...",
  "recipientEmail": "recipient@example.com"
}
```

### Send Email
```
POST /api/emails/:emailId/send
```

### Get Email
```
GET /api/emails/:emailId
```

## Chatbot

### Start Conversation
```
POST /api/chatbot/conversations

{
  "title": "Q4 Meeting",
  "context": "Meeting context..."
}
```

### Send Message
```
POST /api/chatbot/conversations/:conversationId/messages

{
  "message": "What were the key decisions?"
}
```

### Get Conversation History
```
GET /api/chatbot/conversations/:conversationId/messages
```

### Delete Conversation
```
DELETE /api/chatbot/conversations/:conversationId
```

## Error Handling

All errors follow this format:
```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Response Format

Success responses:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

## Rate Limiting

API rate limits:
- 100 requests per minute per IP
- 1000 requests per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```
