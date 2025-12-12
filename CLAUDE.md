les l'instrution doivent etre transive en gherkin en anglais

Feature: GitLab CI Docker Build with Buildx Bake

Scenario: Fix docker-bake.hcl context path for GitLab CI
Given the GitLab CI pipeline runs from the project root
And the docker-bake.hcl file is located at cloud/docker/docker-bake.hcl
When the build command "docker buildx bake -f cloud/docker/docker-bake.hcl prod --push" is executed
Then the context should be "." relative to the project root
And the dockerfile paths should be "cloud/docker/Dockerfile.backend-simple" and "cloud/docker/Dockerfile.frontend-simple"
And the build should not require access to parent directories outside the project root

Scenario: Disable GitHub Actions CI to save CI resources
Given the GitHub Actions workflow consumes CI resources
When the trigger branches are changed to "disabled-never-run" in .github/workflows/ci.yml
Then no CI jobs should run on push or pull_request events to main or develop
And GitHub Actions minutes should be preserved
And the workflow remains available for future reactivation by restoring branches to main and develop

Scenario: Fix GitLab Container Registry path for Docker push
Given the GitLab project is located at "dav.piatek/job-search-workflow"
And the Container Registry requires the full project path
When the REGISTRY variable is set to "registry.gitlab.com/dav.piatek/job-search-workflow"
Then Docker images can be pushed successfully to the GitLab Container Registry
And the registry path matches the project structure

Scenario: Clean up cloud/docker directory
Given the cloud/docker directory contains multiple duplicate and obsolete files
When obsolete Docker files are removed
Then only the actively used files remain: Dockerfile.backend-simple, Dockerfile.frontend-simple, compose-simple.yaml, and docker-bake.hcl
And all references in .github/workflows/ci.yml and Taskfile.yml are updated to use -simple versions
And Docker-specific tasks for letter-generator and qr-generator are removed

Scenario: Rename ArgoCD application to match project name
Given the ArgoCD application name is "job-search"
And the project is named "job-search-workflow"
When the ARGOCD_APP_NAME is changed to "job-search-workflow"
And the ArgoCD application manifest name is updated
And the Kubernetes namespace is updated to "job-search-workflow"
Then the ArgoCD application name matches the project naming convention
