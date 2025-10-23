💡 SmartCrowd: A Decentralized Crowdfunding Platform on Soroban
(Visual prompt result: "futuristic happy digital painting with a MASCOT (bull) hero in a happy, bright futuristic SETTING (city), KEYWORDS (creating abundance, new frontiers)")

🚀 Project Description
SmartCrowd is a fully decentralized Crowdfunding Platform implemented on the XX Blockchain using Soroban. This project consists of two main contracts: a custom Token Contract for donations, and a Crowdfunding Contract to manage campaign logistics. Users can create time-bound campaigns with specific funding goals. Donors can contribute using the specified token and are eligible for a refund if the campaign fails to meet its goal by the deadline. The platform leverages Soroban's speed and transparency to ensure a secure and trustless fundraising environment on the Stellar network.

🎯 Vision
Our vision is to unlock global micro-funding opportunities, building a transparent and trustless digital frontier for capital mobilization. By leveraging Soroban's low-cost, high-speed transactions, SmartCrowd will redefine decentralized community funding, empowering creators and innovators worldwide. We aim to create abundance by bridging the funding gap and fostering the next wave of decentralized innovation.

🧑‍💻 About Me (Contributor)
Name: Andrew Reinhart

Stellar Developer

Rust & Soroban Smart Contract Engineer

Focused on Decentralized Finance (DeFi)

Full-Stack Application Developer

Stellar Ecosystem Contributor

🔧 Technical Project Details
This fully decentralized Crowdfunding Platform is built on the Soroban smart contract platform. The project features two robust contracts: a custom Token Contract to handle donations and a Crowdfunding Contract to manage all campaign logistics.

Users can create time-limited fundraising campaigns with a specific goal, donate using the designated token, and claim a refund if the campaign fails to reach its target by the deadline. The platform utilizes Soroban's native capabilities for transparency and secure asset movement on the Stellar network, ensuring a trustless fundraising environment.

🗺️ Software Development Plan
This development plan focuses on the smart contracts and front-end integration in 5 key steps:

Smart Contract Core Development (Rust): Implement the core of the TokenContract and CrowdfundingContract. The Crowdfunding contract must manage key states, including a Campaign struct (owner, goal, raised, donations) and a global map for active campaigns (CAMPAIGNS).

Smart Contract Functions and Features: Develop and test essential functions like create_campaign(owner, goal, deadline, token), donate(campaign_id, donor, amount) which calls token.transfer(), and refund(campaign_id, donor) with strict validation.

Frontend Setup & Bindings (React/TypeScript): Set up the React Router and Tailwind CSS environment. Generate TypeScript bindings for both contracts (crowdfunding-contract and token-contract) to ensure type-safe interaction with the backend.

Frontend Development (UI/UX): Implement core functionality: displaying the current campaign status and integrating the new Create Campaign feature with Goal and Deadline input forms.

Deployment & Final Testing: Deploy the WASM binaries (token.wasm, crowdfunding.wasm) to the Stellar Testnet, followed by complete end-to-end testing via the live frontend (Create Campaign -> Donate -> Refund).

💬 Personal Story
I started this journey to solve a fundamental problem: making community fundraising truly transparent. Building on Soroban was a technical challenge, especially integrating a custom token and managing inter-contract calls for refunds. Seeing the tests pass and the logic execute on the Testnet was incredibly satisfying. This project is my first step toward actively contributing to a more decentralized financial ecosystem.

🛠️ Installation Guide (Frontend & Backend)
This project is divided into two parts: the Rust smart contracts (backend) and the React/TypeScript web app (frontend).

Prerequisites
Ensure you have the following installed:

Rust (rustup)

Soroban CLI (soroban and stellar commands)

Node.js (v20+) and npm

A funded Testnet account (e.g., your alice identity).

1. Backend: Build and Deploy Contracts
Navigate to your backend project's root directory (e.g., my-token-project).

a. Build Contracts:

Bash

# Build Token Contract
cd contracts/token && stellar contract build

# Build Crowdfunding Contract
cd ../crowdfunding && stellar contract build
cd ../..
b. Deploy and Initialize Contracts:

You need to deploy and initialize both contracts. Use stellar contract deploy to get the contract IDs.

Bash

# 1. Deploy & Initialize Token Contract (Get TOKEN_CONTRACT_ID)
# Ensure you use the correct admin_public_key and network-passphrase.
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/token.wasm

# Save the ID above and replace CARTOX...
# Initialize the Token Contract (e.g., 1M token total supply)
stellar contract invoke --id CARTOXDYIATAXBADV6HO7BDFKWCO47GRUUYTHJ7LVEBNN7GCZLMWR27S --fn initialize --source <admin_public_key> -- <admin_public_key> "Test Token" "TST" 10000000000000000

# 2. Deploy Crowdfunding Contract (Get CROWDFUNDING_CONTRACT_ID)
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/crowdfunding.wasm

# 3. Note both of these Contract IDs.
2. Frontend: Configure and Run
Navigate to your frontend directory (e.g., crowdfund).

a. Install Dependencies:

Bash

npm install
b. Update Contract Configuration (Optional, If Not Automated):

Ensure crowdfund/app/routes/home.tsx uses the correct CROWDFUNDING_CONTRACT_ID and TOKEN_CONTRACT_ID (or update the TypeScript bindings as needed).

c. Run the Application:

Bash

npm run dev
Your application will be available at http://localhost:5173.
