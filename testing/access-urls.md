# PardnaLink Server Access URLs

## ✅ WORKING URLS:
- **Health Check**: http://localhost:4000/v1/health
- **API Base**: http://localhost:4000/v1/

## ❌ NOT WORKING:
- External IP access (EC2 server down)
- Domain names (no DNS setup)

## 🔧 TO ACCESS FROM BROWSER:
1. Open: http://localhost:4000/v1/health
2. Should see: `{"ok":true}`

## 📝 CURRENT STATUS:
- Server: ✅ Running on port 4000
- Routes: ❌ New auth routes need server restart
- External: ❌ EC2 instance stopped