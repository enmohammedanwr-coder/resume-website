"""Generate a professional CV PDF (Arabic, RTL) for Mohammed Anwar Omran."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import arabic_reshaper
from bidi.algorithm import get_display

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "assets", "cv", "Mohammed-Anwar-CV.pdf")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

FONT_R = os.path.join(BASE, "assets", "fonts", "NotoSansArabic.ttf")
FONT_B = os.path.join(BASE, "assets", "fonts", "NotoSansArabic.ttf")
pdfmetrics.registerFont(TTFont("Taj", FONT_R))
pdfmetrics.registerFont(TTFont("TajB", FONT_B))

def ar(t):
    return get_display(arabic_reshaper.reshape(t))

BLUE = colors.HexColor("#2f7cf6")
SKY = colors.HexColor("#0e7490")
DARK = colors.HexColor("#0b1b3a")
GREY = colors.HexColor("#3f5077")

W, H = A4
c = canvas.Canvas(OUT, pagesize=A4)

# ---- Header band ----
c.setFillColor(colors.HexColor("#0b1224"))
c.rect(0, H - 46*mm, W, 46*mm, fill=1, stroke=0)
c.setFillColor(BLUE)
c.rect(0, H - 48*mm, W, 2*mm, fill=1, stroke=0)

c.setFillColor(colors.white)
c.setFont("TajB", 24)
c.drawRightString(W - 18*mm, H - 20*mm, ar("محمد أنور يحي أحمد عمران"))
c.setFont("Taj", 12)
c.setFillColor(colors.HexColor("#a9b7d4"))
c.drawRightString(W - 18*mm, H - 30*mm, ar("خريج نظم معلومات حاسوبية | مطور برمجيات ومواقع وتطبيقات | متخصص قواعد البيانات وتقنية المعلومات"))
c.setFont("Taj", 10)
c.setFillColor(colors.HexColor("#cfe0ff"))
c.drawRightString(W - 18*mm, H - 39*mm, "m25647859@gmail.com  |  En.mohammedanwr@gmail.com  |  +967774931730")

y = H - 60*mm

def section_title(text):
    global y
    c.setFillColor(BLUE)
    c.roundRect(W - 18*mm - 4*mm, y - 1*mm, 3.5*mm, 7*mm, 1.5*mm, fill=1, stroke=0)
    c.setFillColor(DARK)
    c.setFont("TajB", 14)
    c.drawRightString(W - 18*mm, y, ar(text))
    y -= 3*mm
    c.setStrokeColor(colors.HexColor("#d7e3fb"))
    c.setLineWidth(1)
    c.line(18*mm, y, W - 18*mm, y)
    y -= 7*mm

def bullet(text, bold=False):
    global y
    c.setFillColor(SKY)
    c.circle(W - 18*mm - 1.5*mm, y + 1.2*mm, 1.1*mm, fill=1, stroke=0)
    c.setFillColor(GREY if not bold else DARK)
    c.setFont("TajB" if bold else "Taj", 11)
    c.drawRightString(W - 24*mm, y, ar(text))
    y -= 6.5*mm

def paragraph(text):
    global y
    c.setFillColor(GREY)
    c.setFont("Taj", 10.5)
    words = ar(text).split()
    line = ""
    maxw = W - 40*mm
    for w in words:
        test = (line + " " + w).strip()
        if c.stringWidth(test, "Taj", 10.5) > maxw:
            c.drawRightString(W - 18*mm, y, line)
            y -= 6*mm
            line = w
        else:
            line = test
    if line:
        c.drawRightString(W - 18*mm, y, line)
        y -= 6*mm
    y -= 2*mm

# ---- About ----
section_title("نبذة تعريفية")
paragraph("خريج كلية الهندسة وتقنية المعلومات بجامعة عمران، حاصل على بكالوريوس في نظم المعلومات الحاسوبية عام 2022 بمعدل 85%. مهتم بالبرمجة وتطوير الأنظمة وتحليل البيانات وقواعد البيانات، وتطوير المواقع وتطبيقات الهاتف، مع مهارات في الإدارة والعمل الجماعي وحل المشكلات.")

# ---- Education ----
section_title("المؤهلات العلمية")
bullet("بكالوريوس نظم المعلومات الحاسوبية — جامعة عمران، كلية الهندسة وتقنية المعلومات", bold=True)
bullet("سنة التخرج: 2022 | المعدل: 85%")
bullet("الثانوية العامة — القسم العلمي بمعدل 72.21%")

# ---- Skills ----
section_title("المهارات")
bullet("لغات البرمجة: C++, C#, Java, PHP, Python")
bullet("تطوير الويب: HTML, CSS")
bullet("قواعد البيانات: SQL وإدارة قواعد البيانات")
bullet("تقنيات التطوير: البرمجة كائنية التوجه OOP، تطوير المواقع، تطبيقات Android")
bullet("تحليل البيانات: SPSS، Excel، إعداد التقارير الإحصائية")
bullet("المهارات الإدارية: إدارة فرق العمل، العمل الجماعي، حل المشكلات")
bullet("مهارات أخرى: صيانة الحاسوب، Microsoft Office، تنظيم ومعالجة البيانات")

# ---- Projects ----
section_title("المشاريع")
bullet("مطار عمران الدولي — تطوير بلغة C#", bold=True)
bullet("كشف حركات المرور — تطوير بلغة Python", bold=True)
bullet("تطبيق الحارس الذكي — منصة Android", bold=True)
bullet("نظام مركز التدريب والتأهيل (يتضمن إصدار الشهادات) — تطوير بلغة PHP", bold=True)

# ---- Certificates ----
section_title("الشهادات والدورات")
bullet("أربع شهادات شكر وتقدير من اللجان العلمية")
bullet("شهادتان حضوريتان في مجال PMP")
bullet("دبلوم اللغة الإنجليزية النهائي بمعدل 75%")
bullet("شهادتان في صيانة الحاسوب بمعدلي 90% و 88%")

# ---- Services ----
section_title("الخدمات")
for s in [
    "تصميم وتطوير المواقع الإلكترونية وتطبيقات الويب",
    "تصميم وتطوير تطبيقات Android",
    "إنشاء وتصميم قواعد البيانات وتحليل وتصميم نظم المعلومات",
    "تطوير أنظمة إدارة المؤسسات",
    "تحليل البيانات وإعداد التقارير الإحصائية (SPSS, Excel)",
    "صيانة أجهزة الكمبيوتر والدعم الفني وإدارة تقنية المعلومات",
]:
    bullet(s)

# ---- Footer ----
c.setFillColor(colors.HexColor("#7d8bad"))
c.setFont("Taj", 8.5)
c.drawCentredString(W/2, 12*mm, "Mohammed Anwar Yahya Ahmed Omran  •  " + "+967774931730")

c.showPage()
c.save()
print("wrote", OUT)
