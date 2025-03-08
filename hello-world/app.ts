import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
const GIPHY_API_URL = "https://api.giphy.com/v1/gifs/search";

interface GiphyGif {
  id: string;
  url: string;
  images: {
    original: { url: string };
  };
}

interface GiphyApiResponse {
  data: GiphyGif[];
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const query = event.queryStringParameters?.query || "funny";
    const limit = event.queryStringParameters?.limit || "1";

    if (!GIPHY_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Missing GIPHY API Key" }),
      };
    }

    const response = await axios.get<GiphyApiResponse>(GIPHY_API_URL, {
      params: {
        api_key: GIPHY_API_KEY,
        q: query,
        limit: limit,
        rating: "g",
      },
    });

    // Extract only the first GIF's URL
    const gifUrl = response.data.data[0]?.images.original.url || "";

    return {
      statusCode: 200,
      body: JSON.stringify({ url: gifUrl }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error fetching GIFs", error: (error as Error).message }),
    };
  }
};
