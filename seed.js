// First data set, approved by Sharon: the 4 Epics and the 26–31.10 sprint only.
// Written once, on Sharon’s first sign-in, when the database is empty.
export const SEED={
 "units": [
  {
   "code": "AIV",
   "type": "epic",
   "title": "השקעה ראשונה",
   "area": "inv",
   "owner": "liam",
   "start": "2026-10-26",
   "due": "2026-12-31",
   "dueType": "soft",
   "dueWhy": "יעד ניהולי: סבב חתום עד סוף השנה, לפני שה-Runway הנוכחי נגמר.",
   "prio": "P1",
   "deliverable": "סבב ראשון חתום, כיוון של 1.5 מיליון דולר ל-18 חודשים.",
   "dod": "Term sheet חתום והכסף בחשבון.",
   "desc": "גיוס הסבב הראשון של Addrio, על בסיס המצגת והמודל הפיננסי.",
   "created": "2026-10-26 09:00:00",
   "n": 1
  },
  {
   "code": "AMK",
   "type": "epic",
   "title": "1,000 לקוחות פרטיים",
   "area": "mkt",
   "owner": "liam",
   "start": "2026-10-26",
   "due": "2026-11-30",
   "dueType": "soft",
   "dueWhy": "נקודת ביקורת לפני פגישות המשקיעים בדצמבר.",
   "prio": "P1",
   "deliverable": "1,000 משתמשים פרטיים עם פרופיל מלא.",
   "dod": "1,000 פרופילים מלאים בדשבורד המוצר.",
   "desc": "מאסה ראשונה של משתמשים פרטיים דרך שיווק אורגני ומשפך השליחה.",
   "created": "2026-10-26 09:00:00",
   "n": 2
  },
  {
   "code": "ADK",
   "type": "epic",
   "title": "מוכנות מצגת משקיעים",
   "area": "inv",
   "areas2": [
    "res"
   ],
   "owner": "sharon",
   "start": "2026-10-26",
   "due": "2026-11-30",
   "dueType": "dep",
   "dueWhy": "נגזר מ-AIV: המצגת צריכה להיות מוכנה לפני סבב הפגישות.",
   "prio": "P1",
   "deliverable": "מצגת HE/EN מאושרת, עם מודל עסקי, מודל פיננסי ו-TAM/SAM מעודכנים, על בסיס הלמידה מהקורס.",
   "dod": "ליאם ושרון מאשרות את המצגת המלאה.",
   "desc": "המצגת עוברת כולה לשרון. עידו עוצר ושולח את מה שקיים.",
   "created": "2026-10-26 09:00:00",
   "n": 3
  },
  {
   "code": "AUX",
   "type": "epic",
   "title": "עדכון גרסה: חווית משתמש מותאמת",
   "area": "des",
   "areas2": [
    "dev"
   ],
   "owner": "liam",
   "start": "2026-10-26",
   "due": "2026-11-30",
   "dueType": "soft",
   "dueWhy": "הגרסה צריכה לעלות לפני מאמץ השיווק המרכזי של AMK.",
   "prio": "P1",
   "deliverable": "גרסה באוויר עם יצירת פרופיל פשוטה, רגע שליחה ברור ומסך הגדרות.",
   "dod": "הגרסה מפורסמת בשתי החנויות, ומשפך השליחה מראה שיפור מול נקודת הפתיחה.",
   "desc": "שמים את חווית המשתמש במרכז: כל מי שהוריד יוצר פרופיל מלא ורוצה לשלוח אותו לחבר.",
   "created": "2026-10-26 09:00:00",
   "n": 4
  },
  {
   "code": "AUX-1",
   "type": "task",
   "epic": "AUX",
   "parent": "AUX",
   "title": "מסמך אפיון לחוויה קלה ונעימה",
   "area": "des",
   "owner": "liam",
   "start": "2026-10-26",
   "due": "2026-10-30",
   "dueType": "soft",
   "dueWhy": "יובל ועידו תלויים בו.",
   "prio": "P1",
   "status": "todo",
   "sprint": 1,
   "path": [
    "todo",
    "prog",
    "rev",
    "done"
   ],
   "dod": "מסמך אפיון שמשיג שתי מטרות: כל מי שהוריד יוצר פרופיל מלא, וכל משתמש רוצה לשלוח את הפרופיל לחבר. כולל רשימת שינויים מתועדפת ליובל ולעידו.",
   "desc": "כיוון לבדיקה: להתחיל בתמונת \"השאר ליד הדלת\", שאפשר לצלם בלי לצאת מהבית.",
   "checklist": {
    "style": "steps",
    "items": [
     [
      "מיפוי המסכים הקיימים",
      0
     ],
     [
      "שלוש מתחרות לבדיקה",
      0
     ],
     [
      "טיוטת זרימה חדשה",
      0
     ],
     [
      "רשימת שינויים מתועדפת",
      0
     ]
    ]
   },
   "created": "2026-10-26 09:00:00",
   "n": 5
  },
  {
   "code": "AMK-1",
   "type": "task",
   "epic": "AMK",
   "parent": "AMK",
   "title": "פגישה עם ניב על שיווק לפרטיים",
   "area": "mkt",
   "owner": "liam",
   "start": "2026-10-27",
   "due": "2026-10-27",
   "dueType": "hard",
   "dueWhy": "מועד הפגישה נקבע מול ניב.",
   "prio": "P2",
   "status": "todo",
   "sprint": 1,
   "path": [
    "todo",
    "prog",
    "done"
   ],
   "dod": "כיוון ראשון להשגת מאסה של הורדות, והערות של ניב לדיוק האפיון.",
   "created": "2026-10-26 09:00:00",
   "n": 6
  },
  {
   "code": "AIV-1",
   "type": "task",
   "epic": "AIV",
   "parent": "AIV",
   "title": "חיבורים חמים לחברות משלוחים גדולות",
   "area": "inv",
   "areas2": [
    "mkt"
   ],
   "owner": "liam",
   "start": "2026-10-26",
   "due": "2026-10-31",
   "dueType": "soft",
   "dueWhy": "",
   "prio": "P2",
   "status": "todo",
   "sprint": 1,
   "path": [
    "todo",
    "prog",
    "done"
   ],
   "dod": "חיבור חם לשתי חברות משלוחים גדולות, עם איש קשר בכל אחת.",
   "checklist": {
    "style": "bullets",
    "items": [
     [
      "לבקש משלמה חיבור",
      0
     ],
     [
      "לקבוע פגישה עם אושרי",
      0
     ]
    ]
   },
   "created": "2026-10-26 09:00:00",
   "n": 7
  },
  {
   "code": "ADK-1",
   "type": "task",
   "epic": "ADK",
   "parent": "ADK",
   "title": "טיוטה של מודל עסקי",
   "area": "inv",
   "owner": "sharon",
   "start": "2026-10-26",
   "due": "2026-10-30",
   "dueType": "soft",
   "dueWhy": "ליאם רואה את ההנחות בסוף השבוע.",
   "prio": "P1",
   "status": "todo",
   "sprint": 1,
   "path": [
    "todo",
    "prog",
    "rev",
    "done"
   ],
   "dod": "עמוד אחד על חברות משלוחים: מי הקונה, מי המשתמש, יחידת החיוב, סוג ההכנסה, שיטת התמחור, וטווח מחיר כהשערה. בלי מחיר סופי.",
   "created": "2026-10-26 09:00:00",
   "n": 8
  },
  {
   "code": "ADK-2",
   "type": "task",
   "epic": "ADK",
   "parent": "ADK",
   "title": "טיוטה של מודל פיננסי",
   "area": "inv",
   "owner": "sharon",
   "start": "2026-10-28",
   "due": "2026-10-31",
   "dueType": "soft",
   "dueWhy": "",
   "prio": "P1",
   "status": "todo",
   "sprint": 1,
   "path": [
    "todo",
    "prog",
    "rev",
    "done"
   ],
   "dod": "גיליון אחד: איך 1.5 מיליון דולר מתחלקים על 18 חודשים, הוצאה חודשית, Runway, ומה הכסף אמור להשיג.",
   "created": "2026-10-26 09:00:00",
   "n": 9
  },
  {
   "code": "ADK-5",
   "type": "task",
   "epic": "ADK",
   "parent": "ADK",
   "title": "לשלוח לשרון את קבצי המצגת",
   "area": "des",
   "owner": "ido",
   "start": "2026-10-26",
   "due": "2026-10-27",
   "dueType": "hard",
   "dueWhy": "שרון לא יכולה להתחיל לעבד הערות בלי הקבצים.",
   "prio": "P2",
   "status": "todo",
   "sprint": 1,
   "path": [
    "todo",
    "done"
   ],
   "dod": "הקבצים העדכניים אצל שרון, כמו שהם, בלי עבודה נוספת.",
   "created": "2026-10-26 09:00:00",
   "n": 10
  },
  {
   "code": "AUX-2",
   "type": "task",
   "epic": "AUX",
   "parent": "AUX",
   "title": "לפשט את הממשק לפי האפיון",
   "area": "dev",
   "owner": "yovel",
   "start": "2026-10-29",
   "due": "2026-10-31",
   "dueType": "dep",
   "dueWhy": "תלוי באפיון של ליאם (AUX-1).",
   "prio": "P1",
   "status": "todo",
   "state": "block",
   "blockedBy": "AUX-1",
   "sprint": 1,
   "path": [
    "todo",
    "prog",
    "rev",
    "done"
   ],
   "dod": "השינויים הראשונים מהרשימה של ליאם נמצאים באפליקציה.",
   "created": "2026-10-26 09:00:00",
   "n": 11
  },
  {
   "code": "AMK-2",
   "type": "task",
   "epic": "AMK",
   "parent": "AMK",
   "former": "AUX-7",
   "title": "למדוד את משפך השליחה",
   "area": "dev",
   "areas2": [
    "mkt"
   ],
   "owner": "yovel",
   "start": "2026-10-26",
   "due": "2026-10-29",
   "dueType": "soft",
   "dueWhy": "נקודת פתיחה לפני שינויי הגרסה.",
   "prio": "P1",
   "status": "todo",
   "sprint": 1,
   "path": [
    "todo",
    "prog",
    "rev",
    "done"
   ],
   "dod": "אפשר לראות כמה יצרו כרטיס, כמה שלחו, כמה נמענים פתחו, וכמה הצטרפו דרך \"צור לי אדריו\".",
   "created": "2026-10-26 09:00:00",
   "n": 12
  },
  {
   "code": "AUX-3",
   "type": "task",
   "epic": "AUX",
   "parent": "AUX",
   "title": "לסגור את הבאגים הפתוחים",
   "area": "dev",
   "owner": "yovel",
   "start": "2026-10-26",
   "due": "2026-10-29",
   "dueType": "soft",
   "dueWhy": "",
   "prio": "P2",
   "status": "todo",
   "sprint": 1,
   "path": [
    "todo",
    "prog",
    "done"
   ],
   "dod": "קישור ההורדה ותוקף 30 הימים תוקנו. אף משתמש לא נתקע בגלל תקלה.",
   "checklist": {
    "style": "bullets",
    "items": [
     [
      "קישור ההורדה",
      0
     ],
     [
      "תוקף 30 יום לכרטיס",
      0
     ]
    ]
   },
   "created": "2026-10-26 09:00:00",
   "n": 13
  },
  {
   "code": "AUX-4",
   "type": "task",
   "epic": "AUX",
   "parent": "AUX",
   "title": "תצוגה מקדימה של הכרטיס בוואטסאפ",
   "area": "des",
   "owner": "ido",
   "start": "2026-10-26",
   "due": "2026-10-29",
   "dueType": "soft",
   "dueWhy": "",
   "prio": "P2",
   "status": "todo",
   "sprint": 1,
   "path": [
    "todo",
    "prog",
    "rev",
    "done"
   ],
   "dod": "עיצוב של מה שהנמען רואה בוואטסאפ (תמונה, כותרת, שורת תיאור), ויובל יודע מה לבנות.",
   "created": "2026-10-26 09:00:00",
   "n": 14
  },
  {
   "code": "AUX-5",
   "type": "task",
   "epic": "AUX",
   "parent": "AUX",
   "title": "לעצב את המסכים שהשתנו באפיון",
   "area": "des",
   "owner": "ido",
   "start": "2026-10-29",
   "due": "2026-10-31",
   "dueType": "dep",
   "dueWhy": "תלוי ב-AUX-1.",
   "prio": "P2",
   "status": "todo",
   "sprint": 1,
   "path": [
    "todo",
    "prog",
    "rev",
    "done"
   ],
   "dod": "המסכים שהשתנו מעוצבים, כולל יצירת הפרופיל ורגע השליחה.",
   "created": "2026-10-26 09:00:00",
   "n": 15
  }
 ],
 "areas": {
  "mgmt": [
   "ניהול",
   "--ar-mgmt"
  ],
  "mkt": [
   "שיווק",
   "--ar-mkt"
  ],
  "dev": [
   "פיתוח",
   "--ar-dev"
  ],
  "des": [
   "עיצוב",
   "--ar-des"
  ],
  "inv": [
   "השקעה",
   "--ar-inv"
  ],
  "res": [
   "מחקר",
   "--ar-res"
  ]
 },
 "sprint": {
  "n": 1,
  "start": "2026-10-26",
  "end": "2026-10-31",
  "label": "שבוע 26–31.10",
  "goal": "טיוטת מודל עסקי ומודל פיננסי, מסמך אפיון לחוויה, ומשפך שליחה מדיד, עד שבת 31.10."
 }
};
