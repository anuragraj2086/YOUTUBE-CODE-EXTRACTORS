# YouTube Code Extractor

A web tool that extracts code and explanations from YouTube tutorial videos and presents them as well-commented code.

## Features

- Extracts code snippets from YouTube video captions/subtitles
- Provides line-by-line explanations as comments in the extracted code
- Automatically detects programming language from video title/description
- Formats output as runnable code with explanatory comments
- Deployable to Vercel for free, global access
- Works as a PWA (Progressive Web App) - can be installed on mobile/home screen

## How It Works

1. **URL Processing**: Extracts YouTube video ID from various URL formats
2. **Caption Fetching**: Gets video captions (auto-generated English subtitles) using youtube-caption-extractor
3. **Language Detection**: Guesses programming language from title/description
4. **Code Extraction**: Uses heuristics to identify code-like lines in captions
5. **Block Formation**: Groups consecutive code lines with their preceding explanations
6. **Output Formatting**: Formats everything as commented code in the detected language

## Local Development

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Run development server
vercel dev
# Visit http://localhost:3000
```

## Deployment to Vercel

### Step-by-Step

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Follow prompts**:
   - Scope: Choose your personal account
   - Project Name: youtube-code-extractor (or press enter for default)
   - Directory: ./youtube-code-extractor (or press enter for current)
   - Other settings: Press enter for defaults

5. **Get your URL** after deployment completes

## Usage

1. Visit your deployed Vercel URL
2. Paste any YouTube tutorial URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. Click "Extract Code"
4. View the extracted code with explanations
5. Click "Download Code" to save as a text file

## Making It Accessible From Anywhere

### Option 1: Bookmark & Home Screen Shortcut
- **Desktop**: Bookmark your Vercel URL
- **Mobile**:
  - iOS: Safari → Share → "Add to Home Screen"
  - Android: Chrome → Menu → "Add to Home screen"

### Option 2: Create a Quick Access Bookmarklet
Create a bookmark with this URL (replace `YOUR_VERCEL_URL`):
```
javascript:(function(){const url=prompt('Enter YouTube URL:');if(url){window.location='https://YOUR_VERCEL_URL/?url='+encodeURIComponent(url);}})()
```

## Example Use Cases

### Learning Java Variables
1. Find a YouTube tutorial on "Java Variables and Data Types"
2. Paste URL into extractor
3. Get back: Well-commented Java code like:
   ```java
   public class Main {
       public static void main(String[] args) {
           # This declares an integer variable named age
           int age = 25;
           # This stores a person's name as text
           String name = "John Doe";
           # Boolean flag for status
           boolean isActive = true;
       }
   }
   ```

### Learning DSA Algorithms
1. Find a lecture on "Binary Search Algorithm"
2. Paste URL into extractor
3. Get back: Code with explanations including:
   - Brute force approach explanation
   - Optimized binary search implementation
   - Dry run example as comments
   - Edge case discussions
   - Complexity analysis notes

## Technical Details

### Dependencies
- `youtube-caption-extractor`: For fetching YouTube video captions
- `vercel`: For serverless deployment

### Supported Languages (Auto-detected)
- Java
- Python
- JavaScript
- C/C++
- C#
- Ruby
- PHP
- Go
- Rust
- Swift
- Kotlin
- Defaults to Python if unclear

## Limitations & Best Practices

### Works Best When
- Instructor speaks code clearly and verbally types syntax
- Video has clear audio and auto-generated captions available
- Educational content with structured explanations

### May Struggle With
- Videos where code is only shown, not spoken
- Heavy accent or poor audio quality
- Videos without captions
- Complex pseudocode not easily transcribed

### Tips for Better Results
1. Use videos from reputable educational channels
2. Look for videos with "tutorial", "explained", "walkthrough" in title
3. For algorithm videos, instructors often speak logic clearly
4. Always verify and test extracted code
5. Treat output as a starting point for learning, not final code

## Troubleshooting

### "Failed to process video"
- Video may not have captions available
- Try a different video on the same topic
- Check if YouTube video is region-restricted or age-gated

### Extraction seems inaccurate
- Remember this is heuristic-based
- Use output as study aid, not production code
- Try videos with clearer instruction

### Vercel deployment issues
- Check vercel.json configuration
- Ensure api/extract.js exports correctly
- Check Vercel function logs for specific errors

---

Happy learning! Extract code from tutorials effortlessly and focus on understanding rather than transcription.