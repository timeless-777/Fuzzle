import { NextRequest, NextResponse } from "next/server";
import { FeedType, FilterType, NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

export async function GET(request: NextRequest) {

  const options = {
    filterType: FilterType.EmbedUrl,
    embedUrl: "https://paragraph.xyz/@",
    limit: 100,
    withRecasts: false,
  };
  try {
    const casts = await client.fetchFeed("filter", options);
    return NextResponse.json(casts);
  } catch (err) {
    if (isApiErrorResponse(err)) {
      return NextResponse.json(
        { ...err.response.data },
        { status: err.response.status }
      );
    } else
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 500 }
      );
  }
}
