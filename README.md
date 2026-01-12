# ARS Group - ERP Business Dashboard (Prototype)

This project is a high-fidelity, interactive prototype for a web-based ERP and business intelligence dashboard for the ARS Group. It provides a centralized overview of two distinct businesses, ARS Lube LTD BD and ARS Corporation, allowing for comprehensive monitoring of financial health, inventory, and operational metrics.

## ✨ Key Features

- **Multi-Company Architecture**: Seamlessly switch between different company dashboards.
- **Authentication**: Secure login page to protect business data.
- **Dynamic Dashboard**: At-a-glance overview of crucial KPIs, including profitability ratios, liquidity, sales performance, and top expenses.
- **Interactive Charts & Tables**: Visual representations of financial trends and data, built with Chart.js.
- **Full-Featured Modules**: Complete pages for managing:
  - **Accounts**: Sundry Debtors and Creditors with filtering and add/edit/delete functionality.
  - **Inventory**: Detailed status, purchases, sales, and process loss tracking.
  - **Financial Reports**: Dynamic, accountant-approved layouts for the Balance Sheet, Income Statement, Cash Flow Statement, and Trial Balance.
  - **Fixed Assets**: A complete register of all company assets.
- **Responsive Design**: A modern, collapsible sidebar and mobile-friendly layout built with Tailwind CSS and Headless UI.
- **Placeholder Modals**: Functional modals for all data entry points (Add Sale, Add Product, etc.) ready for backend integration.

## 🚀 Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with Pages Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Headless UI](https://headlessui.com/) for accessible components (Modals, Dropdowns).
- **Icons**: [Heroicons](https://heroicons.com/)
- **Charts**: [Chart.js](https://www.chartjs.org/) with `react-chartjs-2`.
- **Linting & Formatting**: ESLint.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18.x or higher)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd ars-erp-dashboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Login Credentials (for Prototype)

- **Email**: `admin@arsgroup.com`
- **Password**: Any password will work.

---

This project was bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).