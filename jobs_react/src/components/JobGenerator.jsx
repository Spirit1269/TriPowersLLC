import { useState } from 'react';
import axios from 'axios';

export default function JobGenerator({ onNewJob }) {
  const [title, setTitle]               = useState('');
  const [location, setLocation]         = useState('');
  const [prompt, setPrompt]             = useState('');
  const [jobDraft, setJobDraft]         = useState(null);
  const [error, setError]               = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setError('');
    setJobDraft(null);
    setIsGenerating(true);

    // We give the AI a prompt that references the user’s title & location
    const systemMsg = 'You are an assistant that outputs valid JSON only.';
    const userMsg   = `
Generate the following fields for a job:
- description (string)
- responsibilities (array of strings)
- requirements (array of strings)
- salaryRange (string)

The role is "${title}" located in "${location}".  
Keep tone professional and concise.  
Return ONLY JSON.
`;

    try {
      // Build a single prompt string combining title, location, and any extra context
      const fullPrompt = `
          Role: ${title}
          Location: ${location}
          Context: ${prompt}

          Generate JSON with description, responsibilities, requirements, salaryRange.
          `;

                const aiRes = await axios.post(
                  '/api/jobdescription',
                  { prompt: fullPrompt }
                );

      // Parse the AI’s JSON
      // 1) get the raw blob
      let jsonText = aiRes.data.description?.trim() || '';
      if (!jsonText) {
        setError('No description returned from AI.');
        return;
      }

      // 2) strip code fences if present
      if (jsonText.startsWith('```')) {
        // split lines and drop the first and last
        const lines = jsonText.split('\n');
        // remove ```json or ``` at start
        lines.shift();
        // remove trailing ```
        if (lines[lines.length - 1].trim().startsWith('```')) {
          lines.pop();
        }
        jsonText = lines.join('\n');
      }

      // 3) now try parse
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (err) {
        console.error('Failed to parse cleaned JSON:', jsonText, err);
        setError('AI returned malformed JSON. See console.');
        return;
      }

      // Combine user + AI content
      const fullJob = {
        title,
        location,
        description       : parsed.description,
        responsibilities  : parsed.responsibilities.join('; '),
        requirements      : parsed.requirements.join('; '),
        salaryRange       : `${parsed.salaryRangeMin}-${parsed.salaryRangeMax}`
      };
      setJobDraft(fullJob);

      // 4) persist to your backend
    await axios.post('/api/jobs', fullJob, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    onNewJob();

  } catch (e) {
    console.error('JobDescription error payload:', e.response?.data);
    setError(
      e.response?.data?.error ||
      e.message ||
      'Failed to generate job info.'
    );
  } finally {
    setIsGenerating(false);
  }
};

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">AI Job Description Generator</h2>

      {/* User-entered title */}
      <input
        type="text"
        className="w-full border p-2 rounded"
        placeholder="Job Title (e.g. Front-End Engineer)"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      {/* User-entered location */}
      <input
        type="text"
        className="w-full border p-2 rounded"
        placeholder="Location (e.g. Austin, TX)"
        value={location}
        onChange={e => setLocation(e.target.value)}
      />

      {/* Optional extra prompt */}
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Additional context for AI (e.g. company culture, seniority)…"
        rows={2}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleGenerate}
        disabled={!title || !location || isGenerating}
      >
        {isGenerating ? 'Generating…' : 'Generate & Save'}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {jobDraft && (
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="text-lg font-bold">{jobDraft.title}</h3>
          <p className="italic text-sm">{jobDraft.location}</p>
          <p className="mt-2">{jobDraft.description}</p>

          <h4 className="mt-4 font-semibold">Responsibilities</h4>
          <ul className="list-disc list-inside">
            {jobDraft.responsibilities.map((r,i) => <li key={i}>{r}</li>)}
          </ul>

          <h4 className="mt-4 font-semibold">Requirements</h4>
          <ul className="list-disc list-inside">
            {jobDraft.requirements.map((r,i) => <li key={i}>{r}</li>)}
          </ul>

          <p className="mt-4">
            <strong>Salary Range:</strong> {jobDraft.salaryRange}
          </p>
        </div>
      )}
    </div>
  );
}
