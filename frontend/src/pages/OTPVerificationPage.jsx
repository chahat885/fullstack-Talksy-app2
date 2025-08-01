import { useState, useEffect } from "react";
// Assuming this is the path to your store, adjust if needed
import { useAuthStore } from "../store/useAuthStore";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { useNavigate, useLocation,Link } from "react-router-dom";
// Assuming this is the path to your component, adjust if needed
import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState("");
  // Destructure the necessary functions and state from your auth store
  const { verifyOtp, isVerifyingOtp, authUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  // Effect to handle navigation
  useEffect(() => {
    // If user is already authenticated or no email is passed in state, redirect to home
    if (authUser || !email) {
      navigate("/");
      // It's good practice to show an error toast here
      //toast.error("Invalid access. Please sign up again.");
    }
  }, [authUser, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      return toast.error("OTP is required");
    }
    if (otp.length !== 6) {
      return toast.error("OTP must be 6 digits");
    }

    const result = await verifyOtp(email, otp);
    if (result.success) {
      navigate("/"); // Redirect to home page on successful verification
    } else {
      // Logic for incorrect OTP verification as requested
      
      setTimeout(() => {
        navigate("/signup");
      }, 3000);
    }
  };

  // A placeholder function for resending OTP.
  // The backend endpoint for this feature is not yet created.
  const handleResendOtp = () => {
    toast.success("A new OTP has been sent to your email.");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <Mail className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Verify Your Email</h1>
              <p className="text-base-content/60">
                Enter the 6-digit code sent to
                <br />
                <span className="font-semibold text-base-content/80">{email}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Verification Code</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CheckCircle2 className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 tracking-[1em] text-center font-mono`}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isVerifyingOtp}>
              {isVerifyingOtp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>

            <div className="text-center">
              <p className="text-base-content/60">
                Didn't receive the code?{" "}
                 <Link to="/signup" className="link link-primary ">
                  SignUp 
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* right side */}

      <AuthImagePattern
        title="Secure your account"
        subtitle="Verify your email to get full access to all features."
      />
    </div>
  );
};
export default OTPVerificationPage;
