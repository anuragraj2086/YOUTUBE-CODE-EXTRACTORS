# Deploying YouTube Code Extractor to Vercel

## Step-by-Step Guide

### Prerequisites
1. [Node.js](https://nodejs.org/) installed (v14 or later)
2. [Vercel CLI](https://vercel.com/docs/cli) installed: `npm i -g vercel`
3. A [Vercel account](https://vercel.com/signup) (free tier works)

### Step 1: Prepare Your Project
Make sure your project structure looks like this:
```
youtube-code-extractor/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── api/
│   └── extract.js
├── vercel.json
├── package.json
└── README.md
```

### Step 2: Install Dependencies
In your project directory:
```bash
npm install
```

### Step 3: Test Locally (Optional but Recommended)
```bash
vercel dev
```
This will start a local development server at http://localhost:3000 where you can test the extractor.

### Step 4: Deploy to Vercel
When you're ready to deploy:
```bash
vercel --prod
```

You'll be prompted to:
1. Choose a scope (your personal account or team)
2. Confirm the project name (will default to "youtube-code-extractor")
3. Confirm the directory (should be current directory)
4. Answer other configuration questions (usually just press enter for defaults)

### Step 5: Get Your Deployment URL
After deployment completes, Vercel will provide you with a URL like:
```
https://youtube-code-extractor.vercel.app
```

### Step 6: Use Your Deployed Tool
1. Visit your Vercel URL
2. Paste any YouTube tutorial URL
3. Click "Extract Code"
4. View/download the extracted code with explanations

## 📱 Making It Accessible From Anywhere

### Option 1: Bookmark & Home Screen Shortcut
- **On Desktop**: Bookmark the Vercel URL in your browser
- **On Mobile**:
  - iOS: Open in Safari → Share → "Add to Home Screen"
  - Android: Open in Chrome → Menu → "Add to Home screen"

### Option 2: Create a Browser Shortcut
Create a bookmark with this JavaScript as the URL (replace `YOUR_VERCEL_URL`):
```javascript
javascript:(function(){const url=prompt('Enter YouTube URL:');if(url){window.location='https://YOUR_VERCEL_URL/?url='+encodeURIComponent(url);}})()
```

## 🔧 Troubleshooting

### "Function Process Exit Code 1" Error
This usually means:
1. Missing dependencies - ensure `youtube-caption-extractor` is in package.json
2. API route issues - check that api/export.js exists and exports correctly
3. Vercel build issues - check vercel.json configuration

### No Subtitles Available
Some videos don't have auto-generated captions. Try:
- Videos from educational channels (they often have captions)
- Videos with "CC" button visible on YouTube player
- Different videos on the same topic

### Rate Limiting
YouTube may limit requests if you make too many in a short time. The tool includes basic error handling for this.

## 🔄 Updating Your Deployment
To update your deployed version:
1. Make changes locally
2. Commit to Git (if connected to GitHub repo)
3. Run `vercel --prod` again
   OR if connected to GitHub:
   - Push to main branch
   - Vercel will auto-deploy

## 💡 Pro Tips
1. **Test with simple videos first** - try a basic "Hello World" tutorial
2. **Check the network tab** in browser dev tools if extraction fails
3. **The tool works best** with videos where instructors speak code clearly
4. **Always verify extracted code** - treat it as a starting point, not final code

## 🎯 Example Workflow
1. Find a YouTube tutorial: "Java Arrays Explained"
2. Copy URL: https://www.youtube.com/watch?v=example123
3. Paste into your deployed YouTube Code Extractor
4. Get back: Well-commented Java array code with explanations
5. Save to your learning repository: `java_arrays_from_youtube.txt`
6. Run and modify the code to reinforce learning

Your YouTube Code Extractor is now ready to use from any device, anywhere!