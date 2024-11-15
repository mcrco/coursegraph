from bs4 import BeautifulSoup
import requests
import os
import json

in_filename = "cs.html"
url = "https://www.cms.caltech.edu/academics/courses"
if not os.path.exists(in_filename):
    response = requests.get(url)

    if response.status_code == 200:
        html_content = response.text
        with open(in_filename, "w", encoding="utf-8") as f:
            f.write(html_content)

        print("CS course website downloaded and saved as mypage.html")
    else:
        print(f"Failed to retrieve the CS courses. Status code: {response.status_code}")

with open('./cs.html', 'r') as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')

entries = soup.find_all("div", class_='course-description2')
courses = {}
name_prereq_map = {}
for div in entries:
    id = div.get("id")
    course_id = div.find("span", class_="course-description2__label").get_text(strip=True)
    name = div.find("span", class_="course-description2__title").get_text(strip=True)
    link = url + div.find("a", class_="course-description2__link").get("href")

    units = ""
    terms = ""
    units_terms = div.find("div", class_="course-description2__units-and-terms").find_all("span")
    for item in units_terms:
        item_text = item.get_text(strip=True)
        if 'unit' in item_text:
            units = item_text
        else:
            terms = item_text

    try:
        description = div.find("div", class_="course-description2__description").find("p").get_text(strip=True)
    except:
        print(course_id, 'does not have any description.')
        description=""

    offered = not "Not offered 2024-2025"

    try:
        instructor_div = div.find("div", class_="course-description2__instructors")
        for span in instructor_div.find_all("span"):
            span.decompose()
        instructors = instructor_div.get_text(strip=True)
    except:
        print(course_id, 'does not have any instructors.')
        instructors=""

    # feed prereq text into llm and have it output array of ids lol
    try:
        prereq_text = div.find("div", class_="course-description2__prerequisites").get_text(strip=True)
    except: 
        print(course_id, 'does not have any prereqs.')
        prereq_text = ""

    courses[id] = {
        "id": id,
        "course_id": course_id,
        "name": name,
        "units": units,
        "terms": terms,
        "description": description,
        "offered": offered,
        "instructors": instructors,
        "link": link,
        "prereq_text": prereq_text,
    }

    name_prereq_map[id] = {
        "name": name,
        "prereq_text": prereq_text
    }


# save courses as they are
np_filename = "cs_prereqtext.json"
with open(os.path.join("json", np_filename), 'w', encoding='utf-8') as json_file:
    json.dump(courses, json_file, indent=4)
print("CS courses (prereqs as text) saved to",  np_filename)

# save courses with only prereq text (smaller file for llm)
np_filename = "cs_only_prereqtext.json"
with open(os.path.join("json", np_filename), 'w', encoding='utf-8') as json_file:
    json.dump(name_prereq_map, json_file, indent=4)
print("CS courses with only prereq text information saved to",  np_filename)

# combine courses with llm generated prereqs from external file if possible
prereq_filename = "cs_prereqs.json"
if os.path.exists(os.path.join("json", prereq_filename)):
    with open(os.path.join("json", prereq_filename), 'r') as json_file:
        prereqs = json.load(json_file)
    for key in courses:
        if key in prereqs:
            courses[key]["prereqs"] = prereqs[key]["prereqs"]
            if courses[key]["id"] in courses[key]["prereqs"]:
                courses[key]["prereqs"].remove(courses[key]["id"])
    out_filename = "cs.json"
    with open(os.path.join("json", out_filename), 'w', encoding='utf-8') as json_file:
        json.dump(courses, json_file, indent=4)
    print(f"CS courses (with prereq arrays) saved to '{out_filename}'")

