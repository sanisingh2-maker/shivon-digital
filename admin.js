import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";
const ready = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const supabase = ready ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const loginForm = document.querySelector("#login-form");
const status = document.querySelector("#admin-status");
const content = document.querySelector("#admin-content");
const rows = document.querySelector("#booking-rows");
function msg(text, type = "error") { status.textContent = text; status.className = `status ${type}`; }
function safeCell(value) { const td = document.createElement("td"); td.style.cssText = "padding:10px;border-top:1px solid #dfe9e1;vertical-align:top;max-width:240px;white-space:pre-wrap;overflow-wrap:anywhere"; td.textContent = value ?? "—"; return td; }
if (!ready) msg("Supabase कनेक्शन सेट नहीं है। app.js और admin.js में Project URL और publishable/anon key डालें।");
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!ready) return;
  const button = loginForm.querySelector("button");
  button.disabled = true;
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: document.querySelector("#email").value.trim(),
      password: document.querySelector("#password").value
    });
    if (error) throw error;
    msg("लॉगिन सफल। बुकिंग लोड की जा रही हैं…", "success");
    await loadBookings();
  } catch (error) {
    console.error(error);
    msg("लॉगिन नहीं हो सका। ईमेल/पासवर्ड और Supabase Auth सेटअप जाँचें।");
  } finally { button.disabled = false; }
});
async function loadBookings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { content.hidden = true; return; }
  // Database RLS checks whether this authenticated user is an authorized admin.
  const { data, error } = await supabase.from("bookings")
    .select("booking_id,created_at,customer_name,phone,service,details,status")
    .order("created_at", { ascending: false }).limit(200);
  if (error) {
    msg("बुकिंग नहीं दिखीं। सुनिश्चित करें कि आपका यूज़र admin_users तालिका में है।");
    console.error(error); return;
  }
  rows.replaceChildren();
  for (const item of data) {
    const tr = document.createElement("tr");
    tr.append(safeCell(`${item.booking_id}\n${new Date(item.created_at).toLocaleString("hi-IN")}`));
    tr.append(safeCell(item.customer_name));
    tr.append(safeCell(item.phone));
    tr.append(safeCell(`${item.service}\n${item.details}`));
    const td = safeCell("");
    const select = document.createElement("select");
    for (const option of ["new", "contacted", "in_progress", "completed", "cancelled"]) {
      const opt = document.createElement("option"); opt.value = option; opt.textContent = ({new:"नई",contacted:"संपर्क किया",in_progress:"काम जारी",completed:"पूरी",cancelled:"रद्द"})[option]; opt.selected = item.status === option; select.append(opt);
    }
    select.addEventListener("change", async () => {
      const { error: updateError } = await supabase.from("bookings").update({ status: select.value }).eq("booking_id", item.booking_id);
      if (updateError) { msg("स्थिति अपडेट नहीं हुई। एडमिन अनुमति जाँचें।"); console.error(updateError); }
      else msg(`बुकिंग ${item.booking_id} की स्थिति अपडेट हो गई।`, "success");
    });
    td.append(select); tr.append(td); rows.append(tr);
  }
  content.hidden = false;
  msg(`कुल ${data.length} हाल की बुकिंग लोड हुईं।`, "success");
}
document.querySelector("#logout").addEventListener("click", async () => {
  await supabase.auth.signOut(); content.hidden = true; msg("आप लॉगआउट हो गए हैं।", "success");
});
supabase?.auth.onAuthStateChange((_event, session) => { if (session) loadBookings(); else content.hidden = true; });