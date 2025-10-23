# SmartCrowd: Decentralized Crowdfunding on Soroban

- **SmartCrowd** (Crowdfunding dApp on Stellar/Soroban)

- name: Andrew Reinhart
- Stellar Developer
- Rust & Soroban Smart Contract Engineer
- Focused on Decentralized Finance (DeFi)
- Full-Stack Application Developer
- Contributor to the Stellar Ecosystem

## Project details:
This is a fully decentralized Crowdfunding Platform built on the Soroban smart contract platform. The project features two powerful contracts: a custom **Token Contract** for handling donations and a **Crowdfunding Contract** that manages all campaign logistics. Users can create time-bound fundraising campaigns with a specific goal, donate using the designated token, and claim a refund if the campaign fails to reach its target by the deadline. The platform leverages Soroban's native capabilities for transparency and secure asset movement on the Stellar network.

## Vision:
Our vision is to unlock global micro-funding opportunities, establishing a transparent and trustless digital frontier for capital mobilization. By leveraging Soroban's low-cost, high-speed transactions, SmartCrowd will redefine decentralized community funding, empowering creators and innovators worldwide. We aim to create abundance by bridging funding gaps, making capital accessible to anyone with a powerful idea, and driving the next wave of decentralized innovation.

---

> This is a fully decentralized Crowdfunding Platform built on the Soroban smart contract platform. The project features two robust contracts: a custom **Token Contract** for handling donations and a **Crowdfunding Contract** managing campaign logistics. Users can create time-bound funding campaigns with a specific goal, donate using the designated token, and claim a refund if the campaign fails to reach its target by the deadline. The platform leverages Soroban's native capabilities for transparent and secure asset movement, ensuring a trustless fundraising environment on the Stellar network.

---

> Our vision is to unlock global micro-funding opportunities, establishing a transparent and trustless digital frontier for capital mobilization. By leveraging Soroban's low-cost, high-speed transactions, SmartCrowd will redefine decentralized community funding, empowering creators and innovators worldwide. We aim to create abundance by bridging funding gaps, making capital accessible to anyone with a powerful idea, and driving the next wave of decentralized innovation.

---

1.  **Smart Contract Core Development (Rust):** Implement the core `TokenContract` and `CrowdfundingContract`. Key contract state to manage: `Campaign` struct (`owner`, `goal`, `raised`, `donations`) and global campaign mapping (`CAMPAIGNS`).
2.  **Smart Contract Functions & Features:** Develop and test essential functions: `create_campaign(owner, goal, deadline, token)`, `donate(campaign_id, donor, amount)` (calling `token.transfer()`), and `refund(campaign_id, donor)` (with strict validation).
3.  **Frontend Setup & Bindings (React/TS):** Set up the React Router and Tailwind CSS environment. Generate *TypeScript bindings* for both contracts (`crowdfunding-contract` and `token-contract`) to ensure type-safe interaction with the fixed backend.
4.  **Frontend Development (UI/UX):** Implement core functionality: display campaign status and integrate the new *Create Campaign* feature with Goal and Deadline input forms.
5.  **Deployment & Final Testing:** Deploy the WASM binaries (`token.wasm`, `crowdfunding.wasm`) to the Stellar Testnet. Conduct full end-to-end testing via the live frontend (*Create Campaign* -> *Donate* -> *Refund*).

---

> I began this journey to solve a genuine problem: making community fundraising truly transparent. Building on Soroban was a technical challenge, especially integrating the custom token and managing cross-contract calls for refunds. Seeing the tests pass and the logic execute on the Testnet was incredibly rewarding. This project is my first step toward actively contributing to a more decentralized financial ecosystem.

---

#### ChatGPT prompt 5: Installation Guide Draft

## 🛠️ Installation Guide (Frontend & Backend)

This project is divided into two parts: the Rust smart contracts (backend) and the React/TypeScript web application (frontend).

### Prerequisites

Ensure you have the following installed:

* **Rust** (`rustup`)
* **Soroban CLI** (`soroban` and `stellar` commands)
* **Node.js** (v20+) and **npm**
* A funded **Testnet** account (e.g., your `alice` identity).

### 1. Backend: Build and Deploy Contracts

Navigate to your backend project's root directory (e.g., `my-token-project`).

a. **Build Contracts:**
   ```bash
   # Build Token Contract
   cd contracts/token && stellar contract build
   
   # Build Crowdfunding Contract
   cd ../crowdfunding && stellar contract build
   cd ../..
