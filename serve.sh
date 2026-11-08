#!/usr/bin/env bash
# تشغيل معاينة الموقع محلياً بشكل مستقل عن الجلسة (لا يتوقف عند إغلاق الطرفية).
# الاستخدام:  ./serve.sh [PORT]     (المنفذ الافتراضي 12000)
PORT="${1:-12000}"
DIR="$(cd "$(dirname "$0")" && pwd)"

# إيقاف أي نسخة سابقة على نفس المنفذ
pkill -f "http.server ${PORT}" 2>/dev/null
sleep 1

cd "$DIR" || exit 1
setsid nohup python3 -m http.server "$PORT" --bind 0.0.0.0 > /tmp/webserver.log 2>&1 < /dev/null &
sleep 1

if curl -sf -o /dev/null "http://localhost:${PORT}/"; then
  echo "✓ يعمل الآن على المنفذ ${PORT}"
  echo "  الموقع:        http://localhost:${PORT}/"
  echo "  لوحة التحكم:   http://localhost:${PORT}/admin.html"
else
  echo "✗ فشل التشغيل — راجع /tmp/webserver.log"
  exit 1
fi
