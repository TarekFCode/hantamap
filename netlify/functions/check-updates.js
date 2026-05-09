import { readOutbreakData } from "../shared/outbreak-store.js";

export default async () => {
  try {
    const data = await readOutbreakData();

    return Response.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to read outbreak data:", error);

    return Response.json(
      {
        error: "Failed to read outbreak data",
      },
      {
        status: 500,
      },
    );
  }
};
