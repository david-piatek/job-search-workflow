# Déploiement ArgoCD - Job Search Workflow

## Prérequis

- ArgoCD installé et accessible sur `argocd.draw-me-the-moon.fr`
- kubectl configuré avec accès au cluster Kubernetes
- Credentials ArgoCD (username/password ou token)
- Images Docker déjà pushées dans GitLab Container Registry

## 1. Login ArgoCD

```bash
# Via CLI
argocd login argocd.draw-me-the-moon.fr \
  --username $ARGOCD_USERNAME \
  --password $ARGOCD_PASSWORD \
  --grpc-web

# Ou via UI
# https://argocd.draw-me-the-moon.fr
```

## 2. Créer l'Application ArgoCD

### Méthode 1: Via kubectl (Recommandé)

```bash
# Appliquer le manifest
kubectl apply -f cloud/kubernetes/application.yaml

# Vérifier la création
kubectl get application -n argocd job-search-workflow
```

### Méthode 2: Via ArgoCD CLI

```bash
# Créer l'application
argocd app create job-search-workflow \
  --repo https://gitlab.com/dav.piatek/job-search-workflow.git \
  --path cloud/helm/job-scraper-app \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace job-search-workflow \
  --values values-simple.yaml \
  --sync-policy automated \
  --auto-prune \
  --self-heal
```

### Méthode 3: Via UI ArgoCD

1. Aller sur https://argocd.draw-me-the-moon.fr
2. Cliquer sur **+ NEW APP**
3. Remplir les champs:
   - **Application Name**: job-search-workflow
   - **Project**: default
   - **Sync Policy**: Automatic
   - **Repository URL**: https://gitlab.com/dav.piatek/job-search-workflow.git
   - **Path**: cloud/helm/job-scraper-app
   - **Cluster**: https://kubernetes.default.svc
   - **Namespace**: job-search-workflow
   - **Values Files**: values-simple.yaml
4. Cliquer sur **CREATE**

## 3. Synchroniser l'Application

```bash
# Sync manuel (si sync auto désactivé)
argocd app sync job-search-workflow

# Forcer le refresh
argocd app get job-search-workflow --refresh

# Attendre que le déploiement soit complet
argocd app wait job-search-workflow --timeout 600
```

## 4. Vérifier le Déploiement

```bash
# Status de l'app ArgoCD
argocd app get job-search-workflow

# Pods Kubernetes
kubectl get pods -n job-search-workflow

# Services
kubectl get svc -n job-search-workflow

# Logs backend
kubectl logs -f deployment/job-search-workflow-backend -n job-search-workflow

# Logs frontend
kubectl logs -f deployment/job-search-workflow-frontend -n job-search-workflow
```

## 5. Accéder à l'Application

```bash
# Port-forward pour tester localement
kubectl port-forward -n job-search-workflow svc/job-search-workflow-frontend 8080:80
kubectl port-forward -n job-search-workflow svc/job-search-workflow-backend 3001:3001

# Ouvrir dans le navigateur
# Frontend: http://localhost:8080
# Backend: http://localhost:3001/health
```

## Configuration Helm

### Fichiers principaux:

- **Chart.yaml**: Métadonnées du chart
- **values-simple.yaml**: Configuration des déploiements
- **templates/**: Manifests Kubernetes

### Personnalisation:

Éditer `cloud/helm/job-scraper-app/values-simple.yaml`:

```yaml
# Nombre de replicas
replicaCount:
  backend: 2
  frontend: 2

# Tags des images
image:
  backend:
    tag: 'v1.2.3'
  frontend:
    tag: 'v1.2.3'

# Ressources
resources:
  backend:
    limits:
      cpu: 1000m
      memory: 1Gi
```

## Troubleshooting

### L'application ne se synchronise pas

```bash
# Forcer le refresh
argocd app get job-search-workflow --refresh --hard-refresh

# Supprimer et recréer
argocd app delete job-search-workflow
kubectl apply -f cloud/kubernetes/application.yaml
```

### Images non trouvées

Vérifier que les images existent dans GitLab Container Registry:

```bash
# Via GitLab UI
# https://gitlab.com/dav.piatek/job-search-workflow/container_registry

# Via API
curl --header "PRIVATE-TOKEN: <your_token>" \
  "https://gitlab.com/api/v4/projects/dav.piatek%2Fjob-search-workflow/registry/repositories"
```

### Pods en CrashLoopBackOff

```bash
# Voir les logs
kubectl logs <pod-name> -n job-search-workflow

# Décrire le pod
kubectl describe pod <pod-name> -n job-search-workflow

# Vérifier les health checks
kubectl get events -n job-search-workflow
```

## Pipeline GitLab CI/CD

Le pipeline GitLab va automatiquement:

1. Builder les images Docker
2. Les pusher vers le Container Registry
3. Déclencher le sync ArgoCD (si configuré)

Vérifier le pipeline sur: https://gitlab.com/dav.piatek/job-search-workflow/-/pipelines

## Suppression

```bash
# Via ArgoCD CLI
argocd app delete job-search-workflow

# Via kubectl
kubectl delete -f cloud/kubernetes/application.yaml

# Supprimer le namespace
kubectl delete namespace job-search-workflow
```
