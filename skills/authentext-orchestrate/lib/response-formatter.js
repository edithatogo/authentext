/**
 * Response Formatter
 * Enforces structured output for humanizer assessments.
 */

function formatAssessment(assessment, format = 'json') {
    if (format === 'xml') {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<assessment>';
        xml += `\n  <domain>${assessment.domain}</domain>`;
        xml += `\n  <score>${assessment.score}</score>`;
        xml += '\n  <issues>';
        assessment.issues.forEach(issue => {
            xml += `\n    <issue severity="${issue.severity}">`;
            xml += `\n      <description>${issue.description}</description>`;
            xml += `\n      <suggestion>${issue.suggestion}</suggestion>`;
            xml += '\n    </issue>';
        });
        xml += '\n  </issues>';
        xml += '\n</assessment>';
        return xml;
    }

    // Default to JSON
    return JSON.stringify({
        status: 'success',
        data: assessment
    }, null, 2);
}

module.exports = {
    formatAssessment
};
