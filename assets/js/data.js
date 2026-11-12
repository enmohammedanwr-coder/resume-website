/* ==========================================================================
   ملف المحتوى — تم إنشاؤه من لوحة التحكم (admin.html)
   عدّل من لوحة التحكم ثم اضغط «نشر». يمكنك أيضاً تعديل هذا الملف يدوياً.
   ========================================================================== */

const SITE_DATA = {
  "meta": {
    "photo": "assets/img/upload-e7f6cda5.jpg",
    "cvFile": "assets/cv/Mohammed-Anwar-CV.pdf",
    "phone": "+967774931730",
    "whatsapp": "967774931730",
    "emails": [
      "m25647859@gmail.com",
      "En.mohammedanwr@gmail.com"
    ],
    "social": {
      "linkedin": "",
      "github": "https://github.com/enmohammedanwr-coder",
      "twitter": ""
    },
    "grades": {
      "settings": {
        "passMark": 50,
        "maxMark": 100,
        "showSemesterAverage": true
      },
      "labels": {
        "button": {
          "ar": "درجاتي",
          "en": "My Grades"
        },
        "title": {
          "ar": "درجاتي الأكاديمية",
          "en": "My Academic Grades"
        },
        "subtitle": {
          "ar": "الدرجات موزّعة على المستويات والفصول الدراسية.",
          "en": "Grades grouped by level and semester."
        },
        "close": {
          "ar": "إغلاق",
          "en": "Close"
        },
        "subject": {
          "ar": "المادة",
          "en": "Subject"
        },
        "grade": {
          "ar": "الدرجة",
          "en": "Grade"
        },
        "status": {
          "ar": "الحالة",
          "en": "Status"
        },
        "pass": {
          "ar": "ناجح",
          "en": "Pass"
        },
        "fail": {
          "ar": "راسب",
          "en": "Fail"
        },
        "pending": {
          "ar": "لم تُرصد الدرجات بعد",
          "en": "Grades not recorded yet"
        },
        "academicYear": {
          "ar": "العام الجامعي",
          "en": "Academic Year"
        },
        "semesterAvg": {
          "ar": "معدل الفصل",
          "en": "Semester average"
        },
        "subjectsCount": {
          "ar": "عدد المواد",
          "en": "Subjects"
        }
      },
      "levels": [
        {
          "id": "level-1",
          "name": {
            "ar": "المستوى الأول",
            "en": "Level 1"
          },
          "year": "2022/2023",
          "semesters": [
            {
              "id": "s1",
              "name": {
                "ar": "الفصل الدراسي الأول",
                "en": "First Semester"
              },
              "recorded": true,
              "subjects": [
                {
                  "name": {
                    "ar": "الثقافة الإسلامية",
                    "en": "Islamic Culture"
                  },
                  "grade": 86
                },
                {
                  "name": {
                    "ar": "لغة إنجليزية (101)",
                    "en": "English Language (101)"
                  },
                  "grade": 89
                },
                {
                  "name": {
                    "ar": "لغة عربية (101)",
                    "en": "Arabic Language (101)"
                  },
                  "grade": 90
                },
                {
                  "name": {
                    "ar": "تفاضل وتكامل (1)",
                    "en": "Calculus (1)"
                  },
                  "grade": 80
                },
                {
                  "name": {
                    "ar": "مهارات الحاسوب",
                    "en": "Computer Skills"
                  },
                  "grade": 94
                },
                {
                  "name": {
                    "ar": "الثقافة الوطنية",
                    "en": "National Culture"
                  },
                  "grade": 85
                },
                {
                  "name": {
                    "ar": "برمجة حاسوب (1)",
                    "en": "Computer Programming (1)"
                  },
                  "grade": 92
                }
              ]
            },
            {
              "id": "s2",
              "name": {
                "ar": "الفصل الدراسي الثاني",
                "en": "Second Semester"
              },
              "recorded": false,
              "subjects": []
            }
          ]
        },
        {
          "id": "level-2",
          "name": {
            "ar": "المستوى الثاني",
            "en": "Level 2"
          },
          "year": "2023/2024",
          "semesters": [
            {
              "id": "s1",
              "name": {
                "ar": "الفصل الدراسي الأول",
                "en": "First Semester"
              },
              "recorded": true,
              "subjects": [
                {
                  "name": {
                    "ar": "أساسيات قواعد البيانات",
                    "en": "Fundamentals of Databases"
                  },
                  "grade": 94
                },
                {
                  "name": {
                    "ar": "مبادئ شبكات الحاسوب",
                    "en": "Principles of Computer Networks"
                  },
                  "grade": 83
                },
                {
                  "name": {
                    "ar": "أساسيات تكنولوجيا الويب",
                    "en": "Fundamentals of Web Technology"
                  },
                  "grade": 90
                },
                {
                  "name": {
                    "ar": "مقدمة في نظم المعلومات",
                    "en": "Introduction to Information Systems"
                  },
                  "grade": 92
                },
                {
                  "name": {
                    "ar": "رياضيات متقطعة",
                    "en": "Discrete Mathematics"
                  },
                  "grade": 93
                },
                {
                  "name": {
                    "ar": "البرمجة الكائنية",
                    "en": "Object-Oriented Programming"
                  },
                  "grade": 91
                }
              ]
            },
            {
              "id": "s2",
              "name": {
                "ar": "الفصل الدراسي الثاني",
                "en": "Second Semester"
              },
              "recorded": false,
              "subjects": []
            }
          ]
        },
        {
          "id": "level-3",
          "name": {
            "ar": "المستوى الثالث",
            "en": "Level 3"
          },
          "year": "2024/2025",
          "semesters": [
            {
              "id": "s1",
              "name": {
                "ar": "الفصل الدراسي الأول",
                "en": "First Semester"
              },
              "recorded": true,
              "subjects": [
                {
                  "name": {
                    "ar": "تحليل وتصميم النظم",
                    "en": "Systems Analysis and Design"
                  },
                  "grade": 87
                },
                {
                  "name": {
                    "ar": "أمنية المعلومات",
                    "en": "Information Security"
                  },
                  "grade": 98
                },
                {
                  "name": {
                    "ar": "تطوير التطبيقات",
                    "en": "Application Development"
                  },
                  "grade": 90
                },
                {
                  "name": {
                    "ar": "نظم دعم القرار",
                    "en": "Decision Support Systems"
                  },
                  "grade": 85
                },
                {
                  "name": {
                    "ar": "مقدمة إلى الذكاء الإصطناعي",
                    "en": "Introduction to Artificial Intelligence"
                  },
                  "grade": 83
                },
                {
                  "name": {
                    "ar": "أساسيات نظم التشغيل",
                    "en": "Fundamentals of Operating Systems"
                  },
                  "grade": 86
                }
              ]
            },
            {
              "id": "s2",
              "name": {
                "ar": "الفصل الدراسي الثاني",
                "en": "Second Semester"
              },
              "recorded": false,
              "subjects": []
            }
          ]
        },
        {
          "id": "level-4",
          "name": {
            "ar": "المستوى الرابع",
            "en": "Level 4"
          },
          "year": "2025/2026",
          "semesters": [
            {
              "id": "s1",
              "name": {
                "ar": "الفصل الدراسي الأول",
                "en": "First Semester"
              },
              "recorded": true,
              "subjects": [
                {
                  "name": {
                    "ar": "نظم المعلومات الجغرافية",
                    "en": "Geographic Information Systems"
                  },
                  "grade": 83
                },
                {
                  "name": {
                    "ar": "أخلاقيات الحاسوب",
                    "en": "Computer Ethics"
                  },
                  "grade": 97
                },
                {
                  "name": {
                    "ar": "مشروع تخرج (1)",
                    "en": "Graduation Project (1)"
                  },
                  "grade": 97
                },
                {
                  "name": {
                    "ar": "نظم تخطيط موارد المشاريع",
                    "en": "Enterprise Resource Planning Systems"
                  },
                  "grade": 87
                },
                {
                  "name": {
                    "ar": "البرمجة المتقدمة (اختياري 2)",
                    "en": "Advanced Programming (Elective 2)"
                  },
                  "grade": 83
                }
              ]
            },
            {
              "id": "s2",
              "name": {
                "ar": "الفصل الدراسي الثاني",
                "en": "Second Semester"
              },
              "recorded": false,
              "subjects": []
            }
          ]
        }
      ]
    }
  },
  "ar": {
    "dir": "rtl",
    "lang": "ar",
    "brand": "محمد أنور عمران",
    "nav": {
      "home": "الرئيسية",
      "about": "من أنا",
      "projects": "مشاريعي",
      "services": "خدماتي",
      "skills": "مهاراتي",
      "qualifications": "مؤهلاتي",
      "contact": "تواصل معي"
    },
    "hero": {
      "greeting": "مرحباً، أنا",
      "name": "محمد أنور يحي أحمد عمران",
      "title": "خريج نظم معلومات حاسوبية | مطور برمجيات | مطور مواقع وتطبيقات | متخصص في قواعد البيانات وتقنية المعلومات",
      "tagline": "أحوّل الأفكار إلى حلول برمجية عملية — من تحليل المتطلبات وتصميم قواعد البيانات، إلى بناء المواقع والتطبيقات وتقديم الدعم الفني.",
      "buttons": {
        "projects": "تعرّف على مشاريعي",
        "skills": "اكتشف مهاراتي",
        "contact": "تواصل معي",
        "cv": "تحميل السيرة الذاتية PDF"
      }
    },
    "about": {
      "title": "من أنا",
      "lead": "مطوّر ومتخصص في تقنية المعلومات، أجمع بين المعرفة التقنية والإدارية.",
      "paragraphs": [
        "أنا محمد أنور يحي أحمد عمران، خريج كلية الهندسة وتقنية المعلومات بجامعة عمران، حاصل على بكالوريوس في نظم المعلومات الحاسوبية عام 2026 بمعدل 91%. التقدير (ممتاز) أهتم بالبرمجة وتطوير الأنظمة وتحليل البيانات وقواعد البيانات، وبتحويل المتطلبات إلى حلول تقنية منظّمة وقابلة للتطوير.",
        "أمتلك خبرة أكاديمية وعملية في تطوير المواقع وتطبيقات الهاتف، وتصميم وإدارة قواعد البيانات، وبناء أنظمة المعلومات. كما أتمتع بمهارات في الإدارة والعمل الجماعي وحل المشكلات، واهتمام دائم بالتعلّم المستمر ومواكبة الأدوات التقنية الحديثة."
      ],
      "facts": [
        {
          "label": "الجامعة",
          "value": "جامعة عمران"
        },
        {
          "label": "الكلية",
          "value": "كلية الهندسة وتقنية المعلومات"
        },
        {
          "label": "التخصص",
          "value": "نظم المعلومات الحاسوبية"
        },
        {
          "label": "التخرج",
          "value": "2026"
        },
        {
          "label": "المعدل",
          "value": "91%  ممتاز"
        }
      ]
    },
    "projects": {
      "title": "مشاريعي السابقة",
      "subtitle": "مجموعة من المشاريع التي تعكس قدراتي في البرمجة وتطوير الأنظمة والتطبيقات.",
      "viewDetails": "عرض التفاصيل",
      "techLabel": "التقنيات",
      "items": [
        {
          "id": "airport",
          "name": "مطار عمران الدولي",
          "tech": [
            "C#"
          ],
          "short": "نظام برمجي لتنظيم وإدارة عمليات مطار عمران الدولي باستخدام لغة C#.",
          "details": "مشروع أكاديمي تم تطويره باستخدام لغة C# بهدف تنظيم وإدارة العمليات التشغيلية والبيانات الخاصة بالمطار. يمكن إضافة الوصف التفصيلي، واجهات النظام، وصور المشروع الحقيقية هنا لاحقاً.",
          "image": "assets/img/project-airport.jpg"
        },
        {
          "id": "traffic",
          "name": "كشف حركات المرور",
          "tech": [
            "Python"
          ],
          "short": "مشروع لتحليل وكشف حركات المرور باستخدام لغة Python.",
          "details": "مشروع تم تنفيذه بلغة Python للتعامل مع بيانات حركة المرور وتحليلها وكشف الأنماط. يمكن إضافة شرح آلية العمل ومراحل المعالجة والنتائج هنا لاحقاً.",
          "image": "assets/img/project-traffic.jpg"
        },
        {
          "id": "guardian",
          "name": "تطبيق الحارس الذكي",
          "tech": [
            "Android"
          ],
          "short": "تطبيق أندرويد ذكي يقدّم وظيفة الحماية والمراقبة عبر الهاتف.",
          "details": "تطبيق أندرويد يهدف إلى تقديم وظائف الحماية الذكية. يمكن إضافة صور واجهات التطبيق وشرح وظائفه وميزاته هنا لاحقاً.",
          "image": "assets/img/project-guardian.jpg"
        },
        {
          "id": "training",
          "name": "نظام مركز التدريب والتأهيل",
          "tech": [
            "PHP"
          ],
          "short": "نظام إدارة مراكز التدريب، ويتضمن إصدار الشهادات.",
          "details": "نظام مبني بلغة PHP لإدارة بيانات المتدربين والدورات والبرامج التدريبية، ويتضمّن خاصية إصدار الشهادات. يمكن إضافة تفاصيل الوحدات وواجهات النظام هنا لاحقاً.",
          "image": "assets/img/project-training.jpg"
        },
        {
          "name": "منصة إدارة مشارٌيع التخرج وربطها بالمؤسسات العامة",
          "short": "لداء جامعه عمران الكثير  والكثير من العقول المبتكره هنك طلاب لديهم افكار وعقول ابتكاريه وللاستفاده من العقول المبتكره قمنا بعمل المنصه هذه وتشغيل العقول المثمره بالخير  ف بدلاٌ من ان يلجاء  الطالب ذات العقل المثمر  الى مشروع غير واقعي   والمجتمع ليس بحاجه اليه قمنا بعمل منصه اداره مشاريع التخرج وربطها بالموؤسسات العامة تجعل الطالب يعمل مشروع التخرج الخاص به مشروع واقعي بدلا من ان يجعله كتاب  من ضمن الكتب المتوفره في المكتبه جعلناه  يتنفذ في ارض الواقع   بفضل المنصه الذي تربط الموؤسسة  بمشاريع التخرج",
          "details": "الموؤسسات لديها مشاكل وتحتاج لحل المشاكل تقوم بطرح المشاكل الخاصه بها في المنصه من خلال رفع المشكله وشرحهل  وتقوم بالرفع النضام المركزي يقوم بالاطلاع على المشكله هل هي مشكله حقيقيه وقابه لحل ام لا اذكانت حقيقيه يقوم بوضعها على المنصه اذاكانت لا يعمل على ازالتها الطالب مستوى رابع يمكنه الاطلاع على المشاريع المكتمله المشاريع قيد التطوير  والمشاريع الجديده ف الطالب يختار المشروع   او الفكره الذي قامت بطرحها الموؤسسة الوزاره تقوم بالتواصل مع الطاالب هل انت مستعد لعمل المشروع هذا حتى النهايه  الطلب (نعم) الوزاره تقوم بالتواصل مع الموؤسسة هناك اشخاص يريدون حل المثكله الخاصه بكم هل انتم مستعدون لدعمهم بالنت والقطع في حال احتياجها (الموؤسسة نعم ) الطالب يبدا العمل في هذا الحله الطالب عمل على مشروع واقعي وقابل لحل  ",
          "tech": [
            "php",
            "html",
            "css",
            "javasecrpt",
            "sql"
          ],
          "image": "assets/img/upload-1fbf91ed.jpg"
        },
        {
          "name": "مشروع جديد",
          "short": "",
          "details": "",
          "tech": [
            "C#"
          ],
          "image": ""
        }
      ]
    },
    "services": {
      "title": "الخدمات التي أستطيع تقديمها",
      "subtitle": "حلول تقنية وإدارية متكاملة للأفراد والشركات — من الفكرة إلى التنفيذ.",
      "request": "طلب الخدمة",
      "items": [
        {
          "icon": "web",
          "name": "تصميم وتطوير المواقع الإلكترونية",
          "desc": "تصميم وبناء مواقع احترافية سريعة ومتجاوبة تناسب الاسم الشخصي أو الشركة."
        },
        {
          "icon": "code",
          "name": "برمجة وتطوير تطبيقات الويب",
          "desc": "تطوير تطبيقات ويب متكاملة بواجهات استخدام واضحة ووظائف فعّالة."
        },
        {
          "icon": "android",
          "name": "تصميم وتطوير تطبيقات Android",
          "desc": "بناء تطبيقات أندرويد عملية تعمل بسلاسة وتلبّي احتياجات المستخدم."
        },
        {
          "icon": "database",
          "name": "إنشاء وتصميم قواعد البيانات",
          "desc": "تصميم قواعد بيانات منظّمة وفعّالة باستخدام SQL مع إدارة البيانات وتكاملها."
        },
        {
          "icon": "building",
          "name": "تطوير أنظمة إدارة المؤسسات",
          "desc": "بناء أنظمة إدارية تنظّم العمليات والبيانات وتسهّل اتخاذ القرار."
        },
        {
          "icon": "analysis",
          "name": "تحليل وتصميم نظم المعلومات",
          "desc": "تحليل المتطلبات وتصميم نظم معلومات دقيقة تلبّي أهداف الجهة."
        },
        {
          "icon": "data",
          "name": "جمع البيانات وتنظيمها ومعالجتها",
          "desc": "جمع البيانات وتنظيمها ومعالجتها وتجهيزها للاستخدام والتحليل."
        },
        {
          "icon": "chart",
          "name": "تحليل البيانات وإعداد التقارير الإحصائية",
          "desc": "تحليل البيانات وإعداد تقارير إحصائية باستخدام SPSS وExcel."
        },
        {
          "icon": "office",
          "name": "تصميم وتنسيق المستندات والعروض",
          "desc": "إعداد وتنسيق المستندات والعروض الاحترافية باستخدام Microsoft Office."
        },
        {
          "icon": "repair",
          "name": "صيانة أجهزة الكمبيوتر والدعم الفني",
          "desc": "صيانة الأجهزة وتقديم الدعم الفني ومعالجة المشكلات التقنية."
        },
        {
          "icon": "manage",
          "name": "المساعدة في إدارة تقنية المعلومات",
          "desc": "المساعدة في تنظيم وإدارة الجوانب التقنية والمعلوماتية."
        },
        {
          "icon": "ai",
          "name": "حلول تقنية باستخدام الذكاء الاصطناعي",
          "desc": "تقديم حلول تقنية باستخدام أدوات الذكاء الاصطناعي لتحسين العمل."
        },
        {
          "icon": "security",
          "name": "أساسيات الحماية والأمن السيبراني",
          "desc": "المساعدة في أساسيات حماية الأنظمة والبيانات والممارسات الآمنة."
        },
        {
          "icon": "solution",
          "name": "حلول برمجية للمشكلات التقنية والإدارية",
          "desc": "تقديم حلول برمجية عملية للمشكلات التقنية والإدارية."
        }
      ]
    },
    "skills": {
      "title": "مهاراتي التقنية",
      "subtitle": "مجموعة من المهارات التقنية والإدارية التي أعتمد عليها في تنفيذ المشاريع.",
      "groups": [
        {
          "icon": "code",
          "title": "لغات البرمجة",
          "items": [
            "C++",
            "C#",
            "Java",
            "PHP",
            "Python"
          ]
        },
        {
          "icon": "web",
          "title": "تطوير الويب",
          "items": [
            "HTML",
            "CSS"
          ]
        },
        {
          "icon": "database",
          "title": "قواعد البيانات",
          "items": [
            "SQL",
            "إدارة قواعد البيانات"
          ]
        },
        {
          "icon": "android",
          "title": "تقنيات التطوير",
          "items": [
            "البرمجة كائنية التوجه OOP",
            "تطوير المواقع",
            "تطوير تطبيقات Android"
          ]
        },
        {
          "icon": "chart",
          "title": "تحليل البيانات",
          "items": [
            "SPSS",
            "Excel",
            "إعداد التقارير",
            "تحليل البيانات"
          ]
        },
        {
          "icon": "manage",
          "title": "المهارات الإدارية",
          "items": [
            "إدارة فرق العمل",
            "العمل الجماعي",
            "حل المشكلات",
            "إدارة المعلومات"
          ]
        },
        {
          "icon": "repair",
          "title": "مهارات أخرى",
          "items": [
            "صيانة الحاسوب",
            "Microsoft Office",
            "تنظيم ومعالجة البيانات"
          ]
        }
      ]
    },
    "qualifications": {
      "title": "مؤهلاتي وشهاداتي",
      "subtitle": "مسيرتي الأكاديمية وشهاداتي ودوراتي.",
      "eduTitle": "المؤهلات العلمية",
      "certTitle": "الشهادات والدورات",
      "edu": [
        {
          "title": "بكالوريوس نظم المعلومات الحاسوبية",
          "org": "جامعة عمران — كلية الهندسة وتقنية المعلومات",
          "meta": "خريج 2022 | المعدل 85%"
        },
        {
          "title": "الثانوية العامة — القسم العلمي",
          "org": "بمعدل 72.21%",
          "meta": ""
        }
      ],
      "certs": [
        {
          "title": "أربع شهادات شكر وتقدير",
          "org": "من اللجان العلمية",
          "meta": ""
        },
        {
          "title": "شهادتان حضوريتان في مجال PMP",
          "org": "إدارة المشاريع الاحترافية",
          "meta": ""
        },
        {
          "title": "دبلوم اللغة الإنجليزية النهائي",
          "org": "بمعدل 75%",
          "meta": ""
        },
        {
          "title": "شهادتان في صيانة الحاسوب",
          "org": "بمعدلي 90% و 88%",
          "meta": ""
        }
      ]
    },
    "why": {
      "title": "لماذا تختار العمل معي؟",
      "subtitle": "نقاط قوة أعتمد عليها في التعامل مع العملاء والشركات.",
      "items": [
        {
          "icon": "solution",
          "title": "القدرة على حل المشكلات",
          "desc": "معالجة التحديات التقنية والإدارية بحلول عملية قابلة للتطبيق."
        },
        {
          "icon": "thinking",
          "title": "التفكير التحليلي",
          "desc": "قدرة على تحليل المشكلات وتفكيكها للوصول إلى حلول منطقية فعّالة."
        },
        {
          "icon": "details",
          "title": "الاهتمام بالتفاصيل",
          "desc": "العناية بالتفاصيل الدقيقة لضمان جودة العمل وموثوقيته."
        },
        {
          "icon": "team",
          "title": "العمل ضمن فريق",
          "desc": "التعاون الفعّال والتواصل الجيد لتحقيق أهداف مشتركة."
        },
        {
          "icon": "manage",
          "title": "المهارات الإدارية والتنظيمية",
          "desc": "تنظيم المهام وإدارة الوقت والموارد بكفاءة."
        },
        {
          "icon": "learn",
          "title": "التطوير والتعلّم المستمر",
          "desc": "مواكبة الأدوات والتقنيات الحديثة وتطوير المهارات باستمرار."
        },
        {
          "icon": "hybrid",
          "title": "معرفة تقنية وإدارية",
          "desc": "الجمع بين الحسّ التقني والمعرفة الإدارية لفهم احتياجات العمل."
        }
      ]
    },
    "contact": {
      "title": "تواصل معي",
      "subtitle": "لطلب خدمة أو الاستفسار عن تنفيذ مشروع — يسعدني تواصلك.",
      "phoneLabel": "الهاتف والواتساب",
      "emailLabel": "البريد الإلكتروني",
      "whatsappBtn": "تواصل عبر واتساب",
      "emailBtn": "إرسال بريد إلكتروني",
      "form": {
        "name": "الاسم الكامل",
        "namePh": "اكتب اسمك",
        "email": "البريد الإلكتروني",
        "emailPh": "example@email.com",
        "subject": "الموضوع",
        "subjectPh": "موضوع الرسالة",
        "message": "الرسالة",
        "messagePh": "اكتب رسالتك أو تفاصيل مشروعك...",
        "submit": "إرسال الرسالة",
        "sending": "جارٍ الإرسال...",
        "success": "تم إرسال رسالتك بنجاح. شكراً لتواصلك!",
        "error": "تعذّر إرسال الرسالة حالياً. يمكنك التواصل عبر البريد أو واتساب.",
        "notConfigured": "نموذج التواصل غير مُفعّل بعد. يُرجى التواصل مباشرة عبر البريد الإلكتروني أو واتساب.",
        "errName": "الرجاء إدخال الاسم.",
        "errEmail": "الرجاء إدخال بريد إلكتروني صحيح.",
        "errSubject": "الرجاء إدخال الموضوع.",
        "errMessage": "الرجاء كتابة رسالة لا تقل عن 10 أحرف."
      }
    },
    "footer": {
      "rights": "جميع الحقوق محفوظة",
      "built": "موقع شخصي احترافي",
      "back": "إلى الأعلى"
    }
  },
  "en": {
    "dir": "ltr",
    "lang": "en",
    "brand": "Mohammed Anwar Omran",
    "nav": {
      "home": "Home",
      "about": "About",
      "projects": "Projects",
      "services": "Services",
      "skills": "Skills",
      "qualifications": "Qualifications",
      "contact": "Contact"
    },
    "hero": {
      "greeting": "Hello, I am",
      "name": "Mohammed Anwar Yahya Ahmed Omran",
      "title": "Computer Information Systems Graduate | Software Developer | Web & App Developer | Databases & IT Specialist",
      "tagline": "I turn ideas into practical software solutions — from requirements analysis and database design to building websites, apps, and providing technical support.",
      "buttons": {
        "projects": "Explore My Projects",
        "skills": "Discover My Skills",
        "contact": "Contact Me",
        "cv": "Download CV (PDF)"
      }
    },
    "about": {
      "title": "About Me",
      "lead": "A developer and IT specialist combining technical and managerial knowledge.",
      "paragraphs": [
        "I am Mohammed Anwar Yahya Ahmed Omran, a graduate of the Faculty of Engineering and Information Technology at Amran University, holding a Bachelor's degree in Computer Information Systems (2022) with an 85% grade. I am passionate about programming, systems development, data analysis, and databases, turning requirements into organized, scalable technical solutions.",
        "I have academic and practical experience in web and mobile app development, database design and management, and building information systems. I also have skills in management, teamwork, and problem-solving, with a constant drive for continuous learning and modern tools."
      ],
      "facts": [
        {
          "label": "University",
          "value": "Amran University"
        },
        {
          "label": "Faculty",
          "value": "Engineering & Information Technology"
        },
        {
          "label": "Major",
          "value": "Computer Information Systems"
        },
        {
          "label": "Graduation",
          "value": "2022"
        },
        {
          "label": "GPA",
          "value": "85%"
        }
      ]
    },
    "projects": {
      "title": "My Projects",
      "subtitle": "A set of projects reflecting my abilities in programming, systems, and app development.",
      "viewDetails": "View Details",
      "techLabel": "Tech",
      "items": [
        {
          "id": "airport",
          "name": "Amran International Airport",
          "tech": [
            "C#"
          ],
          "short": "A software system to organize and manage Amran International Airport operations using C#.",
          "details": "An academic project developed in C# to organize and manage the airport's operational processes and data. Detailed description, system interfaces, and real project images can be added here later.",
          "image": "assets/img/project-airport.jpg"
        },
        {
          "id": "traffic",
          "name": "Traffic Movement Detection",
          "tech": [
            "Python"
          ],
          "short": "A project to analyze and detect traffic movements using Python.",
          "details": "A Python project for handling and analyzing traffic movement data and detecting patterns. Mechanism explanation, processing stages, and results can be added here later.",
          "image": "assets/img/project-traffic.jpg"
        },
        {
          "id": "guardian",
          "name": "Smart Guardian App",
          "tech": [
            "Android"
          ],
          "short": "A smart Android app providing protection and monitoring via phone.",
          "details": "An Android app aiming to provide smart protection features. App interface images, functions, and features can be added here later.",
          "image": "assets/img/project-guardian.jpg"
        },
        {
          "id": "training",
          "name": "Training & Rehabilitation Center System",
          "tech": [
            "PHP"
          ],
          "short": "A training center management system, including certificate issuance.",
          "details": "A PHP-based system to manage trainees, courses, and training programs, including certificate issuance. Module details and system interfaces can be added here later.",
          "image": "assets/img/project-training.jpg"
        }
      ]
    },
    "services": {
      "title": "Services I Offer",
      "subtitle": "Integrated technical and managerial solutions for individuals and companies — from idea to delivery.",
      "request": "Request Service",
      "items": [
        {
          "icon": "web",
          "name": "Website Design & Development",
          "desc": "Designing and building fast, responsive professional websites for individuals or companies."
        },
        {
          "icon": "code",
          "name": "Web Application Development",
          "desc": "Developing full web applications with clear interfaces and effective functionality."
        },
        {
          "icon": "android",
          "name": "Android App Design & Development",
          "desc": "Building practical Android apps that run smoothly and meet user needs."
        },
        {
          "icon": "database",
          "name": "Database Design & Creation",
          "desc": "Designing organized, efficient databases using SQL, with data management and integration."
        },
        {
          "icon": "building",
          "name": "Enterprise Management Systems",
          "desc": "Building management systems that organize operations and data and support decisions."
        },
        {
          "icon": "analysis",
          "name": "Information Systems Analysis & Design",
          "desc": "Analyzing requirements and designing accurate information systems for your goals."
        },
        {
          "icon": "data",
          "name": "Data Collection, Organization & Processing",
          "desc": "Collecting, organizing, and processing data and preparing it for use and analysis."
        },
        {
          "icon": "chart",
          "name": "Data Analysis & Statistical Reports",
          "desc": "Analyzing data and preparing statistical reports using SPSS and Excel."
        },
        {
          "icon": "office",
          "name": "Document & Presentation Design",
          "desc": "Preparing and formatting professional documents and presentations using Microsoft Office."
        },
        {
          "icon": "repair",
          "name": "Computer Maintenance & Technical Support",
          "desc": "Maintaining devices, providing technical support, and resolving technical issues."
        },
        {
          "icon": "manage",
          "name": "IT Management Assistance",
          "desc": "Assisting in organizing and managing technical and information aspects."
        },
        {
          "icon": "ai",
          "name": "AI-Powered Technical Solutions",
          "desc": "Providing technical solutions using artificial intelligence tools to improve work."
        },
        {
          "icon": "security",
          "name": "Cybersecurity & Protection Basics",
          "desc": "Assisting with system and data protection basics and safe practices."
        },
        {
          "icon": "solution",
          "name": "Software Solutions for Tech & Admin Issues",
          "desc": "Providing practical software solutions for technical and administrative problems."
        }
      ]
    },
    "skills": {
      "title": "My Skills",
      "subtitle": "A set of technical and managerial skills I rely on to deliver projects.",
      "groups": [
        {
          "icon": "code",
          "title": "Programming Languages",
          "items": [
            "C++",
            "C#",
            "Java",
            "PHP",
            "Python"
          ]
        },
        {
          "icon": "web",
          "title": "Web Development",
          "items": [
            "HTML",
            "CSS"
          ]
        },
        {
          "icon": "database",
          "title": "Databases",
          "items": [
            "SQL",
            "Database Management"
          ]
        },
        {
          "icon": "android",
          "title": "Development Techniques",
          "items": [
            "OOP",
            "Web Development",
            "Android App Development"
          ]
        },
        {
          "icon": "chart",
          "title": "Data Analysis",
          "items": [
            "SPSS",
            "Excel",
            "Reporting",
            "Data Analysis"
          ]
        },
        {
          "icon": "manage",
          "title": "Managerial Skills",
          "items": [
            "Team Management",
            "Teamwork",
            "Problem Solving",
            "Information Management"
          ]
        },
        {
          "icon": "repair",
          "title": "Other Skills",
          "items": [
            "Computer Maintenance",
            "Microsoft Office",
            "Data Organization & Processing"
          ]
        }
      ]
    },
    "qualifications": {
      "title": "Qualifications & Certificates",
      "subtitle": "My academic journey, certificates, and courses.",
      "eduTitle": "Education",
      "certTitle": "Certificates & Courses",
      "edu": [
        {
          "title": "B.Sc. in Computer Information Systems",
          "org": "Amran University — Faculty of Engineering & IT",
          "meta": "Graduated 2022 | GPA 85%"
        },
        {
          "title": "General Secondary Certificate — Scientific",
          "org": "GPA 72.21%",
          "meta": ""
        }
      ],
      "certs": [
        {
          "title": "Four Appreciation Certificates",
          "org": "From scientific committees",
          "meta": ""
        },
        {
          "title": "Two Attendance Certificates in PMP",
          "org": "Project Management Professional",
          "meta": ""
        },
        {
          "title": "Final English Language Diploma",
          "org": "GPA 75%",
          "meta": ""
        },
        {
          "title": "Two Computer Maintenance Certificates",
          "org": "GPA 90% & 88%",
          "meta": ""
        }
      ]
    },
    "why": {
      "title": "Why Work With Me?",
      "subtitle": "Strengths I rely on when working with clients and companies.",
      "items": [
        {
          "icon": "thinking",
          "title": "Analytical Thinking",
          "desc": "Ability to analyze problems and break them down to reach logical, effective solutions."
        },
        {
          "icon": "solution",
          "title": "Problem Solving",
          "desc": "Tackling technical and administrative challenges with practical solutions."
        },
        {
          "icon": "details",
          "title": "Attention to Detail",
          "desc": "Caring about fine details to ensure quality and reliability."
        },
        {
          "icon": "team",
          "title": "Teamwork",
          "desc": "Effective collaboration and good communication to achieve shared goals."
        },
        {
          "icon": "manage",
          "title": "Managerial & Organizational Skills",
          "desc": "Organizing tasks and managing time and resources efficiently."
        },
        {
          "icon": "learn",
          "title": "Continuous Learning",
          "desc": "Keeping up with modern tools and technologies and developing skills continuously."
        },
        {
          "icon": "hybrid",
          "title": "Technical & Managerial Knowledge",
          "desc": "Combining technical sense with managerial knowledge to understand business needs."
        }
      ]
    },
    "contact": {
      "title": "Contact Me",
      "subtitle": "To request a service or inquire about a project — I'd be glad to hear from you.",
      "phoneLabel": "Phone & WhatsApp",
      "emailLabel": "Email",
      "whatsappBtn": "Chat on WhatsApp",
      "emailBtn": "Send Email",
      "form": {
        "name": "Full Name",
        "namePh": "Enter your name",
        "email": "Email",
        "emailPh": "example@email.com",
        "subject": "Subject",
        "subjectPh": "Message subject",
        "message": "Message",
        "messagePh": "Write your message or project details...",
        "submit": "Send Message",
        "sending": "Sending...",
        "success": "Your message has been sent successfully. Thank you!",
        "error": "Could not send the message now. Please contact via email or WhatsApp.",
        "notConfigured": "The contact form is not activated yet. Please contact directly via email or WhatsApp.",
        "errName": "Please enter your name.",
        "errEmail": "Please enter a valid email.",
        "errSubject": "Please enter the subject.",
        "errMessage": "Please write a message of at least 10 characters."
      }
    },
    "footer": {
      "rights": "All rights reserved",
      "built": "Professional personal website",
      "back": "Back to top"
    }
  }
};

window.SITE_DATA = SITE_DATA;
