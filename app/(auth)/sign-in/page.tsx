"use client";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.replace("/");
    }
  }, [session, router]);

  const signInWithGoogle = async () => {
    try {
      await authClient.signIn.social({ provider: "google" });
    } catch (err) {
      // surface errors for easier debugging in production
      // eslint-disable-next-line no-console
      console.error("Sign in failed:", err);
      // lightweight user feedback
      // eslint-disable-next-line no-alert
      alert("Sign in failed. Check the console or verify your auth configuration.");
    }
  };

  return (
    <main className="sign-in">
      <section className="testimonial">
        <div className="logo-container">
          <Image src="/assets/icons/logo.svg" alt="SnapCast" width={40} height={40} />
        </div>

        <div className="description">
          <section>
            <figure>
              <div className="avatar">
                <Image
                  src={session?.user?.image ?? "/assets/images/jason.png"}
                  alt={session?.user?.name ?? "Jason Rivera"}
                  width={72}
                  height={72}
                />
              </div>

              <div className="stars">★★★★★</div>
            </figure>

            <p>
              SnapCast makes screen recording easy. From quick walkthroughs to full
              presentations, it's fast, smooth, and shareable in seconds
            </p>

            <article>
              <div>
                <h2>Jason Rivera</h2>
                <p>Product Designer, NovaByte</p>
              </div>
            </article>
          </section>
        </div>
      </section>

      <section className="google-sign-in">
        <section>
          <a href="#">
            <Image src="/assets/icons/logo.svg" alt="SnapCast" width={28} height={28} />
            <h1>SnapCast</h1>
          </a>

          <p>
            Create and share your very first <span>SnapCast video</span> in no time!
          </p>

          <button onClick={signInWithGoogle}>
            <Image src="/assets/icons/google.svg" alt="Google" width={20} height={20} />
            Sign in with Google
          </button>
        </section>
      </section>
    </main>
  );
};

export default SignInPage;
