import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#0f172a", // dark background
      }}
    >
      <h1 style={{ color: "white", marginBottom: "20px" }}>
        Welcome Back 👋
      </h1>

      <SignIn
        appearance={{
          elements: {
            card: {
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            },
          },
        }}
      />
    </div>
  );
}