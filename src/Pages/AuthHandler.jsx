import { useEffect, useState } from "react";
import { applyActionCode, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import bg from "../assets/bg.jpeg"

const AuthHandler = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProcessed, setIsProcessed] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  // ✅ Firebase se role fetch karo
  const getUserRoleFromFirebase = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role || "user";
      }
    } catch (error) {
      console.error("Role check error:", error);
    }
    return localStorage.getItem('userRole') || "user";
  };

  const redirectToLogin = async () => {
    const userRole = await getUserRoleFromFirebase();
    console.log("🔐 Redirecting with role:", userRole);
    
    if (userRole === "doctor") {
      window.location.href = "/doclogin";
    } else {
      window.location.href = "/userlogin";
    }
  };

  useEffect(() => {
    if (isProcessed) return;

    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const oobCode = params.get("oobCode");

    console.log("🔍 Mode:", mode);
    console.log("🔍 OobCode:", oobCode);

    // ✅ Agar mode ya oobCode nahi hai to seedha redirect karo, kuch message mat dikha
    if (!mode || !oobCode) {
      console.log("⚠️ Invalid params - redirecting silently");
      setIsProcessed(true);
      
      setTimeout(() => {
        redirectToLogin();
      }, 300);
      
      return;
    }

    // ✅ Valid params hain to content dikha
    setShowContent(true);

    if (mode === "verifyEmail") {
      console.log("📧 Verifying email with code:", oobCode);
      applyActionCode(auth, oobCode)
        .then(() => {
          console.log("✅ Email verified successfully!");
          setMessage("Email Verified Successfully!");
          setLoading(false);
          setIsProcessed(true);
          setVerificationStatus("success");

          setTimeout(() => {
            redirectToLogin();
          }, 3000);
        })
        .catch((error) => {
          console.error("❌ Verification error:", error.code, error.message);

          if (error.code === "auth/invalid-action-code") {
            setMessage("Email Already Verified!");
            setVerificationStatus("success");
          } else {
            setMessage("Verification Failed");
            setVerificationStatus("error");
          }

          setLoading(false);
          setIsProcessed(true);

          setTimeout(() => {
            redirectToLogin();
          }, 3000);
        });

    } else if (mode === "resetPassword") {
      console.log("🔐 Verifying reset code:", oobCode);
      verifyPasswordResetCode(auth, oobCode)
        .then(() => {
          console.log("✅ Reset code valid, redirecting to reset page...");
          setIsProcessed(true);
          navigate(`/reset?oobCode=${oobCode}`, { replace: true });
        })
        .catch((error) => {
          console.error("❌ Reset code error:", error.code, error.message);
          setMessage("Reset Link Expired or Invalid");
          setLoading(false);
          setIsProcessed(true);
          setVerificationStatus("error");

          setTimeout(() => {
            navigate("/forgot-password", { replace: true });
          }, 3000);
        });

    } else {
      setMessage("Invalid Request");
      setLoading(false);
      setIsProcessed(true);
      setVerificationStatus("error");
      setShowContent(true);
    }

  }, [navigate, isProcessed]);

  return (
    <div
      className="min-h-screen bg-cover bg-fixed bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="bg-white/30 backdrop-blur-[2px] min-h-screen flex items-center justify-center p-5">
        {/* ✅ Sirf tab content dikha jab valid params ho */}
        {showContent && (
          <div className="relative max-w-550px ">
            {/* Animated Background */}
            <div
              style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "300px",
                height: "300px",
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "50%",
                animation: "float 6s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-100px",
                left: "-50px",
                width: "200px",
                height: "200px",
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "50%",
                animation: "float 8s ease-in-out infinite",
                animationDelay: "2s",
              }}
            />

            {/* Card */}
            <div
              style={{
                position: "relative",
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "20px",
                padding: "60px 40px 40px",
                boxShadow: "0 20px 60px rgba(47, 53, 125, 0.3)",
                textAlign: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Icon Container */}
              <div
                style={{
                  position: "absolute",
                  top: "-40px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "80px",
                  height: "80px",
                  background: verificationStatus === "success" 
                    ? "linear-gradient(135deg, #5390F5 0%, #6D5DF1 100%)"
                    : "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "40px",
                  boxShadow: "0 10px 30px rgba(47, 53, 125, 0.3)",
                  animation: verificationStatus === "success" ? "scaleIn 0.6s ease-out" : "shake 0.5s ease-in-out",
                }}
              >
                {loading ? "⏳" : verificationStatus === "success" ? "✓" : "✕"}
              </div>

              {/* Message */}
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2F357D",
                  margin: "30px 0 15px",
                  letterSpacing: "-0.5px",
                }}
              >
                {loading ? "Verifying..." : message}
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: "16px",
                  color: "#666",
                  margin: "0 0 30px",
                  lineHeight: "1.6",
                }}
              >
                {loading 
                  ? "Please wait while we verify your email"
                  : verificationStatus === "success"
                  ? "Your email has been verified successfully!"
                  : "There was an issue verifying your email"}
              </p>

              {/* Loading Animation */}
              {loading && (
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      border: "4px solid #f0f0f0",
                      borderTop: "4px solid #5390F5",
                      borderRadius: "50%",
                      margin: "0 auto",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                </div>
              )}

              {/* Success/Error Indicator */}
              {!loading && verificationStatus === "success" && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px 20px",
                    background: "#f0fdf4",
                    border: "2px solid #5390F5",
                    borderRadius: "12px",
                    color: "#2F357D",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  ✓ Redirecting to login...
                </div>
              )}

              {!loading && verificationStatus === "error" && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px 20px",
                    background: "#fef2f2",
                    border: "2px solid #ef4444",
                    borderRadius: "12px",
                    color: "#dc2626",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  ✕ Redirecting...
                </div>
              )}

              {/* Redirect Button (Manual) */}
              {!loading && (
                <button
                  onClick={redirectToLogin}
                  style={{
                    marginTop: "30px",
                    padding: "12px 40px",
                    background: "linear-gradient(135deg, #5390F5 0%, #6D5DF1 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 5px 20px rgba(83, 144, 245, 0.4)",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 25px rgba(83, 144, 245, 0.6)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 5px 20px rgba(83, 144, 245, 0.4)";
                  }}
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @media (max-width: 600px) {
          div {
            padding: 40px 30px 30px !important;
          }
          h1 {
            font-size: 24px !important;
          }
          p {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthHandler;