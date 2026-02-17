// src/lib/transloadit.ts

export async function createAssembly(steps: any) {
  const res = await fetch("https://api2.transloadit.com/assemblies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      params: JSON.stringify({
        auth: {
          key: process.env.TRANSLOADIT_KEY,
        },
        steps,
      }),
    }),
  });

  const assembly = await res.json();

  if (!res.ok) {
    throw new Error("Transloadit failed: " + JSON.stringify(assembly));
  }

  const assemblyUrl = assembly.assembly_ssl_url;

  // 🔥 POLL UNTIL COMPLETED
  let completed = false;
  let finalAssembly = assembly;

  while (!completed) {
    await new Promise((r) => setTimeout(r, 1500));

    const pollRes = await fetch(assemblyUrl);
    finalAssembly = await pollRes.json();

    if (finalAssembly.ok === "ASSEMBLY_COMPLETED") {
      completed = true;
    }

    if (finalAssembly.error) {
      throw new Error(
        "Transloadit processing error: " +
          JSON.stringify(finalAssembly)
      );
    }
  }

  return finalAssembly;
}