import React, { useState } from 'react';
import './App.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';

// Hack way of doing environment variables, normally you'd want to inject the config into a ci artifact post deployment
const baseUrl = window.location.origin.includes('localhost') ? 'http://localhost:5000' : 'https://yresumechecker.azurewebsites.net'


function App() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [jobRequirements, setJobRequirements] = useState('');

  function handleFile(event) {
    setFiles(event.target.files);
    console.log(event.target.files);
  }

  function handleJobRequirements(event) {
    setJobRequirements(event.target.value);
    console.log(event.target.value);
  }

  function handleJobRequirementsUpload(event) {
    event.preventDefault();
    toast.promise(
      fetch(`${baseUrl}/JobRequirements`, {
        method: 'POST',
        body: JSON.stringify({ job_requirements: jobRequirements }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }), {
      pending: 'Finding candidates...',
      success: 'Found candidates!',
    })
      .then((response) => response.json())
      .then((results) => {
        console.log('Success:', results);
        setResults(results);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function handleUpload(event) {
    event.preventDefault();
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }
    toast.promise(
      fetch(`${baseUrl}/Upload`, {
        method: 'POST',
        body: formData,
      }),
      {
        pending: 'Uploading...',
        success: 'Uploaded resume!',
      })
      .then((response) => response.json())
      .then((results) => {
        console.log('Success:', results);
        setResults(results);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  return (
    <div>
      <div>
        <h1>Upload your job requirements</h1>
        <div>
          <form onSubmit={handleUpload}>
            <input
              type="file"
              multiple={true}
              placeholder="Placeholder"
              id="file"
              name="file"
              onChange={handleFile}
            />
            <Button type="submit" variant="contained" color="primary">
              Upload
            </Button>
          </form>
        </div>
      </div>

      <div>
        <h1>Find the best candidate</h1>
        <form onSubmit={handleJobRequirementsUpload}>
          <TextField
            placeholder="Enter your job requirements"
            id="job_requirements"
            name="job_requirements"
            value={jobRequirements}
            onChange={handleJobRequirements}
          />
          <Button type="submit" style={{ marginLeft: 10 }} variant="contained" color="primary">
            Find candidates
          </Button>
        </form>

        {results && results.full_list && results.full_list.length > 0 && (
          <div>
            <h2>Results:</h2>
            {results.best_candidate &&
            <h2>Best candidate is {results.best_candidate}</h2>
            }
            <ul>
              {results.full_list.map((result, index) => (
                <li key={index}>
                  <div>Candidate: {result.candidate}</div>
                  <div>Similarity: {result.similarity}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;