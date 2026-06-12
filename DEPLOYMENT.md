# Meeting Assistant App - Deployment Guide

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for containerized deployment)
- Git
- LiteLLM API key

### Local Development

#### 1. Clone and Setup
```bash
git clone https://github.com/phil-droid/meeting-assistant-app.git
cd meeting-assistant-app

# Create .env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

#### 2. Configure Environment Variables

**backend/.env:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/meeting-assistant
JWT_SECRET=your-secret-key-change-in-production
LITELLM_API_KEY=your-litellm-api-key
OPENAI_API_KEY=your-openai-api-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CORS_ORIGIN=http://localhost:3000
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Meeting Assistant
```

#### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Backend running at http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Frontend running at http://localhost:3000
```

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Using Individual Docker Commands

```bash
# Build backend image
docker build -t meeting-assistant-backend ./backend

# Build frontend image
docker build -t meeting-assistant-frontend ./frontend

# Run backend
docker run -p 5000:5000 --env-file backend/.env meeting-assistant-backend

# Run frontend
docker run -p 3000:3000 meeting-assistant-frontend
```

## Production Deployment

### Environment Setup

1. **Use Strong JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Configure Production Database:**
   - Use MongoDB Atlas or self-hosted MongoDB
   - Update `MONGODB_URI` with production connection string

3. **Set Up Email Service:**
   - Use SendGrid, AWS SES, or Gmail App Password
   - Update email credentials in `.env`

### AWS EC2 Deployment

```bash
# 1. SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# 2. Install dependencies
sudo yum update -y
sudo yum install nodejs git docker -y
sudo service docker start
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Clone repository
git clone https://github.com/phil-droid/meeting-assistant-app.git
cd meeting-assistant-app

# 4. Create .env files with production values
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with production values

# 5. Start with Docker Compose
docker-compose up -d
```

### Heroku Deployment

```bash
# 1. Install Heroku CLI and login
heroku login

# 2. Create Heroku apps
heroku create meeting-assistant-backend
heroku create meeting-assistant-frontend

# 3. Set environment variables
heroku config:set JWT_SECRET=your-secret-key -a meeting-assistant-backend
heroku config:set LITELLM_API_KEY=your-key -a meeting-assistant-backend

# 4. Deploy
git push heroku develop
```

### DigitalOcean Deployment

1. Create App Platform project
2. Connect GitHub repository
3. Configure build and run commands
4. Set environment variables
5. Deploy

## Monitoring & Maintenance

### Logs
```bash
# Backend logs
npm run logs:backend

# Frontend logs
npm run logs:frontend

# Docker logs
docker-compose logs backend
docker-compose logs frontend
```

### Health Checks
```bash
# API health
curl http://localhost:5000/api/health
```

### Backups
```bash
# Backup MongoDB
mongodump --uri="mongodb://user:password@host:27017/meeting-assistant"

# Restore MongoDB
mongorestore --uri="mongodb://user:password@host:27017" dump/
```

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Run multiple API instances
- Use managed database (MongoDB Atlas)
- Implement Redis caching

### Performance Optimization
- Enable gzip compression
- Implement CDN for frontend assets
- Use database indexes
- Cache API responses
- Implement rate limiting

## Security Best Practices

1. **Secrets Management**
   - Use environment variables
   - Never commit `.env` files
   - Rotate API keys regularly

2. **HTTPS/SSL**
   - Install SSL certificate
   - Use Let's Encrypt for free certificates
   - Enforce HTTPS redirects

3. **Input Validation**
   - Validate all user inputs
   - Use express-validator
   - Implement rate limiting

4. **Database Security**
   - Use authentication
   - Enable encryption at rest
   - Regular backups
   - Restrict database access

5. **API Security**
   - Implement CORS properly
   - Use JWT with expiration
   - Add request rate limiting
   - Validate API requests

## Troubleshooting

### Common Issues

**CORS Errors**
```javascript
// Ensure CORS is configured in backend
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

**MongoDB Connection Issues**
```bash
# Test connection
mongo "mongodb://user:password@host:27017/meeting-assistant"
```

**Port Already in Use**
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
```

**Environment Variables Not Loading**
- Ensure `.env` file exists in correct directory
- Restart application after changing `.env`
- Check file permissions

## Support & Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [LiteLLM Documentation](https://docs.litellm.ai/)
- [Docker Documentation](https://docs.docker.com/)

## License

MIT License - See LICENSE file for details
