 .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            font-size: 1.5rem;
            font-weight: bold;
            line-height: 1;
        }
        .score-text {
            font-size: 0.8rem;
            font-weight: 500;
            margin-top: 4px;
        }
        
        .pdf-render-state {
            background: white !important;
            padding: 2rem;
            font-size: 16px;
        }
        .pdf-render-state h2, .pdf-render-state h3, .pdf-render-state div, .pdf-render-state li, .pdf-render-state strong, .pdf-render-state span {
            color: black !important;
        }
        .pdf-render-state h2 {
            font-size: 26px;
        }
        .pdf-render-state h3 {
             font-size: 20px;
        }
    </style>
</head>
<body class="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <div class="container mx-auto px-4 py-8 md:py-16">
        <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-10">
            <div class="text-center mb-8">
                <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">AI-Powered SEO Audit</h1>
                <p class="text-gray-600 dark:text-gray-400 mt-2">Get a free, automated SEO report for any website.</p>
            </div>

            <div class="space-y-6">
                <div>
                    <label for="url-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website URL</label>
                    <input type="url" id="url-input" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition duration-300" placeholder="https://example.com">
                    <p id="url-error" class="text-red-500 text-sm mt-1 hidden"></p>
                </div>
                <div>
                    <label for="email-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Email</label>
                    <input type="email" id="email-input" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition duration-300" placeholder="you@example.com">
                    <p id="email-error" class="text-red-500 text-sm mt-1 hidden"></p>
                </div>
                <button id="audit-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center">
                    <span id="button-text">Start Audit</span>
                    <div id="loader" class="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6 ml-3 hidden"></div>
                </button>
            </div>

            <div id="report-container" class="mt-10 hidden">
                 <div class="flex justify-between items-center mb-4 border-b pb-2">
                     <h2 class="text-2xl font-bold text-gray-800 dark:text-white">SEO Audit Report</h2>
                     <button id="pdf-button" class="hidden bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg inline-flex items-center">
                        <svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span>Download PDF</span>
                    </button>
                 </div>
                 <div id="score-container" class="hidden justify-center my-6"></div>
                 <div id="report-content" class="space-y-6"></div>
            </div>

             <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center hidden">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-w-sm mx-auto">
                    <h3 class="text-xl font-bold text-center mb-4" id="modal-title">Success!</h3>
                    <p class="text-center text-gray-600 dark:text-gray-400" id="modal-message"></p>
                    <button id="modal-close" class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const urlInput = document.getElementById('url-input');
        const emailInput = document.getElementById('email-input');
        const auditButton = document.getElementById('audit-button');
        const buttonText = document.getElementById('button-text');
        const loader = document.getElementById('loader');
        const reportContainer = document.getElementById('report-container');
        const reportContent = document.getElementById('report-content');
        const scoreContainer = document.getElementById('score-container');
        const pdfButton = document.getElementById('pdf-button');
        const urlError = document.getElementById('url-error');
        const emailError = document.getElementById('email-error');
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const modalClose = document.getElementById('modal-close');
        
        const { jsPDF } = window.jspdf;

        // --- Validation ---
        function validateInputs() {
            let isValid = true;
            urlError.classList.add('hidden');
            emailError.classList.add('hidden');

            if (!urlInput.value || !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(urlInput.value)) {
                urlError.textContent = 'Please enter a valid website URL.';
                urlError.classList.remove('hidden');
                isValid = false;
            }

            if (!emailInput.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
                emailError.textContent = 'Please enter a valid email address.';
                emailError.classList.remove('hidden');
                isValid = false;
            }
            return isValid;
        }

        // --- UI Control ---
        function showLoading(isLoading) {
            if (isLoading) {
                buttonText.textContent = 'Auditing...';
                loader.classList.remove('hidden');
                auditButton.disabled = true;
                auditButton.classList.add('cursor-not-allowed', 'opacity-75');
            } else {
                buttonText.textContent = 'Start Audit';
                loader.classList.add('hidden');
                auditButton.disabled = false;
                auditButton.classList.remove('cursor-not-allowed', 'opacity-75');
            }
        }
        
        function showModal(title, message) {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modal.classList.remove('hidden');
        }

        modalClose.addEventListener('click', () => {
             modal.classList.add('hidden');
        });

        // --- Main Audit Logic ---
        auditButton.addEventListener('click', async () => {
            if (!validateInputs()) { return; }
            
            showLoading(true);
            reportContainer.classList.add('hidden');
            scoreContainer.classList.add('hidden');
            pdfButton.classList.add('hidden');
            reportContent.innerHTML = '';
            scoreContainer.innerHTML = '';

            let url = urlInput.value;
            const email = emailInput.value;
            if (!url.startsWith('http://') && !url.startsWith('https://')) { url = 'https://' + url; }

            try {
                // This URL points to our new serverless function
                const serverlessUrl = `/.netlify/functions/audit?url=${encodeURIComponent(url)}`;
                
                const response = await fetch(serverlessUrl);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'An unknown error occurred on the server.');
                }
                
                const htmlContent = data.html;
                if (!htmlContent) { throw new Error("Could not fetch website content via the server."); }

                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                
                const images = Array.from(doc.querySelectorAll('img'));
                const hasViewportTag = doc.querySelector('meta[name="viewport"]') !== null;

                const auditData = {
                    title: doc.querySelector('title')?.innerText || 'Not found',
                    description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'Not found',
                    h1s: Array.from(doc.querySelectorAll('h1')).map(h1 => h1.innerText),
                    imagesCount: images.length,
                    missingAltTags: images.filter(img => !img.alt || img.alt.trim() === '').length,
                    hasViewportTag: hasViewportTag,
                    url: url,
                };

                const fullReportText = await generateAIReport(auditData);
                displayReport(fullReportText);
                
                console.log("Simulating sending email to:", email);
                showModal('Success!', `Your SEO audit for ${url} has been generated.`);

            } catch (error) {
                console.error('Audit Error:', error);
                const errorMessage = `Failed to audit website. ${error.message}`;
                showModal('Error', errorMessage);
            } finally {
                showLoading(false);
            }
        });
        
        async function generateAIReport(auditData) {
            const prompt = `
                You are an expert SEO consultant. Analyze the following SEO data for the website: ${auditData.url}.

                **SEO Audit Data:**
                - Meta Title: "${auditData.title}" (Length: ${auditData.title.length})
                - Meta Description: "${auditData.description}" (Length: ${auditData.description.length})
                - H1 Headings Count: ${auditData.h1s.length}
                - Mobile-Friendly (Viewport Tag): ${auditData.hasViewportTag ? 'Yes' : 'No'}
                - Image SEO: Found ${auditData.imagesCount} images. ${auditData.missingAltTags} are missing 'alt' text.

                **Your Task:**
                1.  **Calculate a Score:** On the very first line, provide an "Overall SEO Score" out of 100 based on all the data. The format MUST be exactly: "Overall SEO Score: [score]/100".
                2.  **Write the Report:** After the score, generate a concise, easy-to-understand SEO report in markdown format with the following sections:
                    - **Overall Summary:** A brief summary of the site's SEO health.
                    - **What's Good:** A bulleted list of positive findings.
                    - **Areas for Improvement:** A bulleted list of the most critical issues. For each, explain WHY it's important and give a clear recommendation. Use best practices (Title: 50-60 chars, Desc: 150-160 chars, H1: one, Alt text: all images, Viewport: present).
                    - **Next Steps:** A concluding sentence.

                Keep the tone professional and encouraging. Prioritize the most impactful recommendations.
            `;

            const apiKey = ""; // Injected by environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) { throw new Error(`API Error: ${response.status} ${await response.text()}`); }
                const result = await response.json();
                if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                    return result.candidates[0].content.parts[0].text;
                } else {
                    throw new Error("Invalid AI response structure.");
                }
            } catch (error) {
                console.error('Error calling Gemini API:', error);
                throw new Error(`AI analysis failed. ${error.message}`);
            }
        }

        function displayReport(fullReportText) {
            const lines = fullReportText.split('\n');
            const scoreLine = lines.shift(); 
            const markdownReport = lines.join('\n').trim();

            const scoreMatch = scoreLine.match(/(\d+)\/100/);
            if (scoreMatch) {
                const score = parseInt(scoreMatch[1], 10);
                let scoreColor = 'bg-red-500';
                if (score >= 80) scoreColor = 'bg-green-500';
                else if (score >= 50) scoreColor = 'bg-yellow-500';

                scoreContainer.innerHTML = `<div class="score-circle ${scoreColor} text-white"><span>${score}</span><span class="score-text">/ 100</span></div>`;
                scoreContainer.classList.remove('hidden');
                scoreContainer.classList.add('flex');
            }

            let html = markdownReport
                .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">$1</h3>')
                .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 border-b pb-2 text-gray-800 dark:text-white">$1</h2>')
                .replace(/^\* (.*$)/gim, '<li>$1</li>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>')
                .replace(/<br><br>/g, '<br>')
                .replace(/<li>/g, '<li class="ml-5 list-disc">')
                .replace(/(<h[23]>.*<\/h[23]>)<br>/g, '$1')
                .replace(/<\/li><br>/g, '</li>');

            reportContent.innerHTML = `<div class="prose dark:prose-invert max-w-none">${html}</div>`;
            reportContainer.classList.remove('hidden');
            pdfButton.classList.remove('hidden');
        }

        pdfButton.addEventListener('click', () => {
             const reportElement = document.getElementById('report-container');
             const url = urlInput.value || 'report';
             const filename = `SEO-Report-${url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}.pdf`;

            reportElement.classList.add('pdf-render-state');

            html2canvas(reportElement, { 
                scale: 3,
                useCORS: true 
            }).then(canvas => {
                reportElement.classList.remove('pdf-render-state');
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(filename);
            });
        });

    </script>
</body>
</html>
