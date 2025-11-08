"""
YouTube Mind Map Generator
A Flask web application that creates editable mind maps from YouTube videos
"""

from flask import Flask, render_template, request, jsonify, send_file
from youtube_transcript_api import YouTubeTranscriptApi
import re
import json
import os
from io import BytesIO
import xml.etree.ElementTree as ET
from xml.dom import minidom
from datetime import datetime
import openai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Configure OpenAI (optional - falls back to basic extraction if not available)
openai.api_key = os.getenv('OPENAI_API_KEY', '')

def extract_video_id(url):
    """Extract video ID from various YouTube URL formats"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_transcript(video_id):
    """Get transcript from YouTube video"""
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = ' '.join([item['text'] for item in transcript_list])
        return transcript_text
    except Exception as e:
        raise Exception(f"Could not retrieve transcript: {str(e)}")

def extract_concepts_ai(transcript):
    """Use OpenAI to extract key concepts and create hierarchical structure"""
    if not openai.api_key:
        return extract_concepts_basic(transcript)

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """You are an expert at analyzing video content and creating mind maps.
                Extract key concepts from the transcript and organize them hierarchically (2-3 levels max).
                Return ONLY a valid JSON object with this structure:
                {
                  "topic": "Main video topic",
                  "children": [
                    {
                      "topic": "Main concept 1",
                      "children": [
                        {"topic": "Sub-concept 1.1"},
                        {"topic": "Sub-concept 1.2"}
                      ]
                    }
                  ]
                }
                Limit to 5-7 main concepts, each with 2-4 sub-concepts maximum."""},
                {"role": "user", "content": f"Extract key concepts from this transcript:\n\n{transcript[:4000]}"}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        content = response.choices[0].message.content.strip()
        # Remove markdown code blocks if present
        content = re.sub(r'^```json\s*|\s*```$', '', content, flags=re.MULTILINE)
        return json.loads(content)
    except Exception as e:
        print(f"AI extraction failed: {e}, falling back to basic extraction")
        return extract_concepts_basic(transcript)

def extract_concepts_basic(transcript):
    """Basic concept extraction without AI (fallback method)"""
    # Split into sentences
    sentences = re.split(r'[.!?]+', transcript)

    # Extract key phrases (simple approach - look for repeated important words)
    words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', transcript)
    word_freq = {}
    for word in words:
        if len(word) > 3:  # Skip short words
            word_freq[word] = word_freq.get(word, 0) + 1

    # Get top concepts
    top_concepts = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:6]

    # Create simple hierarchy
    mind_map = {
        "topic": "Video Key Concepts",
        "children": []
    }

    for concept, freq in top_concepts:
        # Find sentences containing this concept
        related = [s.strip() for s in sentences if concept in s][:3]
        children = []

        for rel in related:
            # Extract a short phrase
            words = rel.split()[:5]
            if words:
                children.append({"topic": ' '.join(words) + "..."})

        mind_map["children"].append({
            "topic": concept,
            "children": children[:3] if children else []
        })

    return mind_map

def generate_freemind_xml(mind_map):
    """Generate FreeMind (.mm) format XML"""
    def create_node(parent, data, is_root=False):
        node = ET.SubElement(parent, 'node')
        node.set('TEXT', data['topic'])

        if is_root:
            node.set('CREATED', str(int(datetime.now().timestamp() * 1000)))
            node.set('MODIFIED', str(int(datetime.now().timestamp() * 1000)))

        if 'children' in data and data['children']:
            for child in data['children']:
                create_node(node, child)

        return node

    root = ET.Element('map')
    root.set('version', '1.0.1')
    create_node(root, mind_map, is_root=True)

    # Pretty print
    xml_str = ET.tostring(root, encoding='unicode')
    dom = minidom.parseString(xml_str)
    return dom.toprettyxml(indent='  ')

def generate_xmind_content(mind_map):
    """Generate XMind-compatible JSON structure"""
    def convert_node(data):
        node = {
            "title": data['topic'],
            "id": f"node_{hash(data['topic']) & 0xFFFFFF}"
        }

        if 'children' in data and data['children']:
            node['children'] = {
                "attached": [convert_node(child) for child in data['children']]
            }

        return node

    xmind_data = [{
        "rootTopic": convert_node(mind_map),
        "title": "YouTube Mind Map"
    }]

    return json.dumps(xmind_data, indent=2)

def generate_opml(mind_map):
    """Generate OPML format (compatible with many mind map tools)"""
    def create_outline(parent, data):
        outline = ET.SubElement(parent, 'outline')
        outline.set('text', data['topic'])

        if 'children' in data and data['children']:
            for child in data['children']:
                create_outline(outline, child)

        return outline

    root = ET.Element('opml')
    root.set('version', '2.0')

    head = ET.SubElement(root, 'head')
    title = ET.SubElement(head, 'title')
    title.text = 'YouTube Mind Map'

    body = ET.SubElement(root, 'body')
    create_outline(body, mind_map)

    xml_str = ET.tostring(root, encoding='unicode')
    dom = minidom.parseString(xml_str)
    return dom.toprettyxml(indent='  ')

@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')

@app.route('/api/generate', methods=['POST'])
def generate_mindmap():
    """Generate mind map from YouTube URL"""
    try:
        data = request.get_json()
        youtube_url = data.get('url', '').strip()

        if not youtube_url:
            return jsonify({'error': 'YouTube URL is required'}), 400

        # Extract video ID
        video_id = extract_video_id(youtube_url)
        if not video_id:
            return jsonify({'error': 'Invalid YouTube URL'}), 400

        # Get transcript
        transcript = get_transcript(video_id)

        # Extract concepts
        mind_map = extract_concepts_ai(transcript)

        return jsonify({
            'success': True,
            'mindmap': mind_map,
            'video_id': video_id
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/<format>', methods=['POST'])
def export_mindmap(format):
    """Export mind map in various formats"""
    try:
        data = request.get_json()
        mind_map = data.get('mindmap')

        if not mind_map:
            return jsonify({'error': 'Mind map data is required'}), 400

        if format == 'freemind':
            content = generate_freemind_xml(mind_map)
            mimetype = 'application/xml'
            filename = 'mindmap.mm'
        elif format == 'xmind':
            content = generate_xmind_content(mind_map)
            mimetype = 'application/json'
            filename = 'mindmap.xmind.json'
        elif format == 'opml':
            content = generate_opml(mind_map)
            mimetype = 'application/xml'
            filename = 'mindmap.opml'
        else:
            return jsonify({'error': 'Invalid format'}), 400

        # Create BytesIO object
        buffer = BytesIO()
        buffer.write(content.encode('utf-8'))
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
