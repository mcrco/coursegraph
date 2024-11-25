import re

# Array of strings
strings = ["apple", "banana", "cherry"]

# Escape each string to handle special characters
escaped_strings = [re.escape(s) for s in strings]

# Build the regex pattern
pattern = rf"^(?:{'|'.join(escaped_strings)})(?:/(?:{'|'.join(escaped_strings)}))*$"

# Compile the regex
regex = re.compile(pattern)

# Example usage
test_strings = [
    "apple",
    "apple/banana",
    "cherry/apple/banana",
    "apple/banana/cherry",
    "apple//banana",  # Invalid
    "grape/apple",  # Invalid
    "/apple",  # Invalid
]

# Check matches
for test in test_strings:
    print(f"'{test}' matches: {bool(regex.fullmatch(test))}")
