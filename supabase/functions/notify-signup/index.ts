import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "theosimodel@gmail.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface ProfilePayload {
  type: "INSERT";
  table: "profiles";
  record: {
    id: string;
    username: string;
    created_at?: string;
  };
  schema: "public";
}

serve(async (req) => {
  try {
    const payload: ProfilePayload = await req.json();

    // Only handle INSERT events
    if (payload.type !== "INSERT") {
      return new Response(JSON.stringify({ message: "Ignored non-INSERT event" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id: userId, username } = payload.record;

    // Fetch user's email from auth.users using service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData.user) {
      console.error("Error fetching user:", userError);
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userEmail = userData.user.email;
    const signupTime = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "full",
      timeStyle: "short",
    });

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Continuity <notifications@resend.dev>",
        to: [NOTIFICATION_EMAIL],
        subject: `New Continuity Sign-up: ${username}`,
        html: `
          <h2>New User Sign-up</h2>
          <p>A new user just signed up for Continuity!</p>
          <table style="border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Username</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${username}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Signed up at</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${signupTime}</td>
            </tr>
          </table>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Notification sent for new user: ${username} (${userEmail})`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
