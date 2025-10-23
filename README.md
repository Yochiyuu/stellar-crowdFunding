# Proyek Crowdfunding Stellar Soroban

Proyek ini adalah implementasi aplikasi terdesentralisasi (dApp) crowdfunding yang dibangun di atas platform Stellar Soroban. dApp ini memungkinkan pengguna untuk membuat kampanye penggalangan dana dan pengguna lain untuk berdonasi ke kampanye tersebut menggunakan token Stellar khusus.

## Struktur Proyek

Proyek ini terdiri dari dua bagian utama:

1.  **Kontrak Soroban (`my-token-project`)**:
    * Berisi kode Rust untuk dua smart contract:
        * `contracts/token`: Kontrak token kustom (berdasarkan standar token Soroban) yang digunakan untuk donasi.
        * `contracts/crowdfunding`: Kontrak utama yang menangani logika pembuatan kampanye, donasi, dan refund.
    * Menggunakan workspace Cargo untuk mengelola dependensi.

2.  **Frontend React (`crowdfund`)**:
    * Antarmuka pengguna (UI) yang dibangun menggunakan React dan Vite.
    * Menggunakan [React Router](https://reactrouter.com/) untuk routing.
    * Menggunakan [Tailwind CSS](https://tailwindcss.com/) dan [shadcn/ui](https://ui.shadcn.com/) (terlihat dari `components.json` dan struktur komponen UI) untuk styling.
    * Menggunakan [`@creit.tech/stellar-wallets-kit`](https://github.com/Creit-Tech/stellar-wallets-kit) untuk integrasi dompet Stellar (seperti Freighter).
    * Berinteraksi dengan kontrak Soroban melalui pustaka JavaScript yang dihasilkan secara otomatis (`packages/crowdfunding` dan `packages/token`).

## Kontrak Soroban

### Kontrak `token` (`my-token-project/contracts/token`)

* Mengimplementasikan fungsionalitas token dasar sesuai standar Soroban.
* Fungsi utama:
    * `initialize`: Menginisialisasi token dengan nama, simbol, total pasokan, dan alamat admin.
    * `name`, `symbol`, `decimals`, `total_supply`: Mengambil metadata token.
    * `balance`: Mengecek saldo token untuk alamat tertentu.
    * `transfer`: Mengirim token dari satu alamat ke alamat lain.
* File `src/lib.rs` berisi logika utama kontrak.
* File `src/test.rs` berisi unit test untuk memastikan fungsionalitas kontrak.

### Kontrak `crowdfunding` (`my-token-project/contracts/crowdfunding`)

* Kontrak inti yang mengelola kampanye crowdfunding.
* Menyimpan data kampanye dalam sebuah `Map` menggunakan ID unik (`u64`).
* Struktur Data `Campaign`:
    * `owner`: Alamat pembuat kampanye.
    * `goal`: Jumlah target dana (dalam stroops token).
    * `deadline`: Batas waktu kampanye (Unix timestamp).
    * `token`: Alamat kontrak token yang digunakan untuk donasi.
    * `raised`: Jumlah dana yang sudah terkumpul.
    * `donations`: `Map` yang melacak jumlah donasi dari setiap alamat donatur.
* Fungsi Utama:
    * `create_campaign`: Membuat kampanye baru dengan parameter yang ditentukan. Memerlukan otorisasi dari `owner`. Mengembalikan ID kampanye.
    * `donate`: Mengirimkan donasi ke kampanye tertentu. Memerlukan otorisasi dari `donor`. Memanggil fungsi `transfer` pada kontrak token terkait.
    * `refund`: Mengembalikan donasi kepada donatur jika kampanye telah berakhir *dan* target dana tidak tercapai. Memerlukan otorisasi dari `donor`. Memanggil fungsi `transfer` pada kontrak token terkait untuk mengirim dana kembali.
    * `get_campaign`, `get_next_id`, `get_total_raised`, `get_donation`, `get_goal`, `get_deadline`, `is_goal_reached`, `is_ended`, `get_progress_percentage`: Fungsi read-only untuk mendapatkan informasi tentang kampanye.
* File `src/lib.rs` berisi logika utama kontrak.
* File `src/test.rs` berisi unit test, termasuk skenario sukses dan gagal untuk donasi dan refund.

## Frontend React (`crowdfund`)

* **Setup**: Menggunakan Vite sebagai build tool dan development server (`vite.config.ts`). Menggunakan `react-router` untuk routing sisi klien dan server (`app/routes.ts`).
* **Styling**: Menggunakan Tailwind CSS (`tailwind.config.js`, `app/app.css`) dan komponen dari `shadcn/ui` (`app/components/ui`). Komponen `Card` memiliki efek spotlight (`app/components/card.tsx`, `app/components/card.css`).
* **Integrasi Dompet**: Menggunakan `stellar-wallets-kit` untuk menghubungkan dompet (lihat `app/config/wallet.client.ts`). Komponen `ConnectWallet` (`app/components/connect-wallet.tsx`) menangani tampilan tombol connect/disconnect dan informasi akun. Hook `useWallet` (`app/hooks/use-wallet.ts`) menyediakan state dan fungsi terkait dompet.
* **Interaksi Kontrak**:
    * Mengimpor pustaka JS klien untuk kontrak (`crowdfunding-contract` dan `token-contract`) yang berada di direktori `packages/`.
    * Hook `useSubmitTransaction` (`app/hooks/use-submit-transaction.ts`) digunakan untuk mengirim dan memantau status transaksi Soroban (donasi, refund, create).
    * Halaman utama (`app/routes/home.tsx`):
        * Menampilkan status kampanye pertama (ID 0).
        * Memungkinkan pengguna untuk berdonasi ke kampanye ID 0.
        * Memungkinkan donatur untuk melakukan refund jika syarat terpenuhi.
        * Menampilkan form untuk membuat kampanye baru.
        * Mengambil dan menampilkan saldo token pengguna (`useNativeBalance` mungkin perlu diubah namanya jika menggunakan token kustom, hook `useTokenBalance` mungkin lebih sesuai).
        * Mengambil data kampanye (goal, deadline, raised, dll.) secara berkala atau saat ada trigger refresh.
* **Komponen UI**:
    * `Header`: Menampilkan judul dan tombol `ConnectWallet`.
    * `Card`: Komponen dasar untuk membungkus bagian UI dengan efek spotlight.
    * `Input`, `Button`, `DropdownMenu`: Komponen UI dasar dari `shadcn/ui`.
    * `TextRotate`: Komponen untuk animasi teks berputar.

## Cara Menjalankan

### Kontrak Soroban

1.  Pastikan Anda memiliki [Rust dan Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup) terinstal.
2.  Masuk ke direktori `my-token-project`.
3.  Untuk build kontrak:
    ```bash
    cd contracts/token
    soroban contract build
    cd ../crowdfunding
    soroban contract build
    ```
    atau dari root `my-token-project`:
    ```bash
    soroban contract build --contracts token crowdfunding
    ```
4.  Untuk menjalankan tes:
    ```bash
    cargo test
    ```
5.  Untuk deploy (contoh):
    ```bash
    # Deploy token
    soroban contract deploy --wasm contracts/token/target/wasm32-unknown-unknown/release/token.wasm --source <NAMA_AKUN_ANDA> --network testnet
    # (Catat ID Kontrak Token)

    # Deploy crowdfunding
    soroban contract deploy --wasm contracts/crowdfunding/target/wasm32-unknown-unknown/release/crowdfunding.wasm --source <NAMA_AKUN_ANDA> --network testnet
    # (Catat ID Kontrak Crowdfunding)
    ```
    **Penting:** Perbarui `CROWDFUNDING_CONTRACT_ID` dan `TOKEN_CONTRACT_ID` di `crowdfund/app/routes/home.tsx` dengan ID kontrak yang baru Anda deploy.

### Frontend React

1.  Pastikan Anda memiliki [Node.js dan npm](https://nodejs.org/) terinstal.
2.  Masuk ke direktori `crowdfund`.
3.  Instal dependensi:
    ```bash
    npm install
    ```
4.  Generate/Update bindings kontrak (jika ID kontrak berubah atau kontrak diupdate):
    ```bash
    # (Opsional, sesuaikan ID jika perlu)
    cd packages/token
    npm run build # Atau soroban contract bindings ts ...
    cd ../crowdfunding
    npm run build # Atau soroban contract bindings ts ...
    cd ../..
    ```
5.  Jalankan development server:
    ```bash
    npm run dev
    ```
6.  Buka browser Anda ke `http://localhost:5173`.

## Lisensi

[Tentukan lisensi proyek Anda, misalnya MIT, Apache-2.0, dll.]
