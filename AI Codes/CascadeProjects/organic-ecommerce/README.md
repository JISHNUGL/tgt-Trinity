# Organic E-commerce Platform

A premium organic products marketplace with B2B approval workflow and admin panel.

## Features

- **E-commerce Core**: Product catalog, shopping cart, checkout
- **B2B Approval System**: Business registration with admin approval queue
- **Admin Panel**: Products, orders, and customer management
- **Organic Theme**: Custom color scheme (#1D6B0C, #0D4E1A, #8BD35D, #4CA845, #FFFFFF)
- **Payment Framework**: Ready for Moneris integration
- **Hostinger Ready**: Optimized for deployment

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Node.js, MySQL
- **Authentication**: JWT with bcrypt
- **File Uploads**: Multer with Sharp optimization
- **Email**: Nodemailer

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=organic_ecommerce
JWT_SECRET=your-secret-key
```

3. Create database and import schema:
```sql
mysql -u root -p organic_ecommerce < database.sql
```

4. Run development server:
```bash
npm run dev
```

## Project Structure

```
├── app/                 # Next.js app directory
├── components/          # Reusable components
├── lib/                # Utilities and database
├── public/             # Static assets
├── database.sql        # MySQL schema
└── README.md
```

## Development Plan

- **Day 1**: ✅ Project setup with organic theme
- **Day 2**: Database & backend APIs
- **Day 3**: Frontend core components  
- **Day 4**: E-commerce functionality
- **Day 5**: Admin panel (products, orders, customers)
- **Day 6**: Payment integration framework
- **Day 7**: Testing & Hostinger deployment prep

## B2B Approval Workflow

1. Business customers register with company details
2. Admin dashboard shows pending applications
3. Admin reviews and approves/rejects applications
4. Email notifications sent for status changes
5. B2B features unlocked after approval

## Security Features

- Parameterized SQL queries
- Input validation with Joi
- JWT authentication
- Password hashing with bcrypt
- File upload security
- XSS protection

## Deployment

Optimized for Hostinger with:
- Build optimization
- Environment configuration
- Database connection pooling
- Asset optimization
