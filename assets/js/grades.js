/* ==========================================================================
   درجاتي — Grades data (المصدر الوحيد لبيانات الدرجات)
   --------------------------------------------------------------------------
   هذا الملف يحتوي على كل الدرجات. عدّل هنا فقط — ولا تلمس تصميم الموقع.

   ▸ كيف تضيف درجات الفصل الدراسي الثاني لاحقاً؟
     1) ابحث في هذا الملف عن المستوى المطلوب داخل  levels.
     2) ستجد الفصل الثاني بهذا الشكل:
            { id: "s2", name: { ar: "الفصل الدراسي الثاني", en: "Second Semester" },
              recorded: false, subjects: [] }
     3) غيّر  recorded: false  إلى  recorded: true  ثم أضف المواد داخل subjects:
            { name: { ar: "اسم المادة", en: "Subject Name" }, grade: 90 },
     4) احفظ الملف وارفعه — ستظهر الدرجات تلقائياً في الموقع.

   ▸ كيف تضيف مادة جديدة إلى فصل موجود؟
     أضف سطراً جديداً داخل subjects بنفس الصيغة أعلاه.

   ▸ كيف تعدّل درجة؟
     غيّر الرقم في  grade  فقط.

   قواعد مهمة:
   - درجة النجاح 50 من 100، والدرجة العليا 100.
   - لا تضع أصفاراً ولا درجات وهمية للفصول غير المرصودة؛
     اترك  subjects: []  و  recorded: false  حتى تصدر النتائج.
   - لا يوجد حساب معدل تراكمي (لعدم اكتمال البيانات).
   ========================================================================== */

const GRADES_DATA = {
  settings: {
    passMark: 50,               // درجة النجاح
    maxMark: 100,               // الدرجة العليا
    showSemesterAverage: true   // إظهار معدل الفصل (للفصول المرصودة فقط)
  },

  /* نصوص الواجهة (عربي/إنجليزي) */
  labels: {
    button:        { ar: "درجاتي",                en: "My Grades" },
    title:         { ar: "درجاتي الأكاديمية",      en: "My Academic Grades" },
    subtitle:      { ar: "الدرجات موزّعة على المستويات والفصول الدراسية.", en: "Grades grouped by level and semester." },
    close:         { ar: "إغلاق",                  en: "Close" },
    subject:       { ar: "المادة",                 en: "Subject" },
    grade:         { ar: "الدرجة",                 en: "Grade" },
    status:        { ar: "الحالة",                 en: "Status" },
    pass:          { ar: "ناجح",                   en: "Pass" },
    fail:          { ar: "راسب",                   en: "Fail" },
    pending:       { ar: "لم تُرصد الدرجات بعد",   en: "Grades not recorded yet" },
    academicYear:  { ar: "العام الجامعي",          en: "Academic Year" },
    semesterAvg:   { ar: "معدل الفصل",             en: "Semester average" },
    subjectsCount: { ar: "عدد المواد",             en: "Subjects" }
  },

  levels: [
    {
      id: "level-1",
      name: { ar: "المستوى الأول", en: "Level 1" },
      year: "2022/2023",
      semesters: [
        {
          id: "s1",
          name: { ar: "الفصل الدراسي الأول", en: "First Semester" },
          recorded: true,
          subjects: [
            { name: { ar: "الثقافة الإسلامية",  en: "Islamic Culture" },         grade: 87 },
            { name: { ar: "لغة إنجليزية (101)", en: "English Language (101)" },  grade: 71 },
            { name: { ar: "لغة عربية (101)",    en: "Arabic Language (101)" },   grade: 72 },
            { name: { ar: "تفاضل وتكامل (1)",   en: "Calculus (1)" },            grade: 69 },
            { name: { ar: "مهارات الحاسوب",     en: "Computer Skills" },         grade: 94 },
            { name: { ar: "الثقافة الوطنية",    en: "National Culture" },        grade: 85 },
            { name: { ar: "برمجة حاسوب (1)",    en: "Computer Programming (1)" }, grade: 57 }
          ]
        },
        {
          id: "s2",
          name: { ar: "الفصل الدراسي الثاني", en: "Second Semester" },
          recorded: false,
          subjects: []
        }
      ]
    },

    {
      id: "level-2",
      name: { ar: "المستوى الثاني", en: "Level 2" },
      year: "2023/2024",
      semesters: [
        {
          id: "s1",
          name: { ar: "الفصل الدراسي الأول", en: "First Semester" },
          recorded: true,
          subjects: [
            { name: { ar: "أساسيات قواعد البيانات",   en: "Fundamentals of Databases" },      grade: 85 },
            { name: { ar: "مبادئ شبكات الحاسوب",      en: "Principles of Computer Networks" }, grade: 80 },
            { name: { ar: "أساسيات تكنولوجيا الويب",  en: "Fundamentals of Web Technology" },  grade: 76 },
            { name: { ar: "مقدمة في نظم المعلومات",   en: "Introduction to Information Systems" }, grade: 62 },
            { name: { ar: "رياضيات متقطعة",           en: "Discrete Mathematics" },            grade: 67 },
            { name: { ar: "البرمجة الكائنية",         en: "Object-Oriented Programming" },     grade: 80 }
          ]
        },
        {
          id: "s2",
          name: { ar: "الفصل الدراسي الثاني", en: "Second Semester" },
          recorded: false,
          subjects: []
        }
      ]
    },

    {
      id: "level-3",
      name: { ar: "المستوى الثالث", en: "Level 3" },
      year: "2024/2025",
      semesters: [
        {
          id: "s1",
          name: { ar: "الفصل الدراسي الأول", en: "First Semester" },
          recorded: true,
          subjects: [
            { name: { ar: "تحليل وتصميم النظم",         en: "Systems Analysis and Design" },           grade: 86 },
            { name: { ar: "أمنية المعلومات",            en: "Information Security" },                  grade: 98 },
            { name: { ar: "تطوير التطبيقات",            en: "Application Development" },               grade: 90 },
            { name: { ar: "نظم دعم القرار",             en: "Decision Support Systems" },              grade: 85 },
            { name: { ar: "مقدمة إلى الذكاء الإصطناعي", en: "Introduction to Artificial Intelligence" }, grade: 83 },
            { name: { ar: "أساسيات نظم التشغيل",        en: "Fundamentals of Operating Systems" },     grade: 74 }
          ]
        },
        {
          id: "s2",
          name: { ar: "الفصل الدراسي الثاني", en: "Second Semester" },
          recorded: false,
          subjects: []
        }
      ]
    },

    {
      id: "level-4",
      name: { ar: "المستوى الرابع", en: "Level 4" },
      year: "2025/2026",
      semesters: [
        {
          id: "s1",
          name: { ar: "الفصل الدراسي الأول", en: "First Semester" },
          recorded: true,
          subjects: [
            { name: { ar: "نظم المعلومات الجغرافية",        en: "Geographic Information Systems" },   grade: 83 },
            { name: { ar: "أخلاقيات الحاسوب",               en: "Computer Ethics" },                  grade: 97 },
            { name: { ar: "مشروع تخرج (1)",                en: "Graduation Project (1)" },           grade: 97 },
            { name: { ar: "نظم تخطيط موارد المشاريع",      en: "Enterprise Resource Planning Systems" }, grade: 87 },
            { name: { ar: "البرمجة المتقدمة (اختياري 2)",  en: "Advanced Programming (Elective 2)" }, grade: 74 }
          ]
        },
        {
          id: "s2",
          name: { ar: "الفصل الدراسي الثاني", en: "Second Semester" },
          recorded: false,
          subjects: []
        }
      ]
    }
  ]
};

window.GRADES_DATA = GRADES_DATA;
