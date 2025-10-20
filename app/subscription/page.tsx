"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserSubscription } from "@/lib/subscriptionHelper";

interface Plan {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  color: string;
  gradient: string;
  recommended?: boolean;
}

interface Plans {
  free: Plan;
  premium: Plan;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      checkSubscriptionStatus(userData.email);
    } else {
      setLoadingStatus(false);
    }
  }, []);

  const checkSubscriptionStatus = async (email: string) => {
    try {
      const subscription = await getUserSubscription(email);
      setIsPremium(subscription.isPremium || false);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setIsPremium(false);
    } finally {
      setLoadingStatus(false);
    }
  };

  const plans: Plans = {
    free: {
      name: "Free",
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        "Access to 5 free audiobooks",
        "AI voice narration",
        "Standard audio quality",
        "Basic audio player",
        "Stream online",
      ],
      color: "#86efac",
      gradient: "linear-gradient(135deg, #86efac 0%, #10b981 100%)",
    },
    premium: {
      name: "Premium",
      priceMonthly: 14.99,
      priceYearly: 149.99,
      features: [
        "✨ UNLIMITED audiobooks access",
        "Access to ALL content in library",
        "Multiple AI voice options",
        "HD audio quality (320kbps)",
        "Ad-free listening experience",
        "Priority customer support",
        "Early access to new releases",
        "Support platform development",
        "Cancel anytime - no commitment",
      ],
      color: "#ffd89b",
      gradient: "linear-gradient(135deg, #ffd89b 0%, #f59e0b 100%)",
      recommended: true,
    },
  };

  const handleSubscribe = async (planType: string) => {
    if (!user) {
      alert("Please login first to subscribe!");
      router.push("/login");
      return;
    }

    if (planType === "free") {
      alert("You're already on the free plan!");
      return;
    }

    try {
      const priceId =
        billingCycle === "monthly"
          ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || ""
          : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || "";

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: priceId,
          userId: user.id || user.email,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      alert("Please login first!");
      router.push("/login");
      return;
    }

    try {
      setLoadingPortal(true);

      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert("No active subscription found. Subscribe to Premium first!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to open subscription management");
    } finally {
      setLoadingPortal(false);
    }
  };

  const savingsYearly = () => {
    const monthlyTotal = plans.premium.priceMonthly * 12;
    const yearlySavings = monthlyTotal - plans.premium.priceYearly;
    return yearlySavings.toFixed(2);
  };

  if (loadingStatus) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "white", fontSize: "1.2rem" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
        padding: "clamp(30px, 6vw, 60px) 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "clamp(40px, 8vw, 60px)",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.5rem, 8vw, 4rem)",
              fontWeight: "900",
              background:
                "linear-gradient(135deg, #ffffff 0%, #ffd89b 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "clamp(15px, 3vw, 20px)",
              lineHeight: "1.2",
            }}
          >
            {isPremium ? "Your Subscription" : "Choose Your Plan"}
          </h1>
          <p
            style={{
              fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
              color: "#d0d0d0",
              marginBottom: "clamp(30px, 5vw, 40px)",
              padding: "0 20px",
            }}
          >
            {isPremium
              ? "Manage your premium subscription"
              : "Unlock unlimited Islamic audiobooks and spiritual wisdom"}
          </p>

          {/* Billing Toggle - Only show if NOT premium */}
          {!isPremium && (
            <div
              style={{
                display: "inline-flex",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "15px",
                padding: "clamp(6px, 1.5vw, 8px)",
                gap: "clamp(6px, 1.5vw, 8px)",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => setBillingCycle("monthly")}
                style={{
                  padding: "clamp(10px, 2vw, 12px) clamp(20px, 4vw, 30px)",
                  background:
                    billingCycle === "monthly"
                      ? "rgba(255, 216, 155, 0.2)"
                      : "transparent",
                  border:
                    billingCycle === "monthly"
                      ? "1px solid rgba(255, 216, 155, 0.4)"
                      : "none",
                  borderRadius: "10px",
                  color: billingCycle === "monthly" ? "#ffd89b" : "#999",
                  cursor: "pointer",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  fontWeight: "600",
                  transition: "all 0.3s",
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                style={{
                  padding: "clamp(10px, 2vw, 12px) clamp(20px, 4vw, 30px)",
                  background:
                    billingCycle === "yearly"
                      ? "rgba(255, 216, 155, 0.2)"
                      : "transparent",
                  border:
                    billingCycle === "yearly"
                      ? "1px solid rgba(255, 216, 155, 0.4)"
                      : "none",
                  borderRadius: "10px",
                  color: billingCycle === "yearly" ? "#ffd89b" : "#999",
                  cursor: "pointer",
                  fontSize: "clamp(0.9rem, 2vw, 1rem)",
                  fontWeight: "600",
                  transition: "all 0.3s",
                  position: "relative",
                }}
              >
                Yearly
                <span
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    background: "#f5576c",
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: "10px",
                    fontSize: "clamp(0.6rem, 1.5vw, 0.65rem)",
                    fontWeight: "700",
                  }}
                >
                  SAVE ${savingsYearly()}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Pricing Cards - Only show if NOT premium */}
        {!isPremium && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
              gap: "clamp(25px, 5vw, 40px)",
              marginBottom: "clamp(40px, 8vw, 60px)",
              maxWidth: "900px",
              margin: "0 auto clamp(40px, 8vw, 60px)",
            }}
          >
            {(Object.entries(plans) as [keyof Plans, Plan][]).map(
              ([key, plan]) => {
                const price =
                  billingCycle === "monthly"
                    ? plan.priceMonthly
                    : plan.priceYearly;
                const isCurrentPlan = key === "free";

                return (
                  <div
                    key={key}
                    style={{
                      background: plan.recommended
                        ? "rgba(255, 216, 155, 0.08)"
                        : "rgba(255, 255, 255, 0.05)",
                      border: plan.recommended
                        ? "2px solid rgba(255, 216, 155, 0.5)"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "20px",
                      padding: "clamp(30px, 6vw, 40px)",
                      position: "relative",
                      transition: "all 0.3s",
                      transform: plan.recommended ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    {plan.recommended && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-15px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: plan.gradient,
                          color: "white",
                          padding: "8px 24px",
                          borderRadius: "20px",
                          fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)",
                          fontWeight: "800",
                          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ⭐ RECOMMENDED
                      </div>
                    )}

                    <h3
                      style={{
                        fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                        fontWeight: "800",
                        color: plan.color,
                        marginBottom: "15px",
                        marginTop: plan.recommended ? "15px" : "0",
                      }}
                    >
                      {plan.name}
                    </h3>

                    <div style={{ marginBottom: "30px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "clamp(3rem, 10vw, 4rem)",
                            fontWeight: "900",
                            color: "white",
                          }}
                        >
                          ${price}
                        </span>
                        <span
                          style={{
                            fontSize: "clamp(1.1rem, 3vw, 1.3rem)",
                            color: "#999",
                          }}
                        >
                          /{billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      </div>

                      {billingCycle === "yearly" && key === "premium" && (
                        <div
                          style={{
                            color: "#86efac",
                            fontSize: "clamp(0.9rem, 2vw, 1rem)",
                            marginTop: "10px",
                            fontWeight: "700",
                          }}
                        >
                          💰 Save ${savingsYearly()} per year!
                        </div>
                      )}
                    </div>

                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        marginBottom: "clamp(25px, 5vw, 35px)",
                      }}
                    >
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          style={{
                            color: "#d0d0d0",
                            fontSize: "clamp(0.95rem, 2.2vw, 1.05rem)",
                            marginBottom: "clamp(12px, 2.5vw, 15px)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                            lineHeight: "1.5",
                          }}
                        >
                          <span
                            style={{
                              color: plan.color,
                              fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                              flexShrink: 0,
                            }}
                          >
                            ✓
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(key)}
                      disabled={isCurrentPlan}
                      style={{
                        width: "100%",
                        padding: "clamp(14px, 3vw, 18px)",
                        background: isCurrentPlan
                          ? "rgba(100, 100, 100, 0.3)"
                          : plan.gradient,
                        border: "none",
                        borderRadius: "12px",
                        color: "white",
                        fontSize: "clamp(1.05rem, 2.5vw, 1.2rem)",
                        fontWeight: "700",
                        cursor: isCurrentPlan ? "not-allowed" : "pointer",
                        transition: "all 0.3s",
                        boxShadow: isCurrentPlan
                          ? "none"
                          : "0 6px 20px rgba(0, 0, 0, 0.4)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrentPlan) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 25px rgba(0, 0, 0, 0.5)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrentPlan) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(0, 0, 0, 0.4)";
                        }
                      }}
                    >
                      {isCurrentPlan ? "✓ Current Plan" : `Get ${plan.name}`}
                    </button>
                  </div>
                );
              }
            )}
          </div>
        )}

        {/* FAQ Section */}
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto clamp(40px, 8vw, 60px)",
            padding: "clamp(30px, 6vw, 40px)",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h2
            style={{
              color: "#ffd89b",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: "800",
              marginBottom: "clamp(20px, 4vw, 30px)",
              textAlign: "center",
            }}
          >
            Frequently Asked Questions
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div>
              <h3
                style={{
                  color: "#93c5fd",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.2rem)",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                Can I cancel anytime?
              </h3>
              <p
                style={{
                  color: "#d0d0d0",
                  fontSize: "clamp(0.95rem, 2vw, 1rem)",
                  lineHeight: "1.6",
                }}
              >
                Yes! Cancel your subscription anytime with no penalties or fees.
                You'll keep access until the end of your billing period.
              </p>
            </div>

            <div>
              <h3
                style={{
                  color: "#93c5fd",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.2rem)",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                Which audiobooks are free?
              </h3>
              <p
                style={{
                  color: "#d0d0d0",
                  fontSize: "clamp(0.95rem, 2vw, 1rem)",
                  lineHeight: "1.6",
                }}
              >
                We have 5 carefully selected audiobooks available for free
                users. Premium unlocks our entire library of Islamic spiritual
                works.
              </p>
            </div>

            <div>
              <h3
                style={{
                  color: "#93c5fd",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.2rem)",
                  fontWeight: "700",
                  marginBottom: "8px",
                }}
              >
                Is payment secure?
              </h3>
              <p
                style={{
                  color: "#d0d0d0",
                  fontSize: "clamp(0.95rem, 2vw, 1rem)",
                  lineHeight: "1.6",
                }}
              >
                Absolutely! We use Stripe, the industry-leading payment
                processor. We never store your credit card information on our
                servers.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div
          style={{
            textAlign: "center",
            padding: "clamp(35px, 7vw, 50px) clamp(20px, 4vw, 30px)",
            background: isPremium
              ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
              : "linear-gradient(135deg, #19547b 0%, #ffd89b 100%)",
            borderRadius: "20px",
          }}
        >
          {isPremium ? (
            <>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>⭐</div>
              <h2
                style={{
                  color: "white",
                  fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                  fontWeight: "900",
                  marginBottom: "clamp(15px, 3vw, 20px)",
                  lineHeight: "1.3",
                }}
              >
                You're a Premium Member!
              </h2>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                  marginBottom: "clamp(25px, 5vw, 30px)",
                  padding: "0 10px",
                }}
              >
                Enjoy unlimited access to all audiobooks
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  alignItems: "center",
                }}
              >
                <Link
                  href="/audiobooks"
                  style={{
                    display: "inline-block",
                    background: "white",
                    color: "#10b981",
                    padding: "clamp(14px, 3vw, 18px) clamp(35px, 7vw, 50px)",
                    borderRadius: "12px",
                    fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                    fontWeight: "700",
                    textDecoration: "none",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                    transition: "all 0.3s",
                  }}
                >
                  📚 Browse All Audiobooks
                </Link>

                <button
                  onClick={handleManageSubscription}
                  disabled={loadingPortal}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    padding: "clamp(12px, 2.5vw, 14px) clamp(30px, 6vw, 40px)",
                    borderRadius: "12px",
                    fontSize: "clamp(0.9rem, 2.2vw, 1rem)",
                    fontWeight: "600",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    cursor: loadingPortal ? "not-allowed" : "pointer",
                    transition: "all 0.3s",
                    opacity: loadingPortal ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingPortal) {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingPortal) {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.2)";
                    }
                  }}
                >
                  {loadingPortal ? "Loading..." : "⚙️ Manage Subscription"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2
                style={{
                  color: "white",
                  fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                  fontWeight: "900",
                  marginBottom: "clamp(15px, 3vw, 20px)",
                  lineHeight: "1.3",
                }}
              >
                Start Your Spiritual Journey Today
              </h2>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                  marginBottom: "clamp(25px, 5vw, 30px)",
                  padding: "0 10px",
                }}
              >
                Join thousands of Muslims enriching their faith through
                audiobooks
              </p>

              <Link
                href="/audiobooks"
                style={{
                  display: "inline-block",
                  background: "white",
                  color: "#19547b",
                  padding: "clamp(14px, 3vw, 18px) clamp(35px, 7vw, 50px)",
                  borderRadius: "12px",
                  fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                  fontWeight: "700",
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.3s",
                }}
              >
                Browse Free Audiobooks →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
