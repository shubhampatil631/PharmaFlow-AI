# Manual GitHub Upload Instructions

It appears my environment is restricting me from running `git` commands directly on your system. To upload the project, please open a fresh terminal or command prompt, navigate to your project folder (`d:\agents\pharmaceutical`), and run the following commands in order:

```bash
# 1. Initialize the git repository
git init

# 2. Add all files to the staging area
git add .

# 3. Create the initial commit
git commit -m "Initial commit with project cleanup and documentation"

# 4. Link your local repository to the GitHub remote
git remote add origin https://github.com/shubhampatil631/PharmaFlow-AI.git

# 5. Ensure the main branch is named 'main'
git branch -M main

# 6. Push the code to GitHub
git push -u origin main
```

If you encounter an error about a branch already existing on GitHub (e.g., if you initialized it with a README on GitHub), you might need to run `git pull origin main --rebase` before the final `git push`.
