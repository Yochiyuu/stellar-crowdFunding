import { scValToNative } from "@stellar/stellar-sdk"; // Tambahkan scValToNative
import {
  CalendarClock,
  Donut,
  Percent,
  PiggyBank,
  PlusCircle, // Icon baru
  RotateCcw,
  Target,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "~/components/card";
import { TextRotate } from "~/components/text-rotate";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { signTransaction } from "~/config/wallet.client";
import { useSubmitTransaction } from "~/hooks/use-submit-transaction";
import { useWallet } from "~/hooks/use-wallet";
// --- UPDATE IMPORT DAN KONSTANTA ---
import * as Crowdfund from "crowdfunding-contract"; // Sesuaikan nama package jika berbeda
import * as Token from "token-contract"; // Sesuaikan nama package jika berbeda
import type { Route } from "./+types/home";

// ID Kontrak dari hasil deploy Anda
const CROWDFUNDING_CONTRACT_ID =
  "CA72AEQGZX4J4T6ODLQ34CCN7B74TOVYSP6KLLZBAOC23YPMTK6N2NRD"; // ID BARU
const TOKEN_CONTRACT_ID =
  "CARTOXDYIATAXBADV6HO7BDFKWCO47GRUUYTHJ7LVEBNN7GCZLMWR27S";

// RPC URL untuk Testnet
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"; // Sesuaikan jika berbeda
const TOKEN_DECIMALS = 7; // Sesuaikan jika desimal token Anda berbeda saat initialize
const STROOPS_PER_TOKEN = BigInt(10) ** BigInt(TOKEN_DECIMALS);
// --- AKHIR UPDATE ---

// Helper function to format stroops to Token string
function formatStroops(stroops: bigint | number | undefined): string {
  if (stroops === undefined || stroops === null) return "0.00";
  try {
    const value = BigInt(stroops);
    const integerPart = value / STROOPS_PER_TOKEN;
    const fractionalPart = value % STROOPS_PER_TOKEN;
    const fractionalString = fractionalPart
      .toString()
      .padStart(TOKEN_DECIMALS, "0")
      .slice(0, 2);
    const formattedFractional = fractionalString.replace(/0+$/, "");
    if (formattedFractional === "") return integerPart.toString();
    if (formattedFractional.length === 1 && formattedFractional !== "0")
      return `${integerPart}.${formattedFractional}`;
    if (formattedFractional === "0") return integerPart.toString(); // Hindari ".0"
    return `${integerPart}.${formattedFractional}`;
  } catch (e) {
    console.error("Error formatting stroops:", stroops, e);
    return "0.00";
  }
}

// Helper function to format timestamp
function formatDeadline(timestamp: bigint | number | undefined): string {
  if (timestamp === undefined || timestamp === null) return "Not set";
  const tsNumber = Number(timestamp);
  if (!tsNumber || tsNumber === 0) return "Not set";
  const date = new Date(tsNumber * 1000); // Konversi detik ke milidetik
  return date.toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

// Helper untuk konversi datetime-local ke Unix timestamp (seconds bigint)
function datetimeLocalToUnixSecondsBigInt(
  dateTimeString: string
): bigint | null {
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return null; // Invalid date
    return BigInt(Math.floor(date.getTime() / 1000));
  } catch {
    return null;
  }
}

// Helper untuk mendapatkan datetime-local default (misal: 1 hari dari sekarang)
function getDefaultDeadline(): string {
  const now = new Date();
  now.setDate(now.getDate() + 1); // Tambah 1 hari
  // Format YYYY-MM-DDTHH:mm
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Crowdfunding dApp" },
    { name: "description", content: "Donate to our campaign on Stellar!" },
  ];
}

export default function Home() {
  const { address, isConnected } = useWallet();
  const [tokenBalance, setTokenBalance] = useState<bigint>(BigInt(0));
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);

  // --- State ---
  const [campaignId] = useState<bigint>(BigInt(0)); // Fokus ke campaign pertama
  const [amount, setAmount] = useState<string>("");
  const [totalRaised, setTotalRaised] = useState<bigint>(BigInt(0));
  const [goal, setGoal] = useState<bigint>(BigInt(0));
  const [deadline, setDeadline] = useState<bigint>(BigInt(0));
  const [progress, setProgress] = useState<number>(0);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [isGoalReached, setIsGoalReached] = useState<boolean>(false);
  const [contractLoading, setContractLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [myDonation, setMyDonation] = useState<bigint>(BigInt(0));
  const [tokenSymbol, setTokenSymbol] = useState<string>("TOKEN");

  // State untuk form Create Campaign
  const [newGoal, setNewGoal] = useState<string>("");
  const [newDeadline, setNewDeadline] = useState<string>(getDefaultDeadline());

  // --- Initialize Clients ---
  // (Client initialization code - tidak berubah dari sebelumnya)
  const crowdfundContract = useMemo(() => {
    if (!address || !isConnected) return null;
    return new Crowdfund.Client({
      networkPassphrase: NETWORK_PASSPHRASE,
      contractId: CROWDFUNDING_CONTRACT_ID,
      rpcUrl: RPC_URL,
      publicKey: address,
      signTransaction,
      // allowHttp: RPC_URL.startsWith("http://"),
    });
  }, [isConnected, address]);

  const tokenContract = useMemo(() => {
    if (!address || !isConnected) return null;
    return new Token.Client({
      networkPassphrase: NETWORK_PASSPHRASE,
      contractId: TOKEN_CONTRACT_ID,
      rpcUrl: RPC_URL,
      publicKey: address,
      signTransaction,
      // allowHttp: RPC_URL.startsWith("http://"),
    });
  }, [isConnected, address]);

  const readOnlyCrowdfundContract = useMemo(() => {
    return new Crowdfund.Client({
      networkPassphrase: NETWORK_PASSPHRASE,
      contractId: CROWDFUNDING_CONTRACT_ID,
      rpcUrl: RPC_URL,
      allowHttp: true,
    });
  }, []);

  const readOnlyTokenContract = useMemo(() => {
    return new Token.Client({
      networkPassphrase: NETWORK_PASSPHRASE,
      contractId: TOKEN_CONTRACT_ID,
      rpcUrl: RPC_URL,
      allowHttp: true,
    });
  }, []);
  // --- Akhir Initialize Clients ---

  // --- Submit Hooks ---
  const { submit: submitDonation, isSubmitting: isSubmittingDonation } =
    useSubmitTransaction({
      rpcUrl: RPC_URL,
      networkPassphrase: NETWORK_PASSPHRASE,
      onSuccess: async () => {
        console.log("Donation successful!");
        setRefreshTrigger((count) => count + 1);
        setAmount("");
      },
      onError: (error) => console.error("Donation failed", error),
    });

  const { submit: submitRefund, isSubmitting: isSubmittingRefund } =
    useSubmitTransaction({
      rpcUrl: RPC_URL,
      networkPassphrase: NETWORK_PASSPHRASE,
      onSuccess: async () => {
        console.log("Refund successful!");
        setRefreshTrigger((count) => count + 1);
      },
      onError: (error) => console.error("Refund failed", error),
    });

  // Hook baru untuk submit Create Campaign
  const { submit: submitCreateCampaign, isSubmitting: isSubmittingCreate } =
    useSubmitTransaction({
      rpcUrl: RPC_URL,
      networkPassphrase: NETWORK_PASSPHRASE,
      onSuccess: (result) => {
        // Tangkap hasil (ID campaign baru)
        try {
          // Konversi resultXdr (ScVal u64) ke bigint
          const newCampaignId = scValToNative(result.resultXdr) as bigint;
          console.log(
            `Campaign created successfully! New Campaign ID: ${newCampaignId}`
          );
          alert(
            `Campaign created successfully! New Campaign ID: ${newCampaignId}`
          );
          // Reset form
          setNewGoal("");
          setNewDeadline(getDefaultDeadline());
          // Mungkin refresh data campaign list jika ada
        } catch (e) {
          console.error("Failed to parse create_campaign result", e);
          alert("Campaign created, but failed to get ID.");
        }
      },
      onError: (error) => {
        console.error("Create campaign failed", error);
        alert(
          `Create campaign error: ${error instanceof Error ? error.message : String(error)}`
        );
      },
    });
  // --- Akhir Submit Hooks ---

  // --- Fetch Callbacks ---
  const fetchTokenBalance = useCallback(async () => {
    if (!isConnected || !address || !readOnlyTokenContract) {
      setTokenBalance(BigInt(0));
      return;
    }
    setIsBalanceLoading(true);
    try {
      const balanceRes = await readOnlyTokenContract.balance({ id: address });
      setTokenBalance(balanceRes.result);
    } catch (err) {
      console.error("Failed to fetch token balance", err);
      setTokenBalance(BigInt(0));
    } finally {
      setIsBalanceLoading(false);
    }
  }, [isConnected, address, readOnlyTokenContract]);

  const fetchTokenSymbol = useCallback(async () => {
    try {
      const symbolRes = await readOnlyTokenContract.symbol();
      setTokenSymbol(symbolRes.result || "TOKEN");
    } catch (err) {
      console.error("Failed to fetch token symbol", err);
      setTokenSymbol("TOKEN");
    }
  }, [readOnlyTokenContract]);

  const fetchContractData = useCallback(async () => {
    setContractLoading(true);
    // (Fetch data campaign ID 0 - tidak berubah dari sebelumnya)
    try {
      const [
        goalRes,
        deadlineRes,
        totalRaisedRes,
        progressRes,
        isEndedRes,
        isGoalReachedRes,
      ] = await Promise.all([
        readOnlyCrowdfundContract.get_goal({ campaign_id: campaignId }),
        readOnlyCrowdfundContract.get_deadline({ campaign_id: campaignId }),
        readOnlyCrowdfundContract.get_total_raised({ campaign_id: campaignId }),
        readOnlyCrowdfundContract.get_progress_percentage({
          campaign_id: campaignId,
        }),
        readOnlyCrowdfundContract.is_ended({ campaign_id: campaignId }),
        readOnlyCrowdfundContract.is_goal_reached({ campaign_id: campaignId }),
      ]);

      setGoal(goalRes.result);
      setDeadline(deadlineRes.result);
      setTotalRaised(totalRaisedRes.result);
      setProgress(Number(progressRes.result));
      setIsEnded(Boolean(isEndedRes.result));
      setIsGoalReached(Boolean(isGoalReachedRes.result));

      if (isConnected && address) {
        const myDonationRes = await readOnlyCrowdfundContract.get_donation({
          campaign_id: campaignId,
          donor: address,
        });
        setMyDonation(myDonationRes.result);
      } else {
        setMyDonation(BigInt(0));
      }
    } catch (err) {
      console.error("Failed to fetch campaign data for ID", campaignId, err);
      setGoal(BigInt(0));
      setDeadline(BigInt(0));
      setTotalRaised(BigInt(0));
      setProgress(0);
      setIsEnded(false);
      setIsGoalReached(false);
      setMyDonation(BigInt(0));
    } finally {
      setContractLoading(false);
    }
  }, [readOnlyCrowdfundContract, isConnected, address, campaignId]);

  // --- useEffect Hooks ---
  useEffect(() => {
    fetchTokenSymbol();
  }, [fetchTokenSymbol]);

  useEffect(() => {
    fetchContractData();
    fetchTokenBalance();
  }, [
    fetchContractData,
    fetchTokenBalance,
    refreshTrigger,
    isConnected,
    address,
  ]);
  // --- Akhir useEffect Hooks ---

  // --- Handler Functions ---
  async function handleDonate() {
    // (Fungsi handleDonate - tidak berubah dari sebelumnya)
    if (
      !crowdfundContract ||
      !isConnected ||
      isSubmittingDonation ||
      !amount.trim() ||
      isEnded ||
      !address
    )
      return;
    try {
      const tokenAmount = parseFloat(amount.trim());
      if (isNaN(tokenAmount) || tokenAmount <= 0) {
        alert("Invalid amount");
        return;
      }
      const stroopsAmount = BigInt(
        Math.round(tokenAmount * Number(STROOPS_PER_TOKEN))
      );

      if (stroopsAmount <= 0) {
        alert("Amount must be positive");
        return;
      }
      console.log(
        `Attempting to donate ${stroopsAmount} stroops for campaign ${campaignId}`
      );
      const tx = await crowdfundContract.donate({
        campaign_id: campaignId,
        donor: address,
        amount: stroopsAmount,
      });
      console.log("Donate transaction prepared:", tx);
      await submitDonation(tx);
    } catch (e) {
      console.error("Failed to create donation transaction", e);
      alert(`Donation error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function handleRefund() {
    // (Fungsi handleRefund - tidak berubah dari sebelumnya)
    if (
      !crowdfundContract ||
      !isConnected ||
      isSubmittingRefund ||
      !isEnded ||
      isGoalReached ||
      myDonation <= 0 ||
      !address
    ) {
      console.log("Refund condition not met:", {
        isConnected,
        isSubmittingRefund,
        isEnded,
        isGoalReached,
        myDonation,
      });
      return;
    }
    try {
      console.log(`Attempting to refund for campaign ${campaignId}`);
      const tx = await crowdfundContract.refund({
        campaign_id: campaignId,
        donor: address,
      });
      console.log("Refund transaction prepared:", tx);
      await submitRefund(tx);
    } catch (e) {
      console.error("Failed to create refund transaction", e);
      alert(`Refund error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Handler baru untuk Create Campaign
  async function handleCreateCampaign() {
    if (
      !crowdfundContract ||
      !isConnected ||
      isSubmittingCreate ||
      !newGoal.trim() ||
      !newDeadline.trim() ||
      !address
    )
      return;

    try {
      // 1. Validasi & Konversi Goal
      const goalAmount = parseFloat(newGoal.trim());
      if (isNaN(goalAmount) || goalAmount <= 0) {
        alert("Invalid goal amount. Must be a positive number.");
        return;
      }
      const goalStroops = BigInt(
        Math.round(goalAmount * Number(STROOPS_PER_TOKEN))
      );
      if (goalStroops <= 0) {
        alert("Goal amount must be positive.");
        return;
      }

      // 2. Validasi & Konversi Deadline
      const deadlineTimestamp = datetimeLocalToUnixSecondsBigInt(
        newDeadline.trim()
      );
      if (!deadlineTimestamp) {
        alert("Invalid deadline format.");
        return;
      }
      // Cek apakah deadline di masa depan (tambahkan sedikit buffer waktu, misal 60 detik)
      const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
      if (deadlineTimestamp <= currentTimestamp + BigInt(60)) {
        alert("Deadline must be in the future.");
        return;
      }

      console.log("Preparing create_campaign transaction with:", {
        owner: address,
        goal: goalStroops,
        deadline: deadlineTimestamp,
        token: TOKEN_CONTRACT_ID,
      });

      // 3. Panggil Kontrak
      const tx = await crowdfundContract.create_campaign({
        owner: address,
        goal: goalStroops,
        deadline: deadlineTimestamp,
        token: TOKEN_CONTRACT_ID, // Gunakan ID Kontrak Token Anda
      });

      console.log("Create Campaign transaction prepared:", tx);

      // 4. Submit Transaksi
      await submitCreateCampaign(tx);
    } catch (e) {
      console.error("Failed to create campaign transaction", e);
      alert(
        `Create campaign error: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  // --- Akhir Handler Functions ---

  const campaignStatus = useMemo(() => {
    // (Tidak berubah)
    if (contractLoading) return "Loading...";
    if (isEnded) {
      return isGoalReached
        ? "Success! Goal Reached."
        : "Failed. Deadline Passed.";
    }
    return "Active";
  }, [contractLoading, isEnded, isGoalReached]);

  const canRefund =
    isConnected && isEnded && !isGoalReached && myDonation > BigInt(0);

  return (
    <div className="flex flex-col items-center gap-y-8 mb-10 px-4">
      {/* Header (Tidak berubah) */}
      <div className="flex flex-row items-center gap-x-4">
        <p className="text-3xl font-light">Stellar</p>
        <TextRotate
          texts={["Crowdfunding", "Soroban", "dApp", "Future"]}
          mainClassName="bg-primary text-primary-foreground rounded-lg text-3xl px-4 py-2 font-semibold"
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          rotationInterval={2500}
        />
      </div>

      {/* Card Status Kampanye (ID 0) (Tidak berubah) */}
      <Card className="flex flex-col gap-y-4 py-5 px-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-center mb-2">
          Campaign #{campaignId.toString()} Status
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-x-2 text-muted-foreground">
              <Target className="size-4" /> Goal:
            </span>
            <span className="font-medium tabular-nums">
              {contractLoading ? "—" : `${formatStroops(goal)} ${tokenSymbol}`}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-x-2 text-muted-foreground">
              <CalendarClock className="size-4" /> Deadline:
            </span>
            <span className="font-medium">
              {contractLoading ? "—" : formatDeadline(deadline)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-x-2 text-muted-foreground">
              <Percent className="size-4" /> Progress:
            </span>
            <span className="font-medium tabular-nums">
              {contractLoading ? "—" : `${progress}%`}
            </span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700/50 mt-2">
          <div
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-base mt-1">
          <span className="flex items-center gap-x-2 font-medium">
            <Donut className="size-4" /> Raised:
          </span>
          <span className="font-semibold text-lg tabular-nums">
            {contractLoading
              ? "—"
              : `${formatStroops(totalRaised)} ${tokenSymbol}`}
          </span>
        </div>
        <div className="text-center mt-2 text-sm font-semibold">
          Status:{" "}
          <span
            className={
              isEnded
                ? isGoalReached
                  ? "text-green-500"
                  : "text-red-500"
                : "text-blue-500"
            }
          >
            {campaignStatus}
          </span>
        </div>
      </Card>

      {/* Card Donasi (Tidak berubah) */}
      <Card className="flex flex-col gap-y-5 py-5 px-6 w-full max-w-md">
        <p className="flex flex-row items-center gap-x-2 text-lg font-medium">
          Support Campaign #{campaignId.toString()}
        </p>
        <div className="flex flex-row justify-between items-center bg-muted/50 dark:bg-muted/20 px-3 py-2 rounded-md">
          <div className="flex flex-row items-center gap-3">
            <PiggyBank className="size-6 text-primary" />
            <p className="text-sm font-medium">Your {tokenSymbol} Balance</p>
          </div>
          <p className="tabular-nums text-sm">
            {!isConnected && <span>Connect wallet</span>}
            {isConnected && isBalanceLoading && <span>Loading...</span>}
            {isConnected && !isBalanceLoading && (
              <>
                <span>{formatStroops(tokenBalance)}</span>
                <span className="ml-1 text-muted-foreground">
                  {tokenSymbol}
                </span>
              </>
            )}
          </p>
        </div>
        <Input
          type="number"
          inputMode="decimal"
          placeholder={`Amount in ${tokenSymbol} (e.g., 0.5)`}
          step="any"
          min={formatStroops(1)} // Minimal 1 stroop
          onChange={(e) => setAmount(e.target.value)}
          value={amount}
          disabled={
            isSubmittingDonation ||
            !isConnected ||
            isEnded ||
            contractLoading ||
            isBalanceLoading
          }
          aria-invalid={!amount.trim() && isSubmittingDonation}
        />
        <Button
          className="w-full"
          onClick={handleDonate}
          disabled={
            isSubmittingDonation ||
            !isConnected ||
            !amount.trim() ||
            isEnded ||
            contractLoading ||
            isBalanceLoading
          }
        >
          {isSubmittingDonation
            ? "Processing..."
            : isEnded
              ? "Campaign Ended"
              : `Donate ${tokenSymbol}`}
        </Button>
        {!isConnected && (
          <p className="text-xs text-center text-muted-foreground">
            Please connect your wallet to donate.
          </p>
        )}
        {isConnected && isEnded && !canRefund && (
          <p className="text-xs text-center text-gray-500">
            Donations are closed for this campaign.
          </p>
        )}
        {isConnected && !isEnded && (
          <p className="text-xs text-center text-muted-foreground">
            Ensure you have enough {tokenSymbol} to donate.
          </p>
        )}
      </Card>

      {/* Card Refund (Tidak berubah) */}
      {canRefund && (
        <Card className="flex flex-col gap-y-4 py-5 px-6 w-full max-w-md border-amber-500/50">
          <h3 className="text-lg font-medium text-center flex items-center justify-center gap-x-2">
            <PiggyBank className="size-5" />
            Claim Your Refund
          </h3>
          <p className="text-sm text-center text-muted-foreground">
            This campaign did not meet its goal. You can claim back your
            donation of{" "}
            <strong className="text-foreground">
              {formatStroops(myDonation)} {tokenSymbol}
            </strong>
            .
          </p>
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={handleRefund}
            disabled={isSubmittingRefund || contractLoading || isBalanceLoading}
          >
            {isSubmittingRefund ? (
              "Processing Refund..."
            ) : (
              <>
                <RotateCcw className="mr-2 size-4" /> Claim Refund
              </>
            )}
          </Button>
        </Card>
      )}

      {/* --- CARD BARU: Create Campaign --- */}
      <Card className="flex flex-col gap-y-5 py-5 px-6 w-full max-w-md">
        <p className="flex flex-row items-center gap-x-2 text-lg font-medium">
          <PlusCircle className="size-5" /> Start a New Campaign
        </p>

        <Input
          type="number"
          inputMode="decimal"
          placeholder={`Goal amount in ${tokenSymbol} (e.g., 100)`}
          step="any"
          min={formatStroops(1)} // Minimal 1 stroop
          onChange={(e) => setNewGoal(e.target.value)}
          value={newGoal}
          disabled={!isConnected || isSubmittingCreate}
        />

        <Input
          type="datetime-local"
          placeholder="Deadline"
          onChange={(e) => setNewDeadline(e.target.value)}
          value={newDeadline}
          disabled={!isConnected || isSubmittingCreate}
          // Tambahkan min attribute untuk mencegah tanggal masa lalu
          min={new Date().toISOString().slice(0, 16)}
        />
        <p className="text-xs text-muted-foreground -mt-3 ml-1">
          Set the campaign deadline.
        </p>

        <Button
          className="w-full"
          onClick={handleCreateCampaign}
          disabled={
            !isConnected ||
            isSubmittingCreate ||
            !newGoal.trim() ||
            !newDeadline.trim()
          }
        >
          {isSubmittingCreate ? "Creating Campaign..." : "Create Campaign"}
        </Button>
        {!isConnected && (
          <p className="text-xs text-center text-muted-foreground">
            Please connect your wallet to create a campaign.
          </p>
        )}
      </Card>
      {/* --- AKHIR CARD BARU --- */}
    </div>
  );
}
