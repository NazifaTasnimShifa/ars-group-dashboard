# ARS Group - ERP Business Dashboard

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue)](https://ars-erp-dashboard.vercel.app/login)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

A comprehensive, production-ready ERP and business intelligence dashboard built for **ARS Group**. This application provides centralized management for two distinct business units:

- **ARS Lube LTD BD** — Lubricant distribution and sales
- **ARS Corporation** — Petrol pump operations and LPG cylinder management

---

## 🌐 Live Demo

**👉 [https://ars-erp-dashboard.vercel.app/login](https://ars-erp-dashboard.vercel.app/login)**

### 🔐 Login Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Owner** | `owner@arsgroup.com` | `admin123` | Full access to all companies |
| **ARS Lube Manager** | `manager@arslube.com` | `admin123` | ARS Lube company only |
| **ARS Corp Manager** | `manager@arscorp.com` | `admin123` | ARS Corporation only |
| **Pump Cashier** | `cashier@arscorp.com` | `admin123` | Pump operations only |

> 💡 **Tip:** Log in as **Super Owner** to explore all features across both companies.

---

## ✨ Key Features

### 🏢 Multi-Business Architecture
- Seamlessly switch between ARS Lube and ARS Corporation dashboards
- Unified owner view for cross-company analytics
- Company-specific branding and settings

### 🔒 Role-Based Access Control
- **Super Owner** — Full access to all companies and admin features
- **Manager** — Company-level management and reporting
- **Cashier** — Limited access for daily pump operations

### 📊 Dashboard & Analytics
- Real-time KPIs: Revenue, Expenses, Profit Margins
- Liquidity ratios and financial health indicators
- Interactive charts with Chart.js
- Top expenses breakdown and sales performance

### 💼 Business Modules

#### Accounts Management
- **Sundry Debtors** — Track customer receivables with aging analysis
- **Sundry Creditors** — Manage supplier payables and due dates
- Full CRUD operations with search and filtering

#### Inventory Management
- Real-time stock levels and alerts
- Purchase order tracking
- Sales recording and history
- Process loss monitoring for lubricants

#### Financial Reports
- **Balance Sheet** — Assets, liabilities, and equity overview
- **Income Statement** — Revenue and expense breakdown
- **Cash Flow Statement** — Operating, investing, financing activities
- **Trial Balance** — Debit/credit verification

#### Fixed Assets
- Complete asset register
- Depreciation tracking (Straight-line & Written Down Value)
- Asset categories: Buildings, Vehicles, Machinery, Equipment

#### Pump Operations (ARS Corporation)
- Daily fuel sales recording
- Credit sales management
- Dip stock measurements
- LPG cylinder inventory and sales

### 🎨 User Experience
- Modern, responsive design
- Collapsible sidebar navigation
- Dark mode support
- Mobile-friendly layouts
- Toast notifications for user feedback

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | React framework with Pages Router |
| [React 19](https://react.dev/) | UI component library |
| [Tailwind CSS 3.4](https://tailwindcss.com/) | Utility-first CSS framework |
| [Headless UI](https://headlessui.com/) | Accessible UI components |
| [Flowbite React](https://flowbite-react.com/) | Pre-built Tailwind components |
| [Heroicons](https://heroicons.com/) | SVG icon library |
| [Chart.js](https://www.chartjs.org/) | Interactive data visualization |

### Backend
| Technology | Purpose |
|------------|---------|
| [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) | RESTful API endpoints |
| [Prisma ORM 6.19](https://www.prisma.io/) | Database access and migrations |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Password hashing |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) | JWT authentication |

### DevOps
| Technology | Purpose |
|------------|---------|
| [Vercel](https://vercel.com/) | Deployment and hosting |
| [ESLint](https://eslint.org/) | Code linting |

---

## 📁 Project Structure

```
ars-erp-dashboard/
├── prisma/
│   ├── schema.prisma          # Database schema definitions
│   ├── seed.mjs               # Demo data seeding script
│   └── migrations/            # Database migration history
│
├── src/
│   ├── components/            # Reusable React components
│   │   ├── auth/              # Authentication components
│   │   ├── charts/            # Chart.js wrapper components
│   │   ├── layout/            # Sidebar, Header, Footer
│   │   └── modals/            # Modal dialog components
│   │
│   ├── contexts/              # React Context providers
│   │   └── AuthContext.js     # Authentication state management
│   │
│   ├── lib/                   # Utility libraries
│   │   ├── auth.js            # JWT signing/verification
│   │   └── prisma.js          # Prisma client singleton
│   │
│   ├── pages/
│   │   ├── api/               # API route handlers
│   │   │   ├── login.js       # Authentication endpoint
│   │   │   ├── dashboard.js   # Dashboard data API
│   │   │   ├── inventory/     # Inventory CRUD APIs
│   │   │   ├── sales/         # Sales CRUD APIs
│   │   │   ├── purchases/     # Purchase CRUD APIs
│   │   │   └── reports.js     # Financial reports API
│   │   │
│   │   ├── accounts/          # Debtors & Creditors pages
│   │   ├── inventory/         # Inventory management pages
│   │   ├── reports/           # Financial report pages
│   │   ├── pump/              # Pump operations pages
│   │   ├── lube/              # ARS Lube specific pages
│   │   ├── owner/             # Super owner admin pages
│   │   ├── dashboard.js       # Main dashboard
│   │   ├── login.js           # Login page
│   │   └── profile.js         # User profile page
│   │
│   └── styles/
│       └── globals.css        # Global styles and Tailwind imports
│
├── public/                    # Static assets
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind configuration
└── next.config.mjs            # Next.js configuration
```

---

## 🛠️ Local Development

### Prerequisites

- **Node.js** v22.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud-hosted)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd ars-erp-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database connection
   DATABASE_URL="postgresql://username:password@localhost:5432/ars_erp_db"
   
   # JWT secret for authentication (use a strong random string in production)
   JWT_SECRET="your-super-secret-key-change-in-production"
   ```

4. **Set up the database**
   ```bash
   # Push the Prisma schema to your database
   npm run db:push
   
   # Seed the database with demo data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run db:push` | Push Prisma schema changes to database |
| `npm run db:seed` | Populate database with demo data |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |

---

## 🚀 Deployment

This application is deployed on **Vercel**. To deploy your own instance:

1. Fork this repository
2. Connect to Vercel
3. Add environment variables (`DATABASE_URL`, `JWT_SECRET`)
4. Deploy

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 👤 Author

**Nazifa Tasnim Shifa**

- GitHub: [@NazifaTasnimShifa](https://github.com/NazifaTasnimShifa)
- Email: nazifatasnimshifa@gmail.com

---

<p align="center">
  <strong>Built with ❤️ for ARS Group</strong>
</p>