
const MCP_URL =
  "https://questathon.aihackerscollective.com/api/public/mcp";

const ALLOWED_TOOLS = new Set([
  "whoami",
  "get_my_accounts",
  "get_signals",
  "get_all_paperwork",
  "get_file",
  "list_paperwork",
  "get_feature_requests",
  "get_release_notes",
  "get_flytbase_team",
  "get_data_format",
  "list_notes",
  "write_note"
]);

export async function POST(request) {
  try {
    const token = process.env.AQ_TOKEN;

    if (!token) {
      return Response.json(
        { error: "AQ_TOKEN is not configured on the server." },
        { status: 500 }
      );
    }

    const { name, arguments: args = {} } = await request.json();

    if (!ALLOWED_TOOLS.has(name)) {
      return Response.json(
        { error: "Tool not allowed." },
        { status: 400 }
      );
    }

    const response = await fetch(MCP_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name, arguments: args }
      }),
      cache: "no-store"
    });

    const result = await response.json();

    if (!response.ok || result.error || result.result?.isError) {
      return Response.json(
        { error: result.error?.message || "MCP request failed." },
        { status: 502 }
      );
    }

    return Response.json(
      JSON.parse(result.result.content[0].text)
    );
  } catch (error) {
    return Response.json(
      { error: error.message || "Server error." },
      { status: 500 }
    );
  }
}
