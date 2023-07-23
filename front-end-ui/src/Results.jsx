import React from 'react';

function Results({ results }) {
  return (
    <div>
      <h2>Results:</h2>
      <ul>
        {results.map((result, index) => (
          <li key={index}>
            <div>Job Requirements: {result.job_requirements}</div>
            <div>Candidate: {result.candidate}</div>
            <div>Similarity: {result.similarity}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Results;