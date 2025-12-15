<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/api.js';

  export let slug;

  let offer = null;
  let loading = true;
  let error = '';
  let qrCodeImage = '';
  let loadingQr = false;
  let saving = false;
  let hasUnsavedChanges = false;

  // Editable fields
  let editableOffer = {
    companyName: '',
    jobTitle: '',
    salary: '',
    remotePolicy: '',
    cvMatchScore: null,
    resumeJob: '',
    cvPersonalizationHint: '',
    cvMatchScoreReason: '',
    motivationLetter: '',
  };

  onMount(async () => {
    await loadOffer();
  });

  async function loadOffer() {
    try {
      loading = true;
      const response = await fetch(`${API_BASE_URL}/job-offers/by-slug/${slug}`);

      if (!response.ok) {
        throw new Error('Offre non trouvée');
      }

      offer = await response.json();
      error = '';

      // Populate editable fields
      editableOffer = {
        companyName: offer.companyName || '',
        jobTitle: offer.jobTitle || '',
        salary: offer.salary || '',
        remotePolicy: offer.remotePolicy || '',
        cvMatchScore: offer.cvMatchScore,
        resumeJob: offer.resumeJob || '',
        cvPersonalizationHint: offer.cvPersonalizationHint || '',
        cvMatchScoreReason: offer.cvMatchScoreReason || '',
        motivationLetter: offer.motivationLetter || '',
      };

      // Generate QR code
      await generateQrCode();
      hasUnsavedChanges = false;
    } catch (err) {
      error = err.message || "Erreur lors du chargement de l'offre";
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function markAsChanged() {
    hasUnsavedChanges = true;
  }

  async function saveChanges() {
    if (!offer) return;

    try {
      saving = true;
      const response = await fetch(`${API_BASE_URL}/job-offers/by-slug/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableOffer),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const updated = await response.json();
      offer = updated;
      hasUnsavedChanges = false;
      alert('✅ Modifications enregistrées avec succès!');
    } catch (err) {
      alert('❌ Erreur: ' + err.message);
      console.error(err);
    } finally {
      saving = false;
    }
  }

  async function generateQrCode() {
    if (!offer) return;

    loadingQr = true;
    const qrUrl = `https://job-search-workflow.draw-me-the-moon.fr/${offer.slug}`;

    try {
      const response = await fetch(`${API_BASE_URL}/generators/qr/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: qrUrl,
          size: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      qrCodeImage = result.dataUrl;
    } catch (err) {
      console.error('Erreur génération QR code:', err);
      qrCodeImage = '';
    } finally {
      loadingQr = false;
    }
  }

  function copyEmailTemplate() {
    navigator.clipboard.writeText(editableOffer.motivationLetter);
    alert('Email copié dans le presse-papier !');
  }

  function visitOffer() {
    if (offer && offer.url) {
      window.open(offer.url, '_blank');
    }
  }

  async function rerunWorkflow() {
    if (!offer) return;

    try {
      loading = true;
      const response = await fetch(`${API_BASE_URL}/job-offers/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: offer.name,
          slug: offer.slug,
          url: offer.url,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du relancement du workflow');
      }

      alert('✅ Workflow relancé avec succès!');
    } catch (err) {
      alert('❌ Erreur: ' + err.message);
      console.error(err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="offer-page">
  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Chargement de l'offre...</p>
    </div>
  {:else if error}
    <div class="error-page">
      <h1>❌ Erreur</h1>
      <p>{error}</p>
      <a href="/" class="back-link">← Retour à la liste</a>
    </div>
  {:else if offer}
    <div class="offer-container">
      <div class="offer-card">
        <div class="offer-header">
          <h1>{offer.name || offer.slug}</h1>
          {#if offer.name}
            <p class="slug-info">Slug: <code>{offer.slug}</code></p>
          {/if}
        </div>

        <div class="offer-content">
          <div class="info-grid">
            <div class="info-section">
              <span class="field-label">URL de l'offre</span>
              <a href={offer.url} target="_blank" rel="noopener noreferrer" class="offer-url">
                {offer.url}
                <span class="external-icon">↗</span>
              </a>
            </div>

            <div class="info-section">
              <span class="field-label">Entreprise</span>
              <input
                type="text"
                bind:value={editableOffer.companyName}
                on:input={markAsChanged}
                placeholder="Nom de l'entreprise"
                class="editable-input"
              />
            </div>

            <div class="info-section">
              <span class="field-label">Poste</span>
              <input
                type="text"
                bind:value={editableOffer.jobTitle}
                on:input={markAsChanged}
                placeholder="Titre du poste"
                class="editable-input"
              />
            </div>

            <div class="info-section">
              <span class="field-label">Salaire</span>
              <input
                type="text"
                bind:value={editableOffer.salary}
                on:input={markAsChanged}
                placeholder="Salaire"
                class="editable-input"
              />
            </div>

            <div class="info-section">
              <span class="field-label">Télétravail</span>
              <input
                type="text"
                bind:value={editableOffer.remotePolicy}
                on:input={markAsChanged}
                placeholder="Politique de télétravail"
                class="editable-input"
              />
            </div>

            {#if offer.status}
              <div class="info-section">
                <span class="field-label">Statut</span>
                <p class="status-badge">{offer.status}</p>
              </div>
            {/if}

            <div class="info-section">
              <span class="field-label">Score de correspondance CV</span>
              <input
                type="number"
                bind:value={editableOffer.cvMatchScore}
                on:input={markAsChanged}
                placeholder="Score (0-100)"
                min="0"
                max="100"
                step="0.01"
                class="editable-input"
              />
            </div>
          </div>

          <div class="info-section full-width">
            <span class="field-label">Résumé de l'offre</span>
            <textarea
              bind:value={editableOffer.resumeJob}
              on:input={markAsChanged}
              placeholder="Résumé de l'offre d'emploi..."
              rows="4"
              class="editable-textarea"
            ></textarea>
          </div>

          <div class="info-section full-width">
            <span class="field-label">Conseils de personnalisation CV</span>
            <textarea
              bind:value={editableOffer.cvPersonalizationHint}
              on:input={markAsChanged}
              placeholder="Conseils pour personnaliser votre CV..."
              rows="4"
              class="editable-textarea"
            ></textarea>
          </div>

          <div class="info-section full-width">
            <span class="field-label">Raison du score de correspondance</span>
            <textarea
              bind:value={editableOffer.cvMatchScoreReason}
              on:input={markAsChanged}
              placeholder="Pourquoi ce score de correspondance..."
              rows="4"
              class="editable-textarea"
            ></textarea>
          </div>

          <div class="email-template-section">
            <h3>📧 Template Email de Candidature</h3>
            <div class="template-body">
              <textarea
                bind:value={editableOffer.motivationLetter}
                on:input={markAsChanged}
                rows="15"
                placeholder="Lettre de motivation..."
                class="editable-textarea"
              ></textarea>

              <div class="qr-section">
                <h4>QR Code à inclure dans l'email</h4>
                {#if loadingQr}
                  <p>⏳ Génération du QR code...</p>
                {:else if qrCodeImage}
                  <img src={qrCodeImage} alt="QR Code" class="qr-code-preview" />
                  <p class="qr-info">
                    URL: https://job-search-workflow.draw-me-the-moon.fr/{offer.slug}
                  </p>
                {:else}
                  <p class="qr-error">❌ Erreur lors de la génération du QR code</p>
                {/if}
              </div>

              <button on:click={copyEmailTemplate} class="copy-btn"> 📋 Copier le template </button>
            </div>
          </div>

          {#if hasUnsavedChanges}
            <div class="unsaved-warning">⚠️ Vous avez des modifications non enregistrées</div>
          {/if}

          <div class="actions">
            <button on:click={saveChanges} class="save-btn" disabled={saving || !hasUnsavedChanges}>
              {saving ? '💾 Enregistrement...' : '💾 Enregistrer'}
            </button>
            <button on:click={visitOffer} class="primary-btn"> 🔗 Visiter l'offre </button>
            <button on:click={rerunWorkflow} class="workflow-btn" disabled={loading}>
              🔄 Relancer workflow
            </button>
            <a href="/" class="secondary-btn"> ← Retour à la liste </a>
          </div>
        </div>

        {#if offer.createdAt}
          <div class="offer-footer">
            <small>Ajoutée le {new Date(offer.createdAt).toLocaleDateString('fr-FR')}</small>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .offer-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
    padding: 2rem;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1.5rem;
  }

  .spinner {
    border: 4px solid #e9ecef;
    border-top: 4px solid #646cff;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading p {
    color: #495057;
    font-size: 1.1rem;
  }

  .error-page {
    max-width: 600px;
    margin: 4rem auto;
    padding: 2rem;
    background: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .error-page h1 {
    color: #c53030;
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .error-page p {
    color: #495057;
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .back-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #646cff;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    transition: background 0.2s;
  }

  .back-link:hover {
    background: #535bf2;
  }

  .offer-container {
    max-width: 800px;
    margin: 2rem auto;
  }

  .offer-card {
    background: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow: hidden;
  }

  .offer-header {
    padding: 2.5rem 2rem 1.5rem;
    border-bottom: 1px solid #e9ecef;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  }

  .offer-header h1 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: -0.5px;
  }

  .slug-info {
    margin: 0;
    color: #6c757d;
    font-size: 0.95rem;
  }

  .slug-info code {
    background: #e9ecef;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    color: #495057;
  }

  .offer-content {
    padding: 2rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .info-section {
    margin-bottom: 0;
  }

  .info-section.full-width {
    grid-column: 1 / -1;
    margin-top: 1rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .field-label {
    display: block;
    margin-bottom: 0.75rem;
    color: #495057;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-section p {
    margin: 0;
    color: #2c3e50;
    font-size: 1rem;
    line-height: 1.6;
  }

  .status-badge {
    display: inline-block;
    padding: 0.4rem 1rem;
    background: #e9ecef;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: capitalize;
  }

  .offer-url {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    color: #646cff;
    text-decoration: none;
    font-weight: 500;
    font-size: 1.05rem;
    transition: all 0.2s;
    word-break: break-all;
  }

  .offer-url:hover {
    background: #e9ecef;
    color: #535bf2;
    border-color: #ced4da;
  }

  .external-icon {
    font-size: 0.9rem;
    opacity: 0.7;
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .primary-btn {
    flex: 1;
    padding: 1rem 1.5rem;
    background: #646cff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.3px;
  }

  .primary-btn:hover {
    background: #535bf2;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(100, 108, 255, 0.3);
  }

  .secondary-btn {
    flex: 1;
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    color: #495057;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .secondary-btn:hover {
    background: #e9ecef;
    border-color: #ced4da;
  }

  .workflow-btn {
    flex: 1;
    padding: 1rem 1.5rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .workflow-btn:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }

  .workflow-btn:disabled {
    background: #95a5a6;
    cursor: not-allowed;
    transform: none;
  }

  .offer-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
  }

  .offer-footer small {
    color: #6c757d;
    font-size: 0.9rem;
  }

  .email-template-section {
    margin-top: 2rem;
    padding: 2rem;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
  }

  .email-template-section h3 {
    margin: 0 0 1.5rem 0;
    color: #2c3e50;
    font-size: 1.3rem;
  }

  .template-body textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
    resize: vertical;
    background: #ffffff;
    color: #2c3e50;
    margin-bottom: 1.5rem;
  }

  .qr-section {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    background: #ffffff;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    text-align: center;
  }

  .qr-section h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    color: #495057;
    text-transform: none;
  }

  .qr-code-preview {
    max-width: 250px;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    padding: 0.5rem;
    background: white;
  }

  .qr-info {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #6c757d;
    font-family: 'Courier New', monospace;
  }

  .qr-error {
    color: #c53030;
    font-weight: 500;
    margin: 1rem 0;
  }

  .copy-btn {
    padding: 0.85rem 1.5rem;
    background: #646cff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.3px;
  }

  .copy-btn:hover {
    background: #535bf2;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(100, 108, 255, 0.3);
  }

  .editable-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    color: #2c3e50;
    background: #ffffff;
    transition: all 0.2s;
  }

  .editable-input:focus {
    outline: none;
    border-color: #646cff;
    box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
  }

  .editable-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    color: #2c3e50;
    background: #ffffff;
    resize: vertical;
    line-height: 1.6;
    transition: all 0.2s;
  }

  .editable-textarea:focus {
    outline: none;
    border-color: #646cff;
    box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
  }

  .save-btn {
    flex: 1;
    padding: 1rem 1.5rem;
    background: #27ae60;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .save-btn:hover:not(:disabled) {
    background: #229954;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
  }

  .save-btn:disabled {
    background: #95a5a6;
    cursor: not-allowed;
    transform: none;
  }

  .unsaved-warning {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 6px;
    color: #856404;
    font-weight: 600;
    text-align: center;
  }

  @media (max-width: 768px) {
    .offer-page {
      padding: 1rem;
    }

    .offer-container {
      margin: 1rem auto;
    }

    .offer-header {
      padding: 1.5rem 1rem 1rem;
    }

    .offer-header h1 {
      font-size: 1.5rem;
    }

    .offer-content {
      padding: 1.5rem 1rem;
    }

    .actions {
      flex-direction: column;
    }

    .offer-url {
      font-size: 0.95rem;
      padding: 0.85rem 1rem;
    }
  }
</style>
