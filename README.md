# SmartCrowd: Decentralized Crowdfunding on Soroban

## Project name:
- **SmartCrowd** (Crowdfunding dApp on Stellar/Soroban)

## Who are you: (Silakan ganti/edit sesuai profil Anda)
- name: Andrew Reinhart
- Stellar Developer
- Rust & Soroban Smart Contract Engineer
- Fokus pada Keuangan Terdesentralisasi (DeFi)
- Pengembang Aplikasi Full-Stack
- Kontributor Ekosistem Stellar

## Project details:
Ini adalah Platform Crowdfunding yang sepenuhnya terdesentralisasi yang dibangun di atas platform smart contract Soroban. Proyek ini menampilkan dua kontrak yang kuat: Kontrak Token kustom untuk menangani donasi dan Kontrak Crowdfunding yang mengelola semua logistik campaign. Pengguna dapat membuat campaign penggalangan dana terikat waktu dengan target tertentu, berdonasi menggunakan token yang ditunjuk, dan mengklaim refund jika campaign gagal mencapai targetnya pada batas waktu. Platform ini memanfaatkan kemampuan asli Soroban untuk transparansi dan pergerakan aset yang aman di jaringan Stellar.

## Vision:
Visi kami adalah membuka peluang micro-funding global, establishing a transparent and trustless digital frontier for capital mobilization. By leveraging Soroban's low-cost, high-speed transactions, SmartCrowd will redefine decentralized community funding, empowering creators and innovators worldwide. We aim to create abundance by bridging funding gaps, making capital accessible to anyone with a powerful idea, and driving the next wave of decentralized innovation.

---

## Technical Prompts & Planning

### ChatGPT prompt 1: Project Description
Write me a project description, in less than 150 simple, straightforward words, for the following blockchain project details to be implemented on **Stellar/Soroban** Blockchain. Describe a complete project:

> This is a fully decentralized Crowdfunding Platform built on the Soroban smart contract platform. The project features two robust contracts: a custom **Token Contract** for handling donations and a **Crowdfunding Contract** managing campaign logistics. Users can create time-bound funding campaigns with a specific goal, donate using the designated token, and claim a refund if the campaign fails to reach its target by the deadline. The platform leverages Soroban's native capabilities for transparent and secure asset movement, ensuring a trustless fundraising environment on the Stellar network.

---

### ChatGPT prompt 2: Vision Statement
Now, also write a vision statement, in 100 simple, straightforward words, for this project. Talk about how this project can create a big impact. Here are my notes:

> Our vision is to unlock global micro-funding opportunities, establishing a transparent and trustless digital frontier for capital mobilization. By leveraging Soroban's low-cost, high-speed transactions, SmartCrowd will redefine decentralized community funding, empowering creators and innovators worldwide. We aim to create abundance by bridging funding gaps, making capital accessible to anyone with a powerful idea, and driving the next wave of decentralized innovation.

---

### ChatGPT prompt 3: Software Development Plan
Now, write me a software development plan for this project. Please mainly focus on the smart contract functions, variables, features to be developed. Then, mention the front-end development as well. It should have less than 6 steps in total. Final step can be deployment.

1.  **Smart Contract Core Development (Rust):** Implement the core `TokenContract` and `CrowdfundingContract`. Key contract state to manage: `Campaign` struct (`owner`, `goal`, `raised`, `donations`) and global campaign mapping (`CAMPAIGNS`).
2.  **Smart Contract Functions & Features:** Develop and test essential functions: `create_campaign(owner, goal, deadline, token)`, `donate(campaign_id, donor, amount)` (memanggil `token.transfer()`), and `refund(campaign_id, donor)` (dengan validasi yang ketat).
3.  **Frontend Setup & Bindings (React/TS):** Siapkan lingkungan React Router dan Tailwind CSS. Hasilkan *TypeScript bindings* untuk kedua kontrak (`crowdfunding-contract` dan `token-contract`) untuk memastikan interaksi *type-safe* dengan *backend* yang diperbaiki.
4.  **Frontend Development (UI/UX):** Implementasikan fungsionalitas utama: menampilkan status *campaign* dan integrasikan fitur *Create Campaign* baru dengan *form* input Goal dan Deadline.
5.  **Deployment & Final Testing:** *Deploy* biner WASM (`token.wasm`, `crowdfunding.wasm`) ke Stellar Testnet. Lakukan pengujian *end-to-end* penuh melalui *live frontend* (*Create Campaign* -> *Donate* -> *Refund*).

---

### ChatGPT prompt 4: Personal Story Summary
Now, write a personal story summary in less than 100 words. here are my notes:

> I began this journey to solve a genuine problem: making community fundraising truly transparent. Building on Soroban was a technical challenge, especially integrating the custom token and managing cross-contract calls for refunds. Seeing the tests pass and the logic execute on the Testnet was incredibly rewarding. This project is my first step toward actively contributing to a more decentralized financial ecosystem.

---

### ImgCreator prompt:
futuristic happy digital painting with a **BULL** hero in a happy, bright futuristic **CITY**, KEYWORDS (**creating abundance**, **new frontiers**)

---

### ChatGPT prompt 5: Installation Guide Draft

## 🛠️ Installation Guide (Frontend & Backend)

Proyek ini dibagi menjadi dua bagian: kontrak Rust (backend) dan aplikasi web React/TypeScript (frontend).

### Prasyarat

Pastikan Anda telah menginstal yang berikut:

* **Rust** (`rustup`)
* **Soroban CLI** (`soroban` dan `stellar` commands)
* **Node.js** (v20+) dan **npm**
* Akun **Testnet** yang sudah didanai (misalnya, *identity* `alice` Anda).

### 1. Backend: Build dan Deploy Kontrak

Navigasi ke direktori root proyek backend Anda (misalnya, `my-token-project`).

a. **Build Kontrak:**
   ```bash
   # Build Token Contract
   cd contracts/token && stellar contract build
   
   # Build Crowdfunding Contract
   cd ../crowdfunding && stellar contract build
   cd ../..
