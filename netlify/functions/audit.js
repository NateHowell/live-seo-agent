const fetch = require('node-fetch');
const { DOMParser } = require('linkedom');

exports.handler = async function(event) {
  const { url } = event.queryStringParameters;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'A "url" query parameter is required.' }),
    };
  }
   if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key is not configured on the server. Please add it to your Netlify site settings.' }),
    };
  }

  try {
    // 1. Fetch the target website's HTML
    const siteResponse = await fetch(url);
    if (!siteResponse.ok) {
      throw new Error(`The website returned a ${siteResponse.status} status.`);
    }
    const html = await siteResponse.text();

    // 2. Parse the HTML and gather SEO data
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const images = Array.from(doc.querySelectorAll('img'));
    const auditData = {
      title: doc.querySelector('title')?.innerText || 'Not found',
      description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'Not found',
      h1s: Array.from(doc.querySelectorAll('h1')).map(h1 => h1.innerText),
      imagesCount: images.length,
      missingAltTags: images.filter(img => !img.alt || img.alt.trim() === '').length,
      hasViewportTag: doc.querySelector('meta[name="viewport"]') !== null,
      url: url,
    };
    
    // 3. Create the prompt and call the Gemini API
    const prompt = `
        You are an expert SEO consultant. Analyze the following SEO data for the website: ${auditData.url}.
        **SEO Audit Data:**
        - Meta Title: "${auditData.title}" (Length: ${auditData.title.length})
        - Meta Description: "${auditData.description}" (Length: ${auditData.description.length})
        - H1 Headings Count: ${auditData.h1s.length}
        - Mobile-Friendly (Viewport Tag): ${auditData.hasViewportTag ? 'Yes' : 'No'}
        - Image SEO: Found ${auditData.imagesCount} images. ${auditData.missingAltTags} are missing 'alt' text.

        **Your Task:**
        1.  **Calculate a Score:** On the very first line, provide an "Overall SEO Score" out of 100. Format: "Overall SEO Score: [score]/100".
        2.  **Write the Report:** Generate a markdown report with sections: Overall Summary, What's Good, Areas for Improvement, Next Steps.
        Keep it professional and easy to understand.`;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    const geminiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.text();
        throw new Error(`API Error: ${geminiResponse.status}. ${errorBody}`);
    }
    
    const result = await geminiResponse.json();
    const reportText = result.candidates[0].content.parts[0].text;
    
    // 4. Send the final report back to the webpage
    return {
      statusCode: 200,
      body: JSON.stringify({ report: reportText }),
    };

  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server process failed. Reason: ${error.message}` }),
    };
  }
};
