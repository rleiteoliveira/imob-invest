# Imob-Invest Simulator

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

![Imob-Invest Demo](https://placehold.co/800x400?text=Imob-Invest+Dashboard+Preview)
*(Placeholder: Add your application screenshot or demo GIF here)*

## 🏠 The Problem
Buying off-plan properties involves complex financial payments that are often misunderstood by buyers. The distinction between **Construction Phase** (INCC corrections, Work Evolution Interest) and **Post-Key Phase** (Bank Financing, Amortization) is a common pain point. Buyers struggle to visualize how balloon payments, down payments, and inflation affect their cash flow.

## 💡 The Solution
**Imob-Invest Simulator** is a mobile-first, visual financial calculator that bridges this gap. It provides a step-by-step wizard to model complex payment scenarios, generating professional PDF proposals and offering real-time visual feedback on financial evolution.

---

## 🚀 Key Features

### 🔄 Dual-Phase Calculation Logic
A sophisticated financial engine that decouples payment phases:
- **Construction Phase**: Dynamically calculates INCC (National Construction Cost Index) corrections and "Juros de Obra" (Work Interest) based on construction progress.
- **Post-Keys Phase**: Simulates bank financing using standard amortization systems (SAC/PRICE) with insurance components (MIP/DFI).

### 🎨 Smart UX/UI
- **Wizard-Based Flow**: Guided 3-step process (Property Data -> Entry Plan -> Financing).
- **Hybrid Inputs**: Fluid interaction with touch-optimized sliders (`radix-ui/react-slider`) and manual typing.
- **Mobile-First**: Native-feeling drawers and bottom sheets for complex inputs on small screens.
- **Interactive Charts**: Real-time visualization of payment evolution using `Recharts`.

### 🧠 Advanced State Management
Handles complex user scenarios with precision:
- **Dynamic Entry Installments**: Automatically validates and adjusts installments based on remaining construction time.
- **Scenario Handling**: Differentiates between "Pre-Launch", "Under Construction", and "Ready to Move" states.
- **Balloon Payments**: Chronologically ordered, manually manageable intermediate payments.

### 📄 Professional Reporting
Generates high-quality, print-ready PDF reports (`@react-pdf/renderer`) featuring:
- **Double-Column Layout**: Optimized for A4 printing.
- **Financial Summary**: Clear breakdown of totals, interest paid, and monthly projections.
- **Brandable**: Supports white-labeling for real estate agents.

---

## � Financial Math Engine

The core differentiator of this project is its adherence to Brazilian Real Estate financial models.

### INCC & Work Interest (Juros de Obra)
Unlike simple loan calculators, Imob-Invest simulates the **"Evolução de Obra"**:
1.  **INCC Correction**: Applied monthly to the outstanding balance due to the builder.
2.  **Work Interest**: Calculated on the *disbursed* amount by the funding bank. As the construction progresses (percentage complete increases), the bank releases more funds, increasing the interest paid by the buyer—guaranteeing no amortization happens until keys are delivered.

This logic is implemented using `decimal.js` for high-precision floating-point arithmetic, avoiding standard JS math errors.

---

## 🛠 Tech Stack

- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Shadcn/UI (Radix Primitives)
- **State/Logic**: Custom Hooks, Local Storage (History), Context API
- **Visualization**: Recharts, Embla Carousel
- **PDF Generation**: @react-pdf/renderer
- **Utilities**: Decimal.js (Math), Lucide React (Icons), Vaul (Drawers)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/imob-invest.git
    cd imob-invest
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

---

## 🚧 Project Status

**Current Status**: 🟢 Active Development / MVP

Refining the "Manual Bank Simulation" feature and Mobile UX optimizations.

---

*Developed with a focus on Software Engineering excellence and Product Design.*
