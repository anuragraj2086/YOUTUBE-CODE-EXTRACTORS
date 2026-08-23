export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method POST required' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Extract video ID from YouTube URL
  let videoId;
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    } else if (hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    }
    if (!videoId) {
      throw new Error('Could not extract video ID');
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    // We bypass the Vercel IP block by using a free public transcript API
    const response = await fetch(`https://youtube-transcript.ai/transcript/${videoId}.txt`);
    
    if (!response.ok) {
      throw new Error('Transcript not found or video has no captions.');
    }
    
    const rawText = await response.text();

    // The API returns text grouped in paragraphs with timestamps. 
    // We split it into lines and strip the timestamps to match our extraction logic.
    const lines = rawText.split('\n');
    const subtitles = lines.map(line => ({
      text: line.replace(/\[\d+:\d+\]/g, '').trim()
    })).filter(item => item.text.length > 0);

    const dummyTitle = `YouTube_Video_${videoId}`;
    const dummyDesc = '';

    // Process subtitles to extract code and explanations
    const language = guessLanguage(dummyTitle, dummyDesc);
    const blocks = extractCodeBlocks(subtitles, language);
    const formattedCode = formatOutput({ title: dummyTitle, id: videoId, description: dummyDesc }, blocks, language);

    res.status(200).json({
      code: formattedCode,
      filename: `youtube_code_${videoId}_${language}.txt`,
      language: language,
      title: dummyTitle
    });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: `Failed to fetch transcript: ${error.message}` });
  }
}

// Helper functions for language detection and code extraction
function guessLanguage(title, description) {
  const text = (title + ' ' + description).toLowerCase();

  const languageKeywords = {
    java: ['java', 'jdk', 'jvm', 'spring', 'android'],
    python: ['python', 'django', 'flask', 'pandas', 'numpy'],
    javascript: ['javascript', 'js', 'node', 'react', 'vue', 'angular'],
    cpp: ['c++', 'cpp', 'c plus plus'],
    c: [' c ', 'c programming'],
    csharp: ['c#', 'c sharp', '.net'],
    ruby: ['ruby', 'rails'],
    php: ['php', 'laravel'],
    go: ['golang', 'go language'],
    rust: ['rust', 'cargo'],
    swift: ['swift', 'ios'],
    kotlin: ['kotlin', 'android']
  };

  for (const [lang, keywords] of Object.entries(languageKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return lang;
    }
  }

  return 'python'; 
}

function getLanguageKeywords(language) {
  const keywords = {
    java: [
      'class', 'public', 'private', 'protected', 'static', 'void', 'int', 'String',
      'boolean', 'double', 'float', 'long', 'char', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'break', 'continue', 'return', 'new', 'this', 'super',
      'extends', 'implements', 'interface', 'enum', 'final', 'try', 'catch', 'throw',
      'throws', 'import', 'package', 'assert', 'instanceof', 'native', 'strictfp',
      'transient', 'volatile', 'const', 'goto'
    ],
    python: [
      'def', 'class', 'if', 'else', 'elif', 'for', 'while', 'in', 'is', 'not',
      'and', 'or', 'return', 'yield', 'from', 'import', 'as', 'with', 'assert',
      'break', 'continue', 'pass', 'del', 'raise', 'try', 'except', 'finally',
      'lambda', 'global', 'nonlocal', 'True', 'False', 'None'
    ],
    javascript: [
      'var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally',
      'throw', 'typeof', 'instanceof', 'new', 'this', 'super', 'class', 'extends',
      'import', 'export', 'from', 'as', 'await', 'async', 'static', 'get', 'set',
      'null', 'undefined', 'true', 'false'
    ],
    cpp: [
      'int', 'float', 'double', 'char', 'bool', 'void', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'break', 'continue', 'return', 'goto', 'typedef',
      'extern', 'static', 'const', 'volatile', 'signed', 'unsigned', 'short', 'long',
      'class', 'struct', 'union', 'enum', 'public', 'private', 'protected', 'friend',
      'virtual', 'override', 'final', 'delete', 'new', 'try', 'catch', 'throw',
      'namespace', 'using', 'template', 'typename'
    ],
    c: [
      'int', 'float', 'double', 'char', 'bool', 'void', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'break', 'continue', 'return', 'goto', 'typedef',
      'extern', 'static', 'const', 'volatile', 'signed', 'unsigned', 'short', 'long',
      'struct', 'union', 'enum'
    ]
  };

  return new Set(keywords[language] || []);
}

function looksLikeCode(line, language, threshold = 2) {
  const keywords = getLanguageKeywords(language);
  const symbols = ['(', ')', '{', '}', '[', ']', ';', ',', '.', '+', '-', '*', '/', '%',
                   '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '&', '|', '^',
                   '~', '<<', '>>', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^='];

  const lineLower = line.toLowerCase();

  let keywordCount = 0;
  for (const keyword of keywords) {
    const pattern = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
    if (pattern.test(lineLower)) {
      keywordCount++;
    }
  }

  let symbolCount = 0;
  for (const symbol of symbols) {
    const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = line.match(new RegExp(escaped, 'g'));
    symbolCount += matches ? matches.length : 0;
  }

  return (keywordCount + symbolCount) >= threshold;
}

function extractCodeBlocks(subtitles, language) {
  const blocks = [];
  let currentExplanations = [];
  let currentCode = [];

  for (const subtitle of subtitles) {
    const text = subtitle.text;

    if (looksLikeCode(text, language)) {
      if (currentExplanations.length > 0 || currentCode.length > 0) {
        if (currentExplanations.length > 0 && currentCode.length === 0) {
          blocks.push({ explanations: currentExplanations, code: [] });
          currentExplanations = [];
        }
        currentCode.push(text);
      } else {
        currentCode.push(text);
      }
    } else {
      if (currentCode.length > 0) {
        blocks.push({ explanations: currentExplanations, code: currentCode });
        currentExplanations = [text];
        currentCode = [];
      } else {
        currentExplanations.push(text);
      }
    }
  }

  if (currentExplanations.length > 0 || currentCode.length > 0) {
    blocks.push({ explanations: currentExplanations, code: currentCode });
  }

  return blocks;
}

function formatOutput(videoInfo, blocks, language) {
  const title = videoInfo.title || 'Unknown Video';
  const videoId = videoInfo.id || 'unknown';
  const description = videoInfo.description || '';

  const output = [];
  output.push(`# Code extracted from: ${title}`);
  output.push(`# Source: https://www.youtube.com/watch?v=${videoId}`);
  output.push(`# Language: ${language}`);
  output.push('');
  output.push('# =============================================================================');
  output.push('# EXTRACTED CODE WITH EXPLANATIONS');
  output.push('# =============================================================================');
  output.push('');

  let indent = '    '; 

  if (language === 'java') {
    output.push('public class Main {');
    output.push('    public static void main(String[] args) {');
    indent = '        ';
  } else if (language === 'python') {
    output.push('def main():');
    indent = '    ';
  } else if (language === 'javascript') {
    output.push('function main() {');
    indent = '    ';
  } else if (language === 'cpp' || language === 'c') {
    output.push('#include <iostream>');
    output.push('using namespace std;');
    output.push('int main() {');
    indent = '    ';
  } else {
    output.push('# Main program');
    indent = '    ';
  }

  output.push('');

  for (const block of blocks) {
    const { explanations, code } = block;
    for (const explanation of explanations) {
      const clean = explanation.trim();
      if (clean) {
        output.push(`${indent}# ${clean}`);
      }
    }
    for (const codeLine of code) {
      const clean = codeLine.trim();
      if (clean) {
        output.push(`${indent}${clean}`);
      }
    }
    if (explanations.length > 0 && code.length > 0) {
      output.push('');
      output.push(`${indent}# ---`);
      output.push('');
    }
  }

  if (language === 'java') {
    output.push('    }');
    output.push('}');
  } else if (language === 'python') {
    output.push('');
    output.push('if __name__ == \'__main__\':');
    output.push('    main()');
  } else if (language === 'javascript' || language === 'cpp' || language === 'c') {
    output.push('    return 0;');
    output.push('}');
  } else {
    output.push('');
    output.push('# End of program');
  }

  output.push('');
  output.push('# =============================================================================');
  output.push('# NOTES:');
  output.push('# 1. This extraction is heuristic-based and may not be perfect.');
  output.push('# 2. Code accuracy depends on how verbatim the speaker spoke the code.');
  output.push('# 3. For best results, use videos where the instructor types/code speaks code clearly.');
  output.push('# 4. Consider manual verification and adjustment.');
  output.push('# =============================================================================');

  return output.join('\n');
}