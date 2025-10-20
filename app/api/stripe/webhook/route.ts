import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  console.log("📥 Webhook received:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Checkout completed:", session.id);

        // Get customer details
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const userEmail = session.customer_email;
        const userId = session.metadata?.userId || session.client_reference_id;

        console.log("Updating user:", {
          userId,
          userEmail,
          customerId,
          subscriptionId,
        });

        // Update user's subscription in database
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            subscription_tier: "premium",
            subscription_status: "active",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
          })
          .eq("email", userEmail);

        if (updateError) {
          console.error("❌ Error updating profile:", updateError);
        } else {
          console.log("✅ Profile updated successfully!");
        }

        // Log to subscription history
        await supabase.from("subscription_history").insert({
          profile_id: userId,
          old_tier: "free",
          new_tier: "premium",
          change_reason: "Payment successful",
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("🔄 Subscription updated:", subscription.id);

        const customerId = subscription.customer as string;
        const status = subscription.status;

        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = "email" in customer ? customer.email : undefined;

        if (customerEmail) {
          const { error } = await supabase
            .from("profiles")
            .update({
              subscription_status: status,
            })
            .eq("stripe_customer_id", customerId);

          if (error) {
            console.error("❌ Error updating subscription status:", error);
          } else {
            console.log("✅ Subscription status updated:", status);
          }
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("❌ Subscription cancelled:", subscription.id);

        const customerId = subscription.customer as string;
        const periodEnd = (subscription as any).current_period_end;

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
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("❌ Error cancelling subscription:", error);
        } else {
          console.log("✅ User downgraded to free");
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("💰 Payment succeeded:", invoice.id);

        const customerId = invoice.customer as string;
        const subscriptionId = (invoice as any).subscription;

        if (subscriptionId && typeof subscriptionId === "string") {
          try {
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
                })
                .eq("stripe_customer_id", customerId);

              console.log("✅ Subscription period extended");
            }
          } catch (error) {
            console.error("❌ Error extending subscription:", error);
          }
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("⚠️ Payment failed:", invoice.id);

        const customerId = invoice.customer as string;

        // Mark subscription as past_due
        await supabase
          .from("profiles")
          .update({
            subscription_status: "past_due",
          })
          .eq("stripe_customer_id", customerId);

        console.log("⚠️ User marked as past_due");

        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Webhook handler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
