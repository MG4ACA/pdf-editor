# 🚀 Hostinger VPS Deployment Guide

## Pharmacy POS System (MEVN Stack)

This guide will walk you through deploying your Pharmacy POS application (Vue.js frontend + Express.js backend) on a Hostinger VPS with the MEVN stack template.

---

## 📋 Prerequisites

- Hostinger VPS with Ubuntu 22.04 + MEVN Stack template installed
- SSH access to your VPS
- Your VPS IP address
- Domain name (optional, but recommended)

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────┐
│         Hostinger VPS Server            │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  Nginx (Reverse Proxy)         │    │
│  │  Port 80/443                   │    │
│  └──────────┬─────────────────────┘    │
│             │                           │
│  ┌──────────▼──────────┐  ┌──────────┐ │
│  │  Vue.js Frontend    │  │  Backend │ │
│  │  (Static Files)     │  │  API     │ │
│  │                     │  │  Port    │ │
│  │                     │  │  3000    │ │
│  └─────────────────────┘  └────┬─────┘ │
│                                 │       │
│                          ┌──────▼─────┐ │
│                          │   MySQL    │ │
│                          │  Database  │ │
│                          └────────────┘ │
└─────────────────────────────────────────┘
```

---

## 📦 Step 1: Connect to Your VPS

```bash
# Connect via SSH
ssh root@your_vps_ip

# Or if you have a username
ssh username@your_vps_ip
```

---

## 🔧 Step 2: Initial Server Setup

### 2.1 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Required Tools

```bash
# Install Git
sudo apt install git -y

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (if not already installed)
sudo apt install nginx -y

# Install MySQL client (if needed)
sudo apt install mysql-server -y
sudo apt install mysql-client -y
sudo systemctl status mysql
sudo systemctl start mysql
```

### 2.3 Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 🗄️ Step 3: Set Up MySQL Database

### 3.1 Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

Follow the prompts to:

- Set root password
- Remove anonymous users
- Disallow root login remotely
- Remove test database

### 3.2 Create Database and User

```bash
# Login to MySQL
sudo mysql -u root -p

# Run these SQL commands:
```

```sql
-- Create database
CREATE DATABASE ape_news;

-- Create user (replace 'your_password' with a strong password)
CREATE USER 'ape_news_user'@'localhost' IDENTIFIED BY 'Velou@123';  pw - Velou@123

-- Grant privileges
GRANT ALL PRIVILEGES ON ape_news.* TO 'ape_news_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

---

## 📥 Step 4: Deploy Your Application

### 4.1 Create Application Directory

```bash
# Create directory for your app
sudo mkdir -p /var/www/ape-news
cd /var/www/ape-news
```

### 4.2 Clone Your Repository

```bash
# If your code is on GitHub
sudo git clone https://github.com/MG4ACA/ape-news-backend.git


# Or upload your code using SCP from your local machine:
# scp -r /path/to/pharmacy-standalone-pos root@your_vps_ip:/var/www/ape-news
```

### 4.3 Set Correct Permissions

```bash
# Change ownership
sudo chown -R $USER:$USER /var/www/ape-news

# Set permissions
sudo chmod -R 755 /var/www/ape-news
```

---

cd ape-news-backend

git fetch --all
git branch
git checkout 'your_branch'
git pull origin dev

if errors occur try below
git reset --hard

## 🔨 Step 5: Set Up Backend

### 5.1 Navigate to Backend Directory

```bash
cd /var/www/ape-news/ape-news-backend
```

### 5.2 Install Dependencies

```bash
npm install --production
```

### 5.3 Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add the following configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ape_news
DB_USER=ape_news_user
DB_PASSWORD=Velou@123

# Application
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# JWT Expiration
JWT_EXPIRES_IN=24h

# CORS Configuration (comma-separated list of allowed origins)
ALLOWED_ORIGINS=http://your_vps_ip,https://yourdomain.com
```

**To generate a secure JWT secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5.4 Initialize Database

```bash
# Create database tables and seed
npm run db:create


# If you have product CSV data
npm run db:seed:products
```

### 5.5 Test Backend Locally

```bash
# Test if backend works
npm start

# In another terminal, test the API
curl http://localhost:3000/api/health
```

If successful, you should see a response. Press `Ctrl+C` to stop.

### 5.6 Set Up PM2 for Backend

```bash
# Start backend with PM2
pm2 start src/index.js --name pharmacy-pos-backend

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup

# Check status
pm2 status
```

**Useful PM2 Commands:**

```bash
# View logs
pm2 logs ape-news-backend

# Restart app
pm2 restart ape-news-backend
pm2 restart pharmacy-pos-backend

# Stop app
pm2 stop ape-news-backend

# Monitor
pm2 monit
```

---

## 🎨 Step 6: Set Up Frontend

### 6.1 Navigate to Frontend Directory

## clone frotend repo then

```bash
cd /var/www/ape-news/ape-news-frontend
```

### 6.2 Configure API Endpoint

create environment file:

```bash
nano .env.production
```

```env
VITE_API_BASE_URL=http://your_vps_ip/api
```

or Update the frontend to point to your backend API:

```bash
nano src/api/client.js
```

Update the base URL:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://your_vps_ip/api';
```

### 6.3 Install Dependencies and Build

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist` folder with optimized static files.

### 6.4 Move Build to Nginx Directory

```bash
# Create directory for frontend
sudo mkdir -p /var/www/ape-news/frontend

# Copy built files
sudo cp -r dist/* /var/www/hasal_products/frontend/

# Set permissions
sudo chown -R www-data:www-data /var/www/ape-news/frontend
sudo chmod -R 755 /var/www/ape-news/frontend
```

---

## 🌐 Step 7: Configure Nginx

### 7.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/ape-news
```

Add this configuration:

```nginx
# Upstream backend
upstream pharmacy_backend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
 server_name apenews.lumicore-labs.com www.apenews.lumicore-labs.com;
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend - Serve Vue.js app
    location / {
        root /var/www/ape-news/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API - Proxy to Express.js
    location /api/ {
        proxy_pass http://pharmacy_backend/api/;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Disable cache for API
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://pharmacy_backend/health;
        access_log off;
    }

    # Logs
    access_log /var/log/nginx/ape-news-access.log;
    error_log /var/log/nginx/ape-news-error.log;
}
```

### 7.2 Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/ape-news /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

---

## 🔒 Step 8: Set Up SSL (Optional but Recommended)

### 8.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2 Obtain SSL Certificate

**Note:** You need a domain name pointed to your VPS IP for this step.

```bash
# Replace with your domain
sudo certbot --nginx -d apenews.lumicore-labs.com -d www.apenews.lumicore-labs.com
```

Certbot will:

- Obtain certificate
- Automatically configure Nginx
- Set up automatic renewal

### 8.3 Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

### 8.4 Update Frontend API URL

After SSL is set up, update your frontend API URL to use HTTPS:

```bash
nano /var/www/ape-news/src/api/client.js
```

Change to:

```javascript
const API_BASE_URL = 'https://lumicore.trustyou-go.com/api';
```

Rebuild and redeploy:

```bash
cd /var/www/ape-news
npm run build
sudo cp -r dist/* /var/www/ape-news/frontend/
```

---

## ✅ Step 9: Verify Deployment

### 9.1 Check Backend

```bash
# Check PM2 status
pm2 status

# Check backend logs
pm2 logs ape-news-backend

# Test API directly
curl http://localhost:3000/api/health
```

### 9.2 Check Nginx

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/ape-news-error.log
```

### 9.3 Test Application

Open your browser and visit:

- `http://your_vps_ip` (or `https://yourdomain.com`)

You should see your Pharmacy POS login page!

---

## 🔄 Step 10: Deployment Script (For Updates)

Create a deployment script for easy updates:

```bash
nano /var/www/ape-news/deploy.sh
```

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/ape-news

# Pull latest changes (if using Git)
echo "📥 Pulling latest changes..."
git pull origin main

# Backend deployment
echo "🔨 Deploying backend..."
cd backend-project
npm install --production
pm2 restart ape-news-backend

# Frontend deployment
echo "🎨 Deploying frontend..."
cd ..
npm install
npm run build
sudo cp -r dist/* /var/www/ape-news/frontend/

# Restart Nginx
echo "🌐 Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Deployment complete!"
```

Make it executable:

```bash
chmod +x /var/www/ape-news/deploy.sh
```

Run deployment:

```bash
./deploy.sh
```

---

## 🛠️ Maintenance Commands

### Check Application Status

```bash
# Check all services
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql

# Check disk space
df -h

# Check memory usage
free -m
```

### View Logs

```bash
# Backend logs
pm2 logs ape-news-backend

# Nginx access logs
sudo tail -f /var/log/nginx/ape-news-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/ape-news-error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### Backup Database

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
mysqldump -u ape_news_user -p ape_news > ~/backups/ape_news_$(date +%Y%m%d_%H%M%S).sql

# Create automated backup script
nano ~/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
mysqldump -u ape_news_user -p'your_password' ape_news > $BACKUP_DIR/ape_news_$(date +%Y%m%d_%H%M%S).sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "ape_news_*.sql" -mtime +7 -delete
```

```bash
chmod +x ~/backup-db.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * /home/username/backup-db.sh
```

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs ape-news-backend

# Common issues:
# 1. Port 3000 already in use
sudo lsof -i :3000
sudo kill -9 <PID>

# 2. Database connection failed
# Check .env file and MySQL credentials
mysql -u ape_news_user -p ape_news
```

### Frontend Not Loading

```bash
# Check Nginx error logs
sudo tail -f /var/log/nginx/ape-news-error.log

# Verify files exist
ls -la /var/www/ape-news/frontend

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 502 Bad Gateway

```bash
# Backend is not running
pm2 status
pm2 restart ape-news-backend

# Check backend is listening on port 3000
sudo netstat -tlnp | grep 3000
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u ape_news_user -p ape_news

# Check MySQL is running
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Check backend .env file
cat backend-project/.env
```

---

## 📊 Monitoring Setup (Optional)

### Install Monitoring Tools

```bash
# Install htop for resource monitoring
sudo apt install htop -y

# Use PM2 monitoring
pm2 install pm2-server-monit
```

### Set Up PM2 Web Dashboard

```bash
# Install PM2 web interface
pm2 install pm2-web

# Access at: http://your_vps_ip:9615
```

---

## 🎯 Performance Optimization

### Enable Gzip Compression in Nginx

Edit `/etc/nginx/nginx.conf`:

```bash
sudo nano /etc/nginx/nginx.conf
```

Add inside `http` block:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
```

### Configure Node.js for Production

In PM2 configuration:

```bash
pm2 start src/index.js --name ape-news-backend -i max --node-args="--max-old-space-size=1024"
```

---

## 📚 Additional Resources

- [Hostinger VPS Documentation](https://www.hostinger.com/tutorials/vps)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Certbot](https://certbot.eff.org/)

---

## 📞 Support

If you encounter issues:

1. Check logs first (`pm2 logs`, nginx logs)
2. Verify all services are running
3. Check firewall settings
4. Review configuration files
5. Restart services in order: MySQL → Backend → Nginx

---

## 🎉 Congratulations!

Your Pharmacy POS System is now live on Hostinger VPS!

**Access your application at:**

- 🌐 Frontend: `http://your_vps_ip` or `https://yourdomain.com`
- 🔌 Backend API: `http://your_vps_ip/api` or `https://yourdomain.com/api`

**Default Login (if using seed data):**

- Username: `admin`
- Password: Check your seed file

---

## 📝 Post-Deployment Checklist

- [ ] Backend is running via PM2
- [ ] Database is created and seeded
- [ ] Frontend is built and served by Nginx
- [ ] API endpoints are accessible
- [ ] Application login works
- [ ] SSL certificate is installed (if using domain)
- [ ] Firewall is configured
- [ ] Backups are automated
- [ ] Monitoring is set up
- [ ] Deployment script is ready

---

**Last Updated:** December 2024  
**Version:** 1.0.0
