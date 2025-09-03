import { getToken } from "next-auth/jwt";

export async function GET(req) {
  return new Response(JSON.stringify({ message: "Test" }), { status: 200 });
}

export async function POST(req) {
  return new Response(JSON.stringify({ message: "Test" }), { status: 200 });
}