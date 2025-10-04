import { NextResponse } from "next/server";

let cachedData = null;
let lastFetchTime = 0;

export async function GET() {
  const now = Date.now();

  // Serve from cache if within 5 minutes
  if (cachedData && now - lastFetchTime < 30 * 60 * 1000) {
    console.log("Serving news from cache");
    return NextResponse.json(cachedData);
  }

  try {
    const url = `https://gnews.io/api/v4/search?q=finance&lang=en&max=10&apikey=${process.env.GNEWS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    // Only cache if articles exist
    if (data?.articles) {
      cachedData = data;
      lastFetchTime = now;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
