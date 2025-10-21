import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function for logging (only in development)
const devLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(message, data || "");
  }
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  devLog("📥 Webhook received:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        devLog("✅ Checkout completed:", session.id);

        // Get customer details
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const userEmail = session.customer_email;

        if (!userEmail) {
          console.error("❌ No email in checkout session");
          return NextResponse.json(
            { error: "No email found" },
            { status: 400 }
          );
        }

        // 🔒 SECURITY FIX: Verify user exists before updating
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, email, subscription_tier")
          .eq("email", userEmail)
          .single();

        if (profileError || !profile) {
          console.error("❌ Profile not found for email:", userEmail);
          return NextResponse.json(
            { error: "Profile not found" },
            { status: 404 }
          );
        }

        devLog("Found profile for user:", profile.id);

        // 🔒 SECURITY FIX: Update using profile ID + email verification
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            subscription_tier: "premium",
            subscription_status: "active",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq("id", profile.id)
          .eq("email", userEmail); // Double verification

        if (updateError) {
          console.error("❌ Error updating profile:", updateError);
          return NextResponse.json({ error: "Update failed" }, { status: 500 });
        }

        devLog("✅ Profile updated successfully");

        // Log to subscription history
        await supabase.from("subscription_history").insert({
          profile_id: profile.id,
          old_tier: profile.subscription_tier || "free",
          new_tier: "premium",
          change_reason: "Payment successful",
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        devLog("🔄 Subscription updated:", subscription.id);

        const customerId = subscription.customer as string;
        const status = subscription.status;

        // 🔒 SECURITY FIX: Verify customer exists before updating
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!profile) {
          console.error("❌ Profile not found for customer:", customerId);
          return NextResponse.json(
            { error: "Profile not found" },
            { status: 404 }
          );
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: status,
          })
          .eq("id", profile.id)
          .eq("stripe_customer_id", customerId); // Double verification

        if (error) {
          console.error("❌ Error updating subscription status:", error);
        } else {
          devLog("✅ Subscription status updated:", status);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        devLog("❌ Subscription cancelled:", subscription.id);

        const customerId = subscription.customer as string;

        // ✅ FIX: Use type assertion to access current_period_end
        const periodEnd = (subscription as any).current_period_end;

        // 🔒 SECURITY FIX: Verify customer exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!profile) {
          console.error("❌ Profile not found for customer:", customerId);
          return NextResponse.json(
            { error: "Profile not found" },
            { status: 404 }
          );
        }

        // Downgrade to free
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_tier: "free",
            subscription_status: "cancelled",
            subscription_expires_at: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
          })
          .eq("id", profile.id)
          .eq("stripe_customer_id", customerId); // Double verification

        if (error) {
          console.error("❌ Error cancelling subscription:", error);
        } else {
          devLog("✅ User downgraded to free");

          // Log to subscription history
          await supabase.from("subscription_history").insert({
            profile_id: profile.id,
            old_tier: "premium",
            new_tier: "free",
            change_reason: "Subscription cancelled",
          });
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        devLog("💰 Payment succeeded:", invoice.id);

        const customerId = invoice.customer as string;

        // ✅ FIX: Cast to any to avoid TypeScript complexity
        const subscriptionId = (invoice as any).subscription;

        if (subscriptionId && typeof subscriptionId === "string") {
          try {
            // 🔒 SECURITY FIX: Verify customer exists
            const { data: profile } = await supabase
              .from("profiles")
              .select("id")
              .eq("stripe_customer_id", customerId)
              .single();

            if (!profile) {
              console.error("❌ Profile not found for customer:", customerId);
              return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
              );
            }

            const subscription = await stripe.subscriptions.retrieve(
              subscriptionId
            );

            const periodEnd = (subscription as any).current_period_end;

            if (periodEnd) {
              await supabase
                .from("profiles")
                .update({
                  subscription_expires_at: new Date(
                    periodEnd * 1000
                  ).toISOString(),
                  subscription_status: "active",
                })
                .eq("id", profile.id)
                .eq("stripe_customer_id", customerId);

              devLog("✅ Subscription period extended");
            }
          } catch (error) {
            console.error("❌ Error extending subscription:", error);
          }
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        devLog("⚠️ Payment failed:", invoice.id);

        const customerId = invoice.customer as string;

        // 🔒 SECURITY FIX: Verify customer exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!profile) {
          console.error("❌ Profile not found for customer:", customerId);
          return NextResponse.json(
            { error: "Profile not found" },
            { status: 404 }
          );
        }

        // Mark subscription as past_due
        await supabase
          .from("profiles")
          .update({
            subscription_status: "past_due",
          })
          .eq("id", profile.id)
          .eq("stripe_customer_id", customerId); // Double verification

        devLog("⚠️ User marked as past_due");

        break;
      }

      default:
        devLog(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Webhook handler error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
