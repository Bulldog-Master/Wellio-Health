import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReceiptRequest {
  transaction_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { transaction_id }: ReceiptRequest = await req.json();

    if (!transaction_id) {
      throw new Error("Transaction ID required");
    }

    // Fetch transaction with payment method
    const { data: transaction, error: txError } = await supabaseAdmin
      .from("payment_transactions")
      .select(`
        *,
        payment_methods (name, method_key)
      `)
      .eq("id", transaction_id)
      .eq("user_id", user.id)
      .single();

    if (txError || !transaction) {
      throw new Error("Transaction not found");
    }

    // Fetch user profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, username")
      .eq("id", user.id)
      .single();

    // Generate receipt data
    const receiptNumber = `WEL-${transaction.id.substring(0, 8).toUpperCase()}`;
    const receiptDate = new Date(transaction.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const receipt = {
      receipt_number: receiptNumber,
      date: receiptDate,
      customer: {
        name: profile?.full_name || profile?.username || user.email,
        email: user.email,
      },
      transaction: {
        id: transaction.id,
        type: transaction.transaction_type,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency || "USD",
        payment_method: transaction.payment_methods?.name || "Unknown",
        completed_at: transaction.completed_at,
      },
      company: {
        name: "Wellio Fitness",
        address: "Digital Platform",
        email: "support@wellio.app",
      },
      items: getItemsFromTransaction(transaction),
    };

    console.log("Receipt generated:", receiptNumber);

    return new Response(JSON.stringify({ receipt }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error generating receipt:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

function getItemsFromTransaction(transaction: any) {
  const items = [];
  const metadata = transaction.metadata || {};

  // Parse transaction type to create line items
  switch (transaction.transaction_type) {
    case "subscription":
      items.push({
        description: `${metadata.tier || "Premium"} Subscription`,
        quantity: 1,
        unit_price: transaction.amount,
        total: transaction.amount,
      });
      break;
    case "addon":
      items.push({
        description: metadata.addon_name || "Premium Add-on",
        quantity: 1,
        unit_price: transaction.amount,
        total: transaction.amount,
      });
      break;
    case "product":
      items.push({
        description: metadata.product_name || "Product Purchase",
        quantity: metadata.quantity || 1,
        unit_price: transaction.amount / (metadata.quantity || 1),
        total: transaction.amount,
      });
      break;
    default:
      items.push({
        description: "Payment",
        quantity: 1,
        unit_price: transaction.amount,
        total: transaction.amount,
      });
  }

  return items;
}
