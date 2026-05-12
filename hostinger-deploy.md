# Hostinger Deployment Guide

## Prerequisites
- Hostinger Business or Cloud Hosting plan
- MySQL database
- Node.js support enabled
- Domain configured

## Database Setup

1. Create MySQL database in Hostinger control panel
2. Import the schema:
   ```sql
   mysql -u username -p database_name < database.sql
   ```

3. Update environment variables in `.env.local`:
   ```env
   DB_HOST=your-hostinger-db-host
   DB_USER=your-hostinger-db-user
   DB_PASSWORD=your-hostinger-db-password
   DB_NAME=your-hostinger-db-name
   JWT_SECRET=your-production-secret-key
   EMAIL_HOST=smtp.hostinger.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@yourdomain.com
   EMAIL_PASS=your-email-password
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

## Build Process

1. Install dependencies:
   ```bash
   npm install --production
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the application:
   ```bash
   npm start
   ```

## Hostinger Configuration

### 1. File Manager Setup
- Upload all project files to `/public_html` or your designated directory
- Ensure `.env.local` is uploaded (rename to `.env` if needed)
- Set proper file permissions (755 for directories, 644 for files)

### 2. Node.js Application Setup
- In Hostinger control panel, go to "Setup Node.js App"
- Select your project directory
- Set "Application startup file" to `server.js`
- Set "Application mode" to `production`

### 3. Environment Variables
- Add all environment variables from `.env.local` to the Hostinger Node.js setup
- Ensure `NODE_ENV=production` is set

### 4. Database Connection
- Use Hostinger's MySQL credentials
- Update `DB_HOST` to Hostinger's database server
- Test connection before going live

## Moneris Payment Setup

1. Contact Moneris for production credentials
2. Update environment variables:
   ```env
   MONERIS_API_KEY=your-production-api-key
   MONERIS_STORE_ID=your-production-store-id
   ```

3. Configure webhook endpoints in Moneris dashboard:
   - Success URL: `https://yourdomain.com/checkout/success`
   - Failure URL: `https://yourdomain.com/checkout/failure`

## SSL Certificate
- Enable free SSL certificate in Hostinger control panel
- Ensure all URLs use HTTPS
- Update `NEXT_PUBLIC_APP_URL` to use HTTPS

## Performance Optimization

### 1. Caching
- Enable Hostinger's built-in caching
- Configure Next.js static optimization
- Use CDN for static assets

### 2. Database Optimization
- Add indexes to frequently queried columns
- Enable MySQL query cache
- Monitor database performance

### 3. Image Optimization
- Use Next.js Image component
- Enable WebP format support
- Compress product images

## Security Measures

### 1. Environment Security
- Never commit `.env.local` to version control
- Use strong, unique passwords
- Rotate secrets regularly

### 2. Application Security
- Enable HTTPS only
- Set secure HTTP headers
- Implement rate limiting
- Regular security updates

### 3. Database Security
- Use parameterized queries (already implemented)
- Limit database user permissions
- Regular backups

## Monitoring & Maintenance

### 1. Error Tracking
- Monitor application logs
- Set up error notifications
- Track performance metrics

### 2. Backups
- Daily database backups
- File system backups
- Disaster recovery plan

### 3. Updates
- Regular dependency updates
- Security patches
- Feature updates

## Testing Checklist

### Pre-deployment Testing
- [ ] All API endpoints working
- [ ] Database connections stable
- [ ] Payment processing (test mode)
- [ ] Email notifications working
- [ ] File uploads functioning
- [ ] B2B approval workflow
- [ ] Admin panel accessible
- [ ] Mobile responsive design

### Post-deployment Testing
- [ ] Domain resolves correctly
- [ ] SSL certificate valid
- [ ] All pages load properly
- [ ] Forms submit successfully
- [ ] Checkout process complete
- [ ] Admin functions working
- [ ] Error pages display correctly

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check credentials in `.env.local`
   - Verify database server is running
   - Test with simple connection script

2. **Application Won't Start**
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Check application logs

3. **Payment Processing Issues**
   - Verify Moneris credentials
   - Check webhook URLs
   - Test in sandbox mode first

4. **Email Not Sending**
   - Check SMTP credentials
   - Verify email configuration
   - Check spam filters

### Support Resources
- Hostinger documentation
- Next.js deployment guide
- Moneris integration support
- Community forums

## Go Live Checklist

- [ ] Production database configured
- [ ] All environment variables set
- [ ] SSL certificate installed
- [ ] Payment gateway configured
- [ ] Email service working
- [ ] All functionality tested
- [ ] Performance optimized
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Backup plan ready

## Post-Launch Maintenance

### Weekly Tasks
- Check application logs
- Monitor performance metrics
- Update security patches
- Review error reports

### Monthly Tasks
- Database optimization
- Dependency updates
- Security audit
- Performance review

### Quarterly Tasks
- Major feature updates
- Security assessment
- Backup verification
- Performance tuning

---

**Note**: This guide assumes you have Hostinger's Business or Cloud hosting plan with Node.js support and MySQL database access.
