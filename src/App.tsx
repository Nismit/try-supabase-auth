import "./App.css";
import type { FormEvent } from "react";
import { useState, useEffect, useCallback } from "react";
import { createClient, Session } from "@supabase/supabase-js";

// Recommend to define this in the different place (e.g. /src/lib)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

function App() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session === null) {
        return;
      }

      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    console.log("error", error);
  }, []);

  const handleSignUpSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const rawData = e.target as HTMLFormElement;
      if (!rawData) {
        console.error("no form data");
        return;
      }
      const form = new FormData(rawData);
      const parsedData = Object.fromEntries(form.entries());
      const { signUpEmail, signUpPassword } = parsedData;

      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail as string,
        password: signUpPassword as string,
      });

      console.log("data", data);
      console.log("error", error);

      if (error) {
        setErrorMessage(error.message);
      }

      setErrorMessage("Confirm email has been sent");
    },
    []
  );

  const handleLoginSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const rawData = e.target as HTMLFormElement;
      if (!rawData) {
        console.error("no form data");
        return;
      }
      const form = new FormData(rawData);
      const parsedData = Object.fromEntries(form.entries());
      const { loginEmail, loginPassword } = parsedData;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail as string,
        password: loginPassword as string,
      });

      console.log("data", data);
      console.log("error", error);

      if (error) {
        setErrorMessage(error.message);
      }
    },
    []
  );

  const deleteAccount = useCallback(async () => {
    if (!session?.user?.id) {
      console.error("No User Id, cannot delete");
      return;
    }

    signOut();

    const { data, error } = await supabase.functions.invoke("deleteUser", {
      body: {
        uid: session?.user?.id,
      },
    });
    console.log("data(deleteAccount):", data);
    console.log("error(deleteAccount):", error);
  }, [session, signOut]);

  if (session) {
    return (
      <>
        <div className="alignLeft">
          <p>Id: {session?.user?.id}</p>
          <p>Email: {session?.user?.email}</p>
        </div>
        <p>Logged in!</p>
        <button onClick={signOut}>Sign Out</button>
        &nbsp;
        <button onClick={deleteAccount}>Delete this user</button>
      </>
    );
  }

  if (isSignUp) {
    return (
      <>
        {errorMessage && (
          <div>
            <p>{errorMessage}</p>
          </div>
        )}
        <form onSubmit={handleSignUpSubmit}>
          <div className="formItem">
            <label htmlFor="signUpEmail">Email</label>
            <input
              id="signUpEmail"
              type="email"
              placeholder="Email Address"
              name="signUpEmail"
              required
            />
          </div>
          <div className="formItem">
            <label htmlFor="signUpPassword">Password</label>
            <input
              id="signUpPassword"
              type="passowrd"
              placeholder="Password"
              name="signUpPassword"
              required
            />
          </div>
          <button type="submit">Sign Up</button>
        </form>

        <br />
        <button onClick={() => setIsSignUp(!isSignUp)}>Login?</button>
      </>
    );
  }

  return (
    <>
      <form onSubmit={handleLoginSubmit}>
        <div className="formItem">
          <label htmlFor="loginEmail">Email</label>
          <input
            id="loginEmail"
            type="email"
            placeholder="Email Address"
            name="loginEmail"
            required
          />
        </div>
        <div className="formItem">
          <label htmlFor="loginPassword">Password</label>
          <input
            id="loginPassword"
            type="passowrd"
            placeholder="Password"
            name="loginPassword"
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      <br />
      <button onClick={() => setIsSignUp(!isSignUp)}>Sign Up?</button>
    </>
  );
}

export default App;
