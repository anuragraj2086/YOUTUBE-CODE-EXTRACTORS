export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method POST required' });
  }

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  let videoId;
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname.includes('youtube.com')) videoId = urlObj.searchParams.get('v');
    else if (hostname.includes('youtu.be')) videoId = urlObj.pathname.slice(1);
    if (!videoId) throw new Error('Could not extract video ID');
  } catch (e) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    // 1. Fetch transcript using the proxy
    const transcriptRes = await fetch(`https://youtube-transcript.ai/transcript/${videoId}.txt`);
    if (!transcriptRes.ok) throw new Error('Transcript not found or video has no captions.');
    
    const rawText = await transcriptRes.text();
    
    // Clean up the proxy metadata at the top of the text
    const lines = rawText.split('\n');
    const cleanedLines = lines.filter(line => !line.startsWith('#') && !line.startsWith('Source video') && !line.startsWith('Interactive version') && !line.startsWith('Other available languages') && !line.startsWith('To request'));
    const transcript = cleanedLines.join(' ').replace(/\[\d+:\d+\]/g, '').replace(/\s+/g, ' ').trim();

    // 2. Send transcript to Gemini API
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing in Vercel Environment Variables.');

    const promptText = `
    You are an expert Data Structures and Algorithms instructor. 
    Analyze this tutorial transcript and generate highly structured study notes suitable for a logbook of newly learned concepts and challenging problems.
    Use C++ for the code implementations. If the video specifically focuses on Go or another language, adapt accordingly, but default to C++.
    
    Format the output strictly as follows:
    ### 1. Problem Statement
    ### 2. Brute Force Approach (Explanation, Time/Space Complexity, Code)
    ### 3. Better Approach (Explanation, Time/Space Complexity, Code)
    ### 4. Optimal Approach (Explanation, Time/Space Complexity, Code)
    ### 5. Dry Run (Step-by-step execution of optimal code)
    ### 6. Common Mistakes (Highlight potential logical errors or edge cases to watch out for during timed practice)
    
    Transcript: ${transcript.substring(0, 30000)}
    `;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    if (!geminiRes.ok) {
       const errText = await geminiRes.text();
       throw new Error('Gemini API failed: ' + errText);
    }
    
    const geminiData = await geminiRes.json();
    const finalNotes = geminiData.candidates[0].content.parts[0].text;

    res.status(200).json({
      code: finalNotes,
      filename: `DSA_Notes_${videoId}.txt`,
      language: 'markdown',
      title: `DSA Notes: ${videoId}`
    });

  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: `Process failed: ${error.message}` });
  }
}