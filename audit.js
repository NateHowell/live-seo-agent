// The code for your server function
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const urlToAudit = event.queryStringParameters.url;

    if (!urlToAudit) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'URL parameter is required.' }),
        };
    }

    try {
        const response = await fetch(urlToAudit);
        if (!response.ok) {
            throw new Error(`Website returned a ${response.status} status.`);
        }
        const htmlContent = await response.text();

        return {
            statusCode: 200,
            body: JSON.stringify({ html: htmlContent }),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};