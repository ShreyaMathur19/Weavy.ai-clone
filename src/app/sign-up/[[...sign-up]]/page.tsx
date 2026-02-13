import { SignUp } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
export default function Page() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SignUp />
    </div>
  );
}