# Quick Start Guide

## 🚀 Start the Application

### Easiest Method - One Command:
```powershell
cd A:\IR
.\start-fullstack.ps1
```

This will open:
- **Backend** at http://127.0.0.1:5000
- **Frontend** at http://localhost:3000

## 📝 What's Installed

### Backend (Python)
- ✅ Flask + Flask-CORS
- ✅ scikit-learn
- ✅ sentence-transformers (upgraded to latest)
- ✅ PyPDF2 + PyMuPDF
- ✅ NLTK
- ✅ rank-bm25
- ✅ All dependencies

### Frontend (Next.js)
- ✅ React 18.3
- ✅ Next.js 14.2
- ✅ Tailwind CSS
- ✅ Framer Motion
- ✅ Radix UI components
- ✅ 414 packages installed

## 📂 Project Structure on Disk A

```
A:\IR\
├── app.py                    # Flask backend server
├── requirements.txt          # Python dependencies
├── config.json              # Search engine config
├── start-fullstack.ps1      # Quick start script
├── data\
│   └── docs\                # 👈 Put your PDF/TXT files here
│       ├── AIML\
│       ├── ARAS\
│       ├── DBMS\
│       ├── IR\
│       └── ...
├── frontend\
│   ├── package.json
│   ├── src\
│   │   ├── app\
│   │   └── components\
│   └── ...
├── templates\               # Flask HTML templates
├── static\                  # CSS/JS assets
└── extracted_images\        # PDF image cache
```

## 🔍 How to Use

1. **Add Documents**: Place PDF or TXT files in `A:\IR\data\docs\` subfolders
2. **Start Servers**: Run `.\start-fullstack.ps1`
3. **Open Browser**: Go to http://localhost:3000
4. **Search**: Type your query and select search method
5. **Filter**: Optionally filter by folder/file

## 🛠️ Manual Commands

### Start Backend Only:
```powershell
cd A:\IR
python app.py
```

### Start Frontend Only:
```powershell
cd A:\IR\frontend
npm run dev
```

### Rebuild Frontend:
```powershell
cd A:\IR\frontend
npm run build
npm start
```

## 💡 Tips

- First run will take longer (downloads AI models)
- Documents are cached for faster subsequent loads
- Use "Reload Documents" button after adding new files
- Semantic search requires internet on first run (downloads model)

## ✅ Everything is Ready!

Your Smart Notes Search Engine is fully configured on **Disk A (A:\IR)**

Just run `.\start-fullstack.ps1` and start searching! 🎉
