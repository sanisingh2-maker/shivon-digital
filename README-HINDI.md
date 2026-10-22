# Shivon Digital — वेबसाइट बुकिंग प्रोटोटाइप

यह मोबाइल-फ्रेंडली फ्रंटएंड, Supabase Backend/Database और लॉगिन-आधारित एडमिन पैनल का starter project है। **यह अभी लाइव वेबसाइट नहीं है।** जब तक सेटअप पूरा करके परीक्षण न हो, ग्राहकों को इसका इस्तेमाल न करने दें।

## इसमें क्या है
- `index.html`: सेवा पेज और ऑनलाइन बुकिंग फॉर्म
- `style.css`: मोबाइल-फ्रेंडली डिजाइन
- `app.js`: फॉर्म वैलिडेशन और Supabase में बुकिंग सेव करना
- `admin.html` + `admin.js`: एडमिन लॉगिन, बुकिंग सूची और स्थिति अपडेट
- `supabase-setup.sql`: डेटाबेस टेबल और Row Level Security (RLS) नीतियाँ

## मोबाइल से सेटअप

### 1. Supabase प्रोजेक्ट बनाएँ
1. Android Chrome में https://supabase.com/ खोलें और अकाउंट बनाएँ।
2. नया project बनाएँ। डेटाबेस पासवर्ड सुरक्षित रखें।
3. Project Dashboard → SQL Editor खोलें।
4. `supabase-setup.sql` की पूरी सामग्री कॉपी करके SQL Editor में चलाएँ।
5. Project Settings → API (या Connect) में Project URL और publishable key / anon key लें।

### 2. वेबसाइट में कनेक्शन जोड़ें
1. `app.js` खोलें और `SUPABASE_URL` तथा `SUPABASE_ANON_KEY` में अपने प्रोजेक्ट की जानकारी भरें।
2. वही दो मान `admin.js` में भी भरें।
3. **कभी भी `service_role` या secret key को HTML/JavaScript में न डालें।** केवल publishable/anon key इस्तेमाल करें; सुरक्षा RLS policies करती हैं।

### 3. एडमिन अकाउंट बनाएँ
1. Supabase Dashboard → Authentication → Users में अपना एडमिन यूज़र बनाएँ (ईमेल/पासवर्ड)।
2. SQL Editor में यह चलाएँ, ईमेल को अपने एडमिन ईमेल से बदलें:
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'YOUR-ADMIN-EMAIL-HERE'
   on conflict (user_id) do nothing;
   ```
3. `admin.html` खोलकर उसी अकाउंट से लॉगिन करके जाँचें।
4. सार्वजनिक sign-up चालू न करें यदि सिर्फ आप एडमिन हैं। एडमिन अकाउंट सुरक्षित रखें और मजबूत पासवर्ड रखें।

## 4. फ्री होस्टिंग पर प्रकाशित करना
GitHub account में एक नया public repository बनाएँ और इन फ़ाइलों को upload करें। फिर Cloudflare Pages पर उस repository को connect करें। यह plain static site है, इसलिए build command खाली रखें और output directory `/` या root directory रखें (होस्टिंग UI के निर्देश के अनुसार)। प्रकाशित करने से पहले फ़ॉर्म और एडमिन लॉगिन की जाँच करें।

वैकल्पिक रूप से किसी static hosting सेवा का उपयोग कर सकते हैं। फ्री योजनाओं की शर्तें बदल सकती हैं।

## 5. जरूरी सुरक्षा बातें
- वेबसाइट पर कभी भी Supabase `service_role` / secret key न रखें।
- RLS चालू रखें; public visitors को bookings पढ़ने या अपडेट करने की अनुमति न दें।
- वास्तविक ग्राहक डेटा आने से पहले परीक्षण के लिए अलग dummy booking करें।
- ग्राहक को स्पष्ट privacy notice दें और सिर्फ जरूरत का डेटा लें।
- डेटाबेस की मुफ्त योजना में सीमाएँ हैं; usage, backups और terms जाँचें।
- `admin_users` में केवल भरोसेमंद एडमिन जोड़ें।
- यह starter project है; production से पहले spam/rate limiting, privacy policy, terms, backup/recovery और सुरक्षा समीक्षा जोड़ें।

## सीमाएँ
यह प्रोटोटाइप केवल Social Media Marketing सेवा स्वीकार करता है। ऑनलाइन पेमेंट, ईमेल/SMS सूचनाएँ, स्वतः समय-आधारित स्लॉट और multi-admin roles अभी शामिल नहीं हैं। WhatsApp booking शामिल नहीं है।
