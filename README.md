# Payment Gateway - README

This repository contains a **Payment Gateway** system built with **NestJS**, **MongoDB**, **Redis**, and **Docker**. It encapsulates multiple architectural components, all currently organized within a single project. Over time, each module (Risk Engine, Payment Processing, etc.) can be split out into separate microservices if needed.

## Table of Contents

1. [Overview](#overview)  
2. [Architecture](#architecture)  
   1. [Payment Platform (Monolith Module)](#payment-platform-monolith-module)  
   2. [Risk Engine](#risk-engine)  
   3. [Payment Processing](#payment-processing)  
   4. [Ledger & Wallet](#ledger--wallet)  
   5. [Reconciliation Processor](#reconciliation-processor)  
   6. [Payment Scheduler](#payment-scheduler)  
3. [Tech Stack](#tech-stack)  
4. [Installation & Setup](#installation--setup)  
5. [Testing](#testing)  
6. [References](#references)

---

## Overview

This payment gateway handles the submission of payments (pay-ins) and distribution of funds (pay-outs). We prioritize **data consistency**, **double-entry accounting**, **idempotency**, and **immutability**. The system aims to prevent duplicate transactions, maintain robust ledger entries, and handle scheduled and real-time payment flows.

### Key Use Cases

- **Pay-In**: A user adds funds into the system via credit card, bank account, PayPal, or Apple/Google Pay.  
- **Pay-Out**: A user withdraws funds from the system to their external accounts.  
- **Scheduled Payments**: Automatic recurring payments.  
- **Risk Detection**: Evaluates each payment for potential fraud.  
- **Reconciliation**: Compares internal records with Payment Service Provider (PSP) reports, resolving discrepancies.

---

## Architecture

Below is a conceptual flow of the main modules. In this repository, these modules are part of a single NestJS app (monolith). Later, they can be extracted into separate microservices.


### Payment Platform (Monolith Module)

- **Purpose**: Main entry point for all external requests. Hosts controllers such as:
  - `POST /payments`  
  - `GET /payments/:id`  
  - `POST /scheduled-payments`  
  - etc.
- **Responsibilities**:
  - Validates requests (e.g. using DTOs).  
  - Ensures **idempotency** by checking `checkoutUuid`.  
  - Delegates to the internal **Risk Engine** and **Payment Processing**.  
  - Persists final transactions in the **Ledger** and updates **Wallet** balances.

### Risk Engine

- **Purpose**: Detects suspicious or fraudulent transactions.  
- **Responsibilities**:
  - Rule-based logic (e.g., large amounts, repeated attempts).  
  - Optional ML integration for advanced detection.

### Payment Processing

- **Purpose**: Integrates with external Payment Service Providers (PSPs) like Stripe, PayPal, etc.  
- **Responsibilities**:
  - Communicates with PSPs to execute or confirm payments.  
  - Manages retries and circuit-breaking if a PSP is down or failing.

### Ledger & Wallet

- **Ledger**: Immutably stores all double-entry records. Each transaction has two entries, netting zero.  
- **Wallet**: Holds each user’s current account balance. Updated alongside ledger entries for quick reads.

### Reconciliation Processor

- **Purpose**: Hourly or daily, it reconciles internal ledger/wallet states with PSP settlement data.  
- **Responsibilities**:
  - Identifies discrepancies.  
  - Automatically attempts to fix expected categories of errors.  
  - Flags unknown mismatches for manual review.

### Payment Scheduler

- **Purpose**: Manages scheduled tasks for recurring or delayed payments.  
- **Responsibilities**:
  - Stores scheduling config (e.g., daily, weekly).  
  - Periodically triggers Payment Platform flows.

---

## Tech Stack

- **NestJS** (TypeScript) for the main application code and module structure.  
- **MongoDB** for storing payment requests, ledger entries, etc.  
- **Redis** for caching, idempotency checks, ephemeral data.  
- **Docker** to containerize each component or the entire monolith.  
- **Jest** + **SuperTest** for testing (unit, integration/E2E).

---

## Installation & Setup

**Clone this repo**:

  ```bash
  git clone https://github.com/vitalyevm/payment-gateway.git
  cd payment-gateway
  yarn install
  yarn start:dev
  docker-compose up --build
```
