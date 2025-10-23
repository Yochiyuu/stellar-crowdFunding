# Stellar Soroban Crowdfunding Project

This project is an implementation of a decentralized application (dApp) for crowdfunding, built on the Stellar Soroban platform. This dApp allows users to create fundraising campaigns and other users to donate to those campaigns using a custom Stellar token.

## Project Structure

This project consists of two main parts:

1.  **Soroban Contracts (`my-token-project`)**:
    * Contains Rust code for two smart contracts:
        * `contracts/token`: A custom token contract (based on the Soroban token standard) used for donations.
        * `contracts/crowdfunding`: The main contract that handles the logic for campaign creation, donations, and refunds.
    * Uses a Cargo workspace to manage dependencies.

2.  **React Frontend (`crowdfund`)**:
    * A user interface (UI) built using React and Vite.
    * Uses [React Router](https://reactrouter.com/) for routing.
    * Uses [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) (evident from `components.json` and UI component structure) for styling.
    * Uses [`@creit.tech/stellar-wallets-kit`](https://github.com/Creit-Tech/stellar-wallets-kit) for Stellar wallet integration (like Freighter).
    * Interacts with the Soroban contracts via auto-generated JavaScript libraries (`packages/crowdfunding` and `packages/token`).

## Soroban Contracts

### `token` Contract (`my-token-project/contracts/token`)

* Implements basic token functionality according to the Soroban standard.
* Key functions:
    * `initialize`: Initializes the token with a name, symbol, total supply, and admin address.
    * `name`, `symbol`, `decimals`, `total_supply`: Retrieve token metadata.
    * `balance`: Checks the token balance for a specific address.
    * `transfer`: Sends tokens from one address to another.
* The `src/lib.rs` file contains the main contract logic.
* The `src/test.rs` file contains unit tests to ensure contract functionality.

### `crowdfunding` Contract (`my-token-project/contracts/crowdfunding`)

* The core contract that manages crowdfunding campaigns.
* Stores campaign data in a `Map` using a unique ID (`u64`).
* `Campaign` Data Structure:
    * `owner`: The address of the campaign creator.
    * `goal`: The target funding amount (in token stroops).
    * `deadline`: The campaign deadline (Unix timestamp).
    * `token`: The address of the token contract used for donations.
    * `raised`: The amount of funds already raised.
    * `donations`: A `Map` that tracks the donation amount from each donor address.
* Key Functions:
    * `create_campaign`: Creates a new campaign with specified parameters. Requires authorization from the `owner`. Returns the campaign ID.
    * `donate`: Sends a donation to a specific campaign. Requires authorization from the `donor`. Calls the `transfer` function on the associated token contract.
    * `refund`: Returns a donation to the donor if the campaign has ended *and* the funding goal was not met. Requires authorization from the `donor`. Calls the `transfer` function on the token contract to send funds back.
    * `get_campaign`, `get_next_id`, `get_total_raised`, `get_donation`, `get_goal`, `get_deadline`, `is_goal_reached`, `is_ended`, `get_progress_percentage`: Read-only functions to get information about campaigns.
* The `src/lib.rs` file contains the main contract logic.
* The `src/test.rs` file contains unit tests, including success and failure scenarios for donations and refunds.

## React Frontend (`crowdfund`)

* **Setup**: Uses Vite as the build tool and development server (`vite.config.ts`). Uses `react-router` for client-side and server-side routing (`app/routes.ts`).
* **Styling**: Uses Tailwind CSS (`tailwind.config.js`, `app/app.css`) and components from `shadcn/ui` (`app/components/ui`). The `Card` component features a spotlight effect (`app/components/card.tsx`, `app/components/card.css`).
* **Wallet Integration**: Uses `stellar-wallets-kit` to connect wallets (see `app/config/wallet.client.ts`). The `ConnectWallet` component (`app/components/connect-wallet.tsx`) handles the display of the connect/disconnect button and account info. The `useWallet` hook (`app/hooks/use-wallet.ts`) provides wallet-related state and functions.
* **Contract Interaction**:
    * Imports the JS client libraries for the contracts (`crowdfunding-contract` and `token-contract`) located in the `packages/` directory.
    * The `useSubmitTransaction` hook (`app/hooks/use-submit-transaction.ts`) is used to send and monitor the status of Soroban transactions (donate, refund, create).
    * Main Page (`app/routes/home.tsx`):
        * Displays the status of the first campaign (ID 0).
        * Allows users to donate to campaign ID 0.
        * Allows donors to request a refund if conditions are met.
        * Displays a form to create a new campaign.
        * Fetches and displays the user's token balance (`useNativeBalance` might need renaming if using a custom token; `useTokenBalance` might be more appropriate).
        * Fetches campaign data (goal, deadline, raised, etc.) periodically or on a refresh trigger.
* **UI Components**:
    * `Header`: Displays the title and the `ConnectWallet` button.
    * `Card`: A basic component to wrap UI sections with a spotlight effect.
    * `Input`, `Button`, `DropdownMenu`: Basic UI components from `shadcn/ui`.
    * `TextRotate`: A component for rotating text animation.

## How to Run

### Soroban Contracts

1.  Ensure you have [Rust and the Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup) installed.
2.  Navigate to the `my-token-project` directory.
3.  To build the contracts:
    ```bash
    cd contracts/token
    soroban contract build
    cd ../crowdfunding
    soroban contract build
    ```
    Or from the `my-token-project` root:
    ```bash
    soroban contract build --contracts token crowdfunding
    ```
4.  To run tests:
    ```bash
    cargo test
    ```
5.  To deploy (example):
    ```bash
    # Deploy token
    soroban contract deploy --wasm contracts/token/target/wasm32-unknown-unknown/release/token.wasm --source <YOUR_ACCOUNT_NAME> --network testnet
    # (Note the Token Contract ID)

    # Deploy crowdfunding
    soroban contract deploy --wasm contracts/crowdfunding/target/wasm32-unknown-unknown/release/crowdfunding.wasm --source <YOUR_ACCOUNT_NAME> --network testnet
    # (Note the Crowdfunding Contract ID)
    ```
    **Important:** Update `CROWDFUNDING_CONTRACT_ID` and `TOKEN_CONTRACT_ID` in `crowdfund/app/routes/home.tsx` with your newly deployed contract IDs.

### React Frontend

1.  Ensure you have [Node.js and npm](https://nodejs.org/) installed.
2.  Navigate to the `crowdfund` directory.
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Generate/Update contract bindings (if contract IDs change or contracts are updated):
    ```bash
    # (Optional, adjust IDs if needed)
    cd packages/token
    npm run build # Or soroban contract bindings ts ...
    cd ../crowdfunding
    npm run build # Or soroban contract bindings ts ...
    cd ../..
    ```
5.  Run the development server:
    ```bash
    npm run dev
    ```
6.  Open your browser to `http://localhost:5173`.
