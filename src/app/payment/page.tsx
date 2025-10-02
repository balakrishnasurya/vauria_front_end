// src/app/payment/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  [k: string]: any; // Razorpay may include more fields depending on integration
};

export default function PaymentPage() {
  const router = useRouter();

  // ----- Editable inputs (for testing) -----
  const [orderId, setOrderId] = useState<string>("order_ROGnjnHY1femQC");
  const [amount, setAmount] = useState<number>(9900); // paise
  const [keyId, setKeyId] = useState<string>(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RMgXwcOqIDFkDC");
  const [token, setToken] = useState<string>(""); // optional auth token if your verify endpoint requires it
  // -----------------------------------------

  // UI / debug state
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [captured, setCaptured] = useState<RazorpayHandlerResponse | null>(null);
  const [verifyResponse, setVerifyResponse] = useState<any>(null);

  // Slow-mode controls so you can "see" each step
  const [slowMode, setSlowMode] = useState<boolean>(true);
  const [stepDelayMs, setStepDelayMs] = useState<number>(1000); // 1s default

  const appendLog = (msg: string) => setLogs((s) => [...s, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const pause = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if (document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']")) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const sendVerifyRequest = async (payload: object) => {
    appendLog("Sending verification payload to server...");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8000/api/v1/payments/verify", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => null);
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = text;
      }

      setVerifyResponse({ status: res.status, ok: res.ok, body: json });
      appendLog(`Verify response: ${res.status} ${res.statusText}`);
      if (!res.ok) appendLog(`Server returned error body: ${JSON.stringify(json)}`);
      return { ok: res.ok, status: res.status, body: json };
    } catch (err: any) {
      appendLog(`Network error when posting to verify: ${err?.message || err}`);
      setVerifyResponse({ error: String(err) });
      return { ok: false, error: String(err) };
    }
  };

  const openRazorpay = async () => {
    setIsLoading(true);
    setLogs([]);
    setCaptured(null);
    setVerifyResponse(null);

    appendLog("Loading Razorpay script...");
    const scriptOk = await loadRazorpayScript();
    if (!scriptOk) {
      appendLog("Failed to load Razorpay SDK. Check your network.");
      setIsLoading(false);
      return;
    }
    appendLog("Razorpay SDK loaded.");

    // Options passed into checkout
    const options = {
      key: keyId,
      amount,
      currency: "INR",
      name: "Your Store Name",
      description: "Order Payment",
      order_id: orderId,
      prefill: { name: "Test User", email: "test@example.com", contact: "9999999999" },
      theme: { color: "#3399cc" },

      // Razorpay's handler receives the result after payment UI completes
      handler: async function (response: RazorpayHandlerResponse) {
        appendLog("Razorpay handler invoked by checkout.");
        // 1) Capture raw response immediately
        setCaptured(response);
        appendLog("Captured response from Razorpay (raw).");

        if (slowMode) {
          appendLog("Slow mode ON — showing fields one-by-one.");
          // show each key slowly so user can observe
          if (response.razorpay_payment_id) {
            appendLog(`Captured: razorpay_payment_id = ${response.razorpay_payment_id}`);
            await pause(stepDelayMs);
          }
          if (response.razorpay_order_id) {
            appendLog(`Captured: razorpay_order_id = ${response.razorpay_order_id}`);
            await pause(stepDelayMs);
          }
          if (response.razorpay_signature) {
            appendLog(`Captured: razorpay_signature = ${response.razorpay_signature}`);
            await pause(stepDelayMs);
          }
        } else {
          appendLog("Slow mode OFF — all keys captured at once.");
        }

        // 2) Build payload (only the required three fields are necessary)
        const payload = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        };
        appendLog("Prepared verification payload (only required fields).");

        if (slowMode) {
          appendLog("Waiting before sending to server (observe payload)...");
          await pause(stepDelayMs);
        }

        // 3) Send to server verify endpoint
        const verifyResult = await sendVerifyRequest(payload);

        if (verifyResult.ok) {
          appendLog("Server verified payment successfully.");
          // Optionally redirect user to success page (uncomment if you have one)
          // router.push(`/payment/success?orderId=${encodeURIComponent(verifyResult.body.order_id || orderId)}`);
        } else {
          appendLog("Server verification failed. Inspect logs and server response.");
        }
      },

      modal: {
        // invoked when user closes checkout without completing payment
        ondismiss: function () {
          appendLog("User dismissed the checkout modal.");
        },
      },
    };

    try {
      // 4) Open checkout
      appendLog("Opening Razorpay checkout UI...");
      const rzp = new window.Razorpay(options);
      rzp.open();
      appendLog("Razorpay checkout opened.");
    } catch (err: any) {
      appendLog(`Failed to open Razorpay: ${err?.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Razorpay Debug Checkout (Slow Step Mode)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium">Razorpay Order ID</label>
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full rounded border p-2" />

          <label className="block text-sm font-medium">Amount (in paise)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded border p-2"
          />
          <p className="text-xs">e.g. 9900 paise = ₹99.00</p>

          <label className="block text-sm font-medium">Razorpay Key ID (test)</label>
          <input value={keyId} onChange={(e) => setKeyId(e.target.value)} className="w-full rounded border p-2" />

          <label className="block text-sm font-medium">Auth token (optional - for verify endpoint)</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} className="w-full rounded border p-2" />

          <div className="flex items-center gap-3 mt-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={slowMode} onChange={(e) => setSlowMode(e.target.checked)} />
              <span className="text-sm">Slow Mode (show keys one-by-one)</span>
            </label>

            <label className="inline-flex items-center gap-2">
              <span className="text-sm">Step delay (ms)</span>
              <input
                type="number"
                value={stepDelayMs}
                onChange={(e) => setStepDelayMs(Number(e.target.value))}
                className="w-20 rounded border p-1"
                min={0}
              />
            </label>
          </div>

          <div>
            <button
              onClick={openRazorpay}
              disabled={isLoading}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Open Razorpay (Pay Now)"}
            </button>
          </div>

          <p className="text-xs text-gray-600">
            Note: Only the `key_id` should be public. Keep your `key_secret` on the server. After checkout, this page will
            capture the three required fields and POST them to <code>http://localhost:8000/api/v1/payments/verify</code>.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Captured Response (raw)</h3>
          <pre className="rounded border p-3 h-40 overflow-auto bg-gray-50">
            {captured ? JSON.stringify(captured, null, 2) : "No response captured yet."}
          </pre>

          <h3 className="font-medium">Prepared Payload (what will be sent)</h3>
          <pre className="rounded border p-3 h-24 overflow-auto bg-gray-50">
            {captured
              ? JSON.stringify(
                  {
                    razorpay_payment_id: captured.razorpay_payment_id,
                    razorpay_order_id: captured.razorpay_order_id,
                    razorpay_signature: captured.razorpay_signature,
                  },
                  null,
                  2
                )
              : "No payload prepared yet."}
          </pre>

          <h3 className="font-medium">Verify Endpoint Response</h3>
          <pre className="rounded border p-3 h-40 overflow-auto bg-gray-50">
            {verifyResponse ? JSON.stringify(verifyResponse, null, 2) : "No verify response yet."}
          </pre>
        </div>
      </div>

      <div>
        <h3 className="font-medium">Logs</h3>
        <div className="rounded border p-3 h-48 overflow-auto bg-white">
          {logs.length === 0 ? (
            <p className="text-sm text-gray-500">Logs will appear here as actions happen.</p>
          ) : (
            logs.map((l, i) => (
              <div key={i} className="text-sm">
                {l}
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="font-medium">Manual Actions</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (!captured) {
                appendLog("No captured response to resend. Trigger payment flow first.");
                return;
              }
              // manual re-send of the payload (if you want to step through manually)
              const payload = {
                razorpay_payment_id: captured.razorpay_payment_id,
                razorpay_order_id: captured.razorpay_order_id,
                razorpay_signature: captured.razorpay_signature,
              };
              sendVerifyRequest(payload);
            }}
            className="px-3 py-2 rounded bg-green-600 text-white"
          >
            Send captured payload to verify
          </button>

          <button
            onClick={() => {
              setLogs([]);
              setCaptured(null);
              setVerifyResponse(null);
              appendLog("Cleared state.");
            }}
            className="px-3 py-2 rounded bg-gray-300"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
