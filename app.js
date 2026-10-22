import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 1) Supabase project URL और publishable/anon key को नीचे भरें.
// 2) केवल publishable/anon key ही browser में रखें. service_role key कभी न डालें.
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";
const supabaseReady = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const supabase = supabaseReady ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const form = document.querySelector("#booking-form");
const status = document.querySelector("#form-status");
document.querySelector("#year").textContent = new Date().getFullYear();

function showStatus(message, type = "error") {
  status.textContent = message;
  status.className = `status ${type}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  if (!supabaseReady) {
    showStatus("अभी डेटाबेस कनेक्शन सेट नहीं है, इसलिए बुकिंग सेव नहीं हुई। README में दिए गए सेटअप स्टेप पूरे करें।");
    return;
  }

  const data = new FormData(form);
  const phone = String(data.get("phone") || "").trim();
  if (!/^[6-9]\d{9}$/.test(phone)) {
    showStatus("कृपया सही 10 अंकों का भारतीय मोबाइल नंबर डालें।");
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "बुकिंग भेजी जा रही है…";
  try {
    const { data: result, error } = await supabase
      .from("bookings")
      .insert({
        service: String(data.get("service")),
        customer_name: String(data.get("name")).trim(),
        phone,
        business_name: String(data.get("business") || "").trim() || null,
        details: String(data.get("details")).trim(),
        budget: String(data.get("budget") || "").trim() || null
      })
      .select("booking_id")
      .single();

    if (error) throw error;
    form.reset();
    document.querySelector("#service").value = "Social Media Marketing";
    showStatus(`आपकी बुकिंग सफलतापूर्वक दर्ज हुई। बुकिंग ID: ${result.booking_id}। इसे सुरक्षित रख लें।`, "success");
  } catch (error) {
    console.error("Booking submission failed:", error);
    showStatus("बुकिंग सेव नहीं हो सकी। इंटरनेट और Supabase सेटअप जाँचें, फिर दोबारा प्रयास करें।");
  } finally {
    button.disabled = false;
    button.innerHTML = 'बुकिंग भेजें <span>→</span>';
  }
});