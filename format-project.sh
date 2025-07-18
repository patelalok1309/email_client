#!/bin/bash

# Format Project with Prettier
# This script formats all supported files in the project

echo "🎨 Formatting project with Prettier..."

# Check if prettier is installed
if ! command -v prettier &> /dev/null; then
    echo "❌ Prettier is not installed globally."
    echo "💡 Installing Prettier locally..."
    npm install --save-dev prettier
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Prettier. Please install it manually:"
        echo "   npm install --save-dev prettier"
        echo "   or"
        echo "   npm install -g prettier"
        exit 1
    fi
    
    # Use locally installed prettier
    PRETTIER_CMD="npx prettier"
else
    PRETTIER_CMD="prettier"
fi

# Create array of file extensions to format
extensions=(
    "js"
    "jsx"
    "ts"
    "tsx"
    "json"
    "css"
    "scss"
    "sass"
    "less"
    "html"
    "vue"
    "md"
    "yaml"
    "yml"
)

# Build the glob pattern
pattern=""
for ext in "${extensions[@]}"; do
    if [ -n "$pattern" ]; then
        pattern="$pattern,**/*.$ext"
    else
        pattern="**/*.$ext"
    fi
done

echo "📁 Formatting files with extensions: ${extensions[*]}"
echo "🔍 Pattern: {$pattern}"

# Format all files
$PRETTIER_CMD --write "{$pattern}" --ignore-path .prettierignore

if [ $? -eq 0 ]; then
    echo "✅ Project formatting completed successfully!"
    echo "📊 Files formatted:"
    
    # Show what files were affected (optional)
    echo "🔍 Checking formatted files..."
    $PRETTIER_CMD --list-different "{$pattern}" --ignore-path .prettierignore || echo "   All files are properly formatted!"
else
    echo "❌ Formatting failed. Please check the output above for errors."
    exit 1
fi

echo "🎉 Done! Your project has been formatted with Prettier."
