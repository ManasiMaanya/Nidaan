import json
import boto3
import os
from datetime import datetime

# Initialize AWS clients
translate_client = boto3.client('translate', region_name='ap-south-1')
bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')

def lambda_handler(event, context):
    """
    Main Lambda handler for all API endpoints
    """
    
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    }
    
    # Handle preflight requests
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    # Route to appropriate handler
    path = event.get('path', '')
    method = event['httpMethod']
    
    try:
        if path == '/translate' and method == 'POST':
            return handle_translate(event, headers)
        elif path == '/simplify' and method == 'POST':
            return handle_simplify(event, headers)
        elif path == '/simplify-and-translate' and method == 'POST':
            return handle_simplify_and_translate(event, headers)
        elif path == '/health' and method == 'GET':
            return handle_health(headers)
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Endpoint not found'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }


def handle_translate(event, headers):
    """
    Translate text using Amazon Translate
    """
    body = json.loads(event['body'])
    text = body.get('text')
    target_language = body.get('target_language', 'hi')
    
    if not text:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Text is required'})
        }
    
    # Don't translate if target is English
    if target_language == 'en':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'translated_text': text,
                'source_language': 'en',
                'target_language': 'en'
            })
        }
    
    # Translate using Amazon Translate
    response = translate_client.translate_text(
        Text=text,
        SourceLanguageCode='en',
        TargetLanguageCode=target_language
    )
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'translated_text': response['TranslatedText'],
            'source_language': 'en',
            'target_language': target_language
        })
    }


def handle_simplify(event, headers):
    """
    Simplify medical text using Amazon Bedrock (Claude 3 Haiku)
    """
    body = json.loads(event['body'])
    medical_text = body.get('medical_text')
    
    if not medical_text:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Medical text is required'})
        }
    
    # Create prompt for Claude
    prompt = f"""You are a medical translator that converts complex medical reports into simple, easy-to-understand language for patients in India.

Rules:
- Use simple everyday words (6th-grade reading level)
- Avoid medical jargon
- Explain in 2-3 short sentences
- Focus on what the patient needs to know
- Be clear and reassuring

Medical Report:
{medical_text}

Simplified Explanation:"""
    
    # Prepare request for Bedrock
    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 300,
        "temperature": 0.7,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }
    
    # Call Bedrock
    response = bedrock_client.invoke_model(
        modelId='anthropic.claude-3-haiku-20240307-v1:0',
        contentType='application/json',
        accept='application/json',
        body=json.dumps(request_body)
    )
    
    # Parse response
    response_body = json.loads(response['body'].read())
    simplified_text = response_body['content'][0]['text'].strip()
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'simplified_text': simplified_text,
            'model': 'claude-3-haiku'
        })
    }


def handle_simplify_and_translate(event, headers):
    """
    Simplify medical text and translate to target language
    """
    body = json.loads(event['body'])
    medical_text = body.get('medical_text')
    target_language = body.get('target_language', 'en')
    
    if not medical_text:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Medical text is required'})
        }
    
    # Step 1: Simplify using Bedrock
    simplify_response = handle_simplify(
        {'body': json.dumps({'medical_text': medical_text})}, 
        headers
    )
    simplify_data = json.loads(simplify_response['body'])
    simplified_text = simplify_data['simplified_text']
    
    # Step 2: Translate if not English
    if target_language == 'en':
        translated_text = simplified_text
    else:
        translate_response = handle_translate(
            {'body': json.dumps({'text': simplified_text, 'target_language': target_language})},
            headers
        )
        translate_data = json.loads(translate_response['body'])
        translated_text = translate_data['translated_text']
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'simplified_text': simplified_text,
            'translated_text': translated_text,
            'language': target_language
        })
    }


def handle_health(headers):
    """
    Health check endpoint
    """
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'services': {
                'amazon_translate': 'configured',
                'amazon_bedrock': 'configured'
            }
        })
    }