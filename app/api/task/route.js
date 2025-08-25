import clientPromise from "@/lib/mongoClient";

export async function GET() {
  try {
    const client = await clientPromise; // <- no ()
    const db = client.db("TaskEarnDB"); // use your database

    const tasks = await db.collection("AllTask").find({}).toArray();

    return new Response(JSON.stringify(tasks), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
