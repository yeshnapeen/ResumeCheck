import PyPDF2 
import re
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

uploads_folder_name = "uploads"



# Using environment variable if set or defaulting to localhost
front_end_url = os.environ.get('FrontEndUrl') or 'http://localhost:5173'
cors = CORS(app, origins=[ front_end_url ])

# Set the path where uploaded files will be saved
uploads = os.path.abspath('uploads')
app.config['uploads'] = uploads 

if not os.path.exists(uploads):
    os.makedirs(uploads)

# Define the allowed file extensions for uploads
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(filename):
    try:
        with open(os.path.join(app.config['uploads'], filename), 'rb') as file:
            reader = PyPDF2.PdfReader(file)
          
          
            text = ""
            for page in reader.pages:
                text += page.extract_text()
          
            return text
    except Exception as e:
        print(f'Error extracting text from PDF: {e}')
        return None

def preprocess_text(text):
    tokens = tokens = re.findall(r"[\w']+", text.lower())
    return tokens

def calculate_similarity(job_requirements, candidate_qualifications):
        job_requirements = preprocess_text(job_requirements)
        candidate_qualifications = preprocess_text(candidate_qualifications)

        common_tokens = set(job_requirements) & set(candidate_qualifications)
        similarity = len(common_tokens) / len(job_requirements)

        return similarity


@app.route('/')
def hello_world():
    return f'Weclome our front end is here {front_end_url}'

@app.route('/JobRequirements', methods=['POST'])
def get_best_candidate():
    # Get the job requirements
    print(request.get_json())
    job_requirements = request.get_json()['job_requirements']
   
    # Initialize variables for tracking the best candidate
    full_list_similarities = []
    best_candidate = None
    best_similarity = 0
    
    # Loop through the uploaded candidate files
    for file in os.listdir(app.config['uploads']):
        if allowed_file(file):
            # Extract text from the candidate's resume
            candidate_resume_text = extract_text_from_pdf(os.path.join(app.config['uploads'], file))
            
            # Calculate the similarity between the job requirements and the candidate's resume
            if candidate_resume_text:
                similarity = calculate_similarity(job_requirements, candidate_resume_text)
                full_list_similarities.append({'candidate': file, 'similarity': similarity})
                # Update the best candidate if the current candidate has a higher similarity score
                if similarity > best_similarity:
                    best_candidate = file
                    best_similarity = similarity
    
    return jsonify({'best_candidate': best_candidate, 'full_list': full_list_similarities})


@app.route('/Upload', methods=['POST'])
def upload_file():
    results = []
    files = request.files.getlist('file')

    for file in files:
        if not file:
            results.append({'error': 'No file uploaded'})
            continue
        
        if not allowed_file(file.filename):
            results.append({'error': 'Invalid file extension'})
            continue
        
        file.save(os.path.join(app.config['uploads'], file.filename))
        print(f'File {file.filename} uploaded successfully')

    response = {}

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)