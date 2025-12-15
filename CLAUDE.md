les l'instrution doivent etre transive en gherkin en anglais

Feature: GitLab CI Docker Build with Buildx Bake

Scenario: Fix docker-bake.hcl context path for GitLab CI
Given the GitLab CI pipeline runs from the project root
And the docker-bake.hcl file is located at cloud/docker/docker-bake.hcl
When the build command "docker buildx bake -f cloud/docker/docker-bake.hcl prod --push" is executed
Then the context should be "." relative to the project root
And the dockerfile paths should be "cloud/docker/Dockerfile.backend" and "cloud/docker/Dockerfile.frontend"
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
Then only the actively used files remain: Dockerfile.backend, Dockerfile.frontend, compose.yaml, and docker-bake.hcl
And all references in .github/workflows/ci.yml and Taskfile.yml are updated
And Docker-specific tasks for letter-generator and qr-generator are removed

Scenario: Rename ArgoCD application to match project name
Given the ArgoCD application name is "job-search"
And the project is named "job-search-workflow"
When the ARGOCD_APP_NAME is changed to "job-search-workflow"
And the ArgoCD application manifest name is updated
And the Kubernetes namespace is updated to "job-search-workflow"
Then the ArgoCD application name matches the project naming convention

Scenario: Create Helm chart for Kubernetes deployment
Given the application needs to be deployed on Kubernetes via ArgoCD
When a Helm chart is created at cloud/helm/job-scraper-app
Then the chart includes Chart.yaml with metadata
And values.yaml contains configuration for backend and frontend
And templates include deployment and service manifests for both components
And the chart is ready for ArgoCD synchronization

Scenario: Deploy ArgoCD application
Given the Helm chart exists at cloud/helm/job-scraper-app
And the ArgoCD application manifest is at cloud/kubernetes/argocd.yaml
When kubectl apply -f cloud/kubernetes/argocd.yaml is executed
Then the ArgoCD application "job-search-workflow" is created
And ArgoCD automatically syncs with the GitLab repository
And Kubernetes resources are deployed to the "job-search-workflow" namespace
And the application is accessible via the configured services

Scenario: Optimize Docker layers for maximum CI cache efficiency
Given the Dockerfiles need to build quickly in CI pipelines
When layer ordering is optimized from least to most frequently changing
And BuildKit cache mounts are used for pnpm store
And .dockerignore excludes unnecessary files
Then pnpm dependencies are cached and reused between builds
And only changed source code triggers new builds
And build times are minimized in CI
And image sizes are reduced with multi-stage builds and cleanup

Scenario: Fix NestJS route ordering to prevent path matching issues
Given the CompaniesController has routes for both specific paths and parameterized paths
When specific routes like /upsert are placed before parameterized routes like /:id
Then NestJS correctly matches /upsert requests to the upsert handler
And parameterized routes do not incorrectly capture specific path names
And all API endpoints function as expected

Scenario: Rename company references to job-offer throughout the codebase
Given the codebase uses "company" and "companies" terminology
When all references are renamed to "job-offer" and "job-offers" respectively
And the backend module directory is renamed from companies to job-offers
And DTOs are renamed from CreateCompanyDto to CreateJobOfferDto
And the API controller route is changed from /api/companies to /api/job-offers
And frontend components are updated to use the new endpoint
Then the terminology consistently reflects the purpose of tracking job offers
And all API calls use the /api/job-offers endpoint
And the codebase builds successfully with the new naming

Scenario: Remove -simple suffix from Docker files
Given Docker files use -simple suffix (Dockerfile.backend-simple, Dockerfile.frontend-simple, compose-simple.yaml)
When the -simple suffix is removed from all Docker file names
And docker-bake.hcl is updated to reference the renamed files
Then Docker files follow standard naming conventions (Dockerfile.backend, Dockerfile.frontend, compose.yaml)
And the build configuration correctly references the renamed files

Scenario: Add workflow retry button to trigger n8n webhook
Given users need to manually trigger the n8n workflow for existing job offers
When a "Workflow" column is added to the job offers table
And a "🔄 Relancer" button is added in each row
And the button calls POST /api/job-offers/upsert with the job offer data
And the backend upsert endpoint creates or updates the offer and calls the n8n webhook
Then users can re-trigger the n8n workflow for any job offer
And the webhook at https://n8n.draw-me-the-moon.fr/webhook/58fc3205-46d2-4492-b75e-02dc5eed601a receives the job offer data
And the application builds successfully with the new functionality

Scenario: Implement automatic ArgoCD deployment with dynamic image tags
Given ArgoCD watches Git repository changes but not Docker registry changes
And using static image tags like "main" prevents ArgoCD from detecting new image builds
When Docker images are tagged with commit SHA using $CI_COMMIT_SHORT_SHA
And a GitLab CI update-helm-values job updates cloud/helm/job-scraper-app/values.yaml with the new tag
And the updated Helm values are committed back to Git with [skip ci] to prevent pipeline loops
And the job uses the built-in CI_JOB_TOKEN to push changes back to GitLab
And ArgoCD detects the Git change and automatically syncs the new deployment
Then ArgoCD automatically deploys new images without manual kubectl rollout restart
And each deployment uses a unique immutable image tag based on the commit SHA
And no manual token configuration is required as CI_JOB_TOKEN is automatically provided

Scenario: Setup Storybook for frontend component documentation and testing
Given the frontend uses Svelte components that need isolated development and documentation
When Storybook is configured with @storybook/svelte and @storybook/sveltekit
And story files are created for each component in apps/frontend/src/components/\*.stories.js
And stories demonstrate different states including default, loading, error, and edge cases
And mock data is provided for components that fetch from APIs
Then developers can run "pnpm storybook" in apps/frontend to view components in isolation
And components are documented with interactive controls and different scenarios
And the Storybook build can be deployed for design review and component library documentation

Scenario: Move email template from list to detail page
Given the email template was displayed in JobOfferManager list as inline section
And users had to click "📧 Voir template" button to see the template
When the email template generation is moved to OfferPage detail page
And the template is automatically generated when the offer page loads
And the "Template Mail" column is removed from the job offers table  
Then the email template displays directly on the detail page
And the template includes job offer information and QR code
And users can copy the template with a single click
And the job offers table is simplified to: slug, URL, page, workflow

Scenario: Separate deployment repository with GitOps workflow
Given the application code and deployment manifests are mixed in the same repository
And ArgoCD watches the main repository for Helm chart changes
When a separate deployment repository job-search-workflow-deploy is created
And a CI job sync-deploy-repo is added to automatically sync Helm charts and ArgoCD manifests
And the sync job runs after update-helm-values and force pushes to the deploy repo
And the ArgoCD application manifest is updated to point to the deploy repository
And the Helm chart path is changed from cloud/helm/job-scraper-app to helm/job-scraper-app
Then the deployment configuration is separated from application code
And ArgoCD watches the deploy repository at https://gitlab.com/dav.piatek/job-search-workflow-deploy.git
And every code change triggers automatic synchronization of deployment manifests
And the GitOps workflow follows best practices with separate config repositories

Scenario: Fix GitLab CI YAML syntax error with heredoc in sync-deploy-repo job
Given the sync-deploy-repo job uses heredoc syntax to create README.md
And GitLab CI fails with "script config should be a string or a nested array of strings up to 10 levels deep"
When the heredoc syntax cat > README.md <<'EOF' is replaced with simple echo statements
And each line of the README is written using echo "content" >> README.md
Then the GitLab CI YAML parser accepts the script configuration
And the sync-deploy-repo job executes successfully
And the README.md file is created in the deployment repository with proper formatting

Scenario: Automated database migrations with Kubernetes pre-upgrade hooks
Given the application uses TypeORM for database schema management
And database schema changes need to be applied before new pods are deployed
When a TypeORM datasource configuration is created at apps/backend/src/datasource.ts
And migration scripts (migration:run, migration:generate, migration:revert) are added to backend package.json
And a Kubernetes Job template is created at cloud/helm/job-search-workflow-app/templates/migration-job.yaml
And the job uses Helm hooks "pre-upgrade,pre-install" with weight "-5"
And the job runs "npm run migration:run" using the backend Docker image
And the job has hook-delete-policy "before-hook-creation,hook-succeeded" to clean up completed jobs
Then database migrations run automatically before every deployment
And the migrations complete successfully before new pods start rolling out
And failed migrations prevent the deployment from proceeding
And the Helm chart name is updated from job-scraper-app to job-search-workflow-app for consistency

Scenario: Make job offer details editable on offer page
Given users need to edit job offer information directly from the detail page
When editable input fields are added for companyName, jobTitle, salary, and remotePolicy
And editable textarea fields are added for resumeJob, cvPersonalizationHint, cvMatchScoreReason, and motivationLetter
And editable number input is added for cvMatchScore
And a markAsChanged function tracks when fields are modified
And a saveChanges function sends PATCH request to /api/job-offers/by-slug/:slug endpoint
And a save button is added to the actions section that is disabled when no changes exist
And an unsaved warning banner appears when hasUnsavedChanges is true
And CSS styles are added for editable-input, editable-textarea, save-btn, and unsaved-warning classes
Then users can edit all job offer fields directly on the detail page
And clicking save persists changes to the database via the backend API
And visual feedback indicates when there are unsaved changes
And the save button shows loading state during the save operation

Scenario: Optimize GitLab CI with separate backend and frontend builds
Given the pipeline builds both backend and frontend on every commit regardless of changes
And this wastes CI minutes when only one component changed
When docker-build job is split into docker-build-backend and docker-build-frontend
And rules with changes detection are added to only trigger builds when relevant files change
And backend build triggers on changes to apps/backend, Dockerfile.backend, or shared configs
And frontend build triggers on changes to apps/frontend, Dockerfile.frontend, or shared configs
And docker buildx bake targets backend-prod and frontend-prod separately
And sync-deploy-repo job depends on both builds with optional: true
Then backend only builds when backend files change
And frontend only builds when frontend files change
And CI minutes are saved by avoiding unnecessary builds
And the pipeline completes faster when only one component changed
