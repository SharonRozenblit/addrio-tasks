# Addrio Tasks

ניהול המשימות של Addrio. אתר סטטי (GitHub Pages) עם Firebase: התחברות Google ו-Firestore בתל אביב.

- `index.html` — כל הממשק (נבנה מהאב-טיפוס המאושר)
- `sync.js` — התחברות וסנכרון עם Firestore
- `seed.js` — הנתונים הראשונים: 4 ה-Epics וספרינט 26–31.10. נכתבים פעם אחת, בכניסה הראשונה של שרון
- `firestore.rules` — כללי האבטחה. מדביקים אותם ב-Firebase Console ← Firestore ← Rules

## מחבר ל-Claude ול-ChatGPT (קריאה בלבד)

`connector/` — שרת MCP קטן ב-Cloudflare Workers. נכנסים אליו עם Google, והוא קורא מ-Firestore בשם המשתמש, דרך אותם כללי אבטחה של האתר. אין בו פעולות כתיבה, והודעות אישיות לא עוברות בו.
עולה אוטומטית מ-`.github/workflows/connector.yml` בכל שינוי בתיקייה. צריך ארבעה סודות ב-GitHub: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
