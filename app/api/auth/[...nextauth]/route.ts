// NextAuth endpoint — configure your provider in Phase 2
// import NextAuth from "next-auth";
// export const { GET, POST } = NextAuth(authOptions);

export async function GET() {
  return new Response("NextAuth not yet configured", { status: 501 });
}
export async function POST() {
  return new Response("NextAuth not yet configured", { status: 501 });
}
