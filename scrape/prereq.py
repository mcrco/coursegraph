import json
import re

def extract_prereqs(prereq_text, course_ids):
    # Skip if empty prereq text
    if not prereq_text:
        return []
    
    # Lowercase for consistent matching
    text = prereq_text.lower()
    
    # Initialize empty prereq list
    prereqs = []
    
    # Create a mapping of course names to course IDs
    course_name_to_id = {}
    for course_id in course_ids:
        # Strip any section letters (a,b,c) from course ID
        base_course = re.sub(r'-[abc]+$', '', course_id)
        course_name_to_id[base_course.lower()] = base_course
        # Also add the full ID including section
        course_name_to_id[course_id.lower()] = course_id
    
    # Look for common prerequisite patterns
    patterns = [
        r'prerequisites?: .*?((?:(?:ma|cs|ee|acm|cds|ids|cms|bi|be|ph|ae|me|ce|ch|chem|est|mede)/?\s*(?:\d+(?:-[abc])?))(?:(?:,| or| and) (?:ma|cs|ee|acm|cds|ids|cms|bi|be|ph|ae|me|ce|ch|chem|est|mede)/?\s*(?:\d+(?:-[abc])?))*)']
    
    for pattern in patterns:
        matches = re.finditer(pattern, text)
        for match in matches:
            prereq_section = match.group(1)
            # Split into individual course codes
            individual_courses = re.findall(r'((?:ma|cs|ee|acm|cds|ids|cms|bi|be|ph|ae|me|ce|ch|chem|est|mede)/?\s*\d+(?:-[abc])?)', prereq_section.lower())

            for course in individual_courses:
                # Standardize format (remove spaces, make lowercase)
                clean_course = re.sub(r'\s+', '', course)
                # Check if this course exists in our mapping
                if clean_course in course_name_to_id:
                    prereqs.append(course_name_to_id[clean_course])
    
    return list(set(prereqs))  # Remove duplicates

def process_prereqs(data):
    # Create new dict with added prereqs field
    processed_data = {}
    
    # Get list of all course IDs
    course_ids = list(data.keys())
    
    # Process each course
    for course_id, course_info in data.items():
        # Copy existing info
        new_course_info = course_info.copy()
        # Add prereqs field
        new_course_info['prereqs'] = extract_prereqs(course_info['prereq_text'], course_ids)
        processed_data[course_id] = new_course_info
    
    return processed_data

# Read input JSON
with open('prereq.json', 'r') as f:
    data = json.load(f)

# Process the data
processed_data = process_prereqs(data)

# Pretty print the result
print(json.dumps(processed_data, indent=2))
