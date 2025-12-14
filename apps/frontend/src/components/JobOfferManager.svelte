<script>
  import { onMount } from 'svelte';
  import { API_BASE_URL } from '../lib/api.js';

  let jobOffers = [];
  let newJobOffer = { name: '', slug: '', url: '' };
  let loading = false;
  let error = '';

  onMount(async () => {
    await loadJobOffers();
  });

  async function loadJobOffers() {
    try {
      const response = await fetch(`${API_BASE_URL}/job-offers`);
      jobOffers = await response.json();
    } catch (err) {
      error = 'Erreur lors du chargement des offres';
      console.error(err);
    }
  }

  async function createJobOffer() {
    if (!newJobOffer.slug || !newJobOffer.url) {
      error = "Veuillez remplir les champs slug et URL de l'offre";
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await fetch(`${API_BASE_URL}/job-offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJobOffer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création');
      }

      newJobOffer = { name: '', slug: '', url: '' };
      error = '';
      await loadJobOffers();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function rerunWorkflow(jobOffer) {
    try {
      loading = true;
      const response = await fetch(`${API_BASE_URL}/job-offers/upsert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: jobOffer.name,
          slug: jobOffer.slug,
          url: jobOffer.url,
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

<div class="jobOffer-qr-manager">
  <h2>job-search</h2>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  <div class="section">
    <h3>Ajouter une offre</h3>
    <div class="form-group">
      <input
        type="text"
        bind:value={newJobOffer.slug}
        placeholder="Slug (ex: mon-offre) *"
        pattern="[a-z0-9-]+"
        required
      />
      <input type="url" bind:value={newJobOffer.url} placeholder="URL de l'offre *" required />
      <button on:click={createJobOffer} disabled={loading}>
        {loading ? 'Création...' : "Créer l'offre"}
      </button>
    </div>

    {#if jobOffers.length > 0}
      <div class="jobOffers-table">
        <h4>Offres existantes ({jobOffers.length})</h4>
        <table>
          <thead>
            <tr>
              <th>Slug</th>
              <th>URL</th>
              <th>Page</th>
              <th>Workflow</th>
            </tr>
          </thead>
          <tbody>
            {#each jobOffers as jobOffer}
              <tr>
                <td class="jobOffer-slug"><code>{jobOffer.slug}</code></td>
                <td class="jobOffer-url">
                  <a href={jobOffer.url} target="_blank" rel="noopener noreferrer">
                    {jobOffer.url}
                    <span class="external-link">↗</span>
                  </a>
                </td>
                <td class="jobOffer-action">
                  <a href="/{jobOffer.slug}" class="btn-page"> 🔗 Voir la page </a>
                </td>
                <td class="jobOffer-action">
                  <button on:click={() => rerunWorkflow(jobOffer)} class="btn-workflow">
                    🔄 Relancer
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<style>
  .jobOffer-qr-manager {
    max-width: 100%;
    margin: 0 auto;
    padding: 2rem;
  }

  h2 {
    color: #2c3e50;
    font-size: 2.2rem;
    margin-bottom: 2.5rem;
    text-align: center;
    font-weight: 600;
    letter-spacing: -0.5px;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #2c3e50;
    font-weight: 600;
    letter-spacing: -0.3px;
  }

  h4 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: #495057;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section {
    background: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  input {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 1rem;
    background-color: #ffffff;
    color: #2c3e50;
    transition: all 0.2s;
  }

  input::placeholder {
    color: #adb5bd;
  }

  input:focus {
    outline: none;
    border-color: #646cff;
    background-color: #fff;
    box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.1);
  }

  button {
    padding: 0.85rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    transition: all 0.2s;
    letter-spacing: 0.3px;
    background: #646cff;
    color: white;
  }

  button:hover:not(:disabled) {
    background: #535bf2;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #feb2b2;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 1.5rem;
    font-weight: 500;
    font-size: 0.95rem;
  }

  .jobOffers-table {
    margin-top: 2rem;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    table-layout: auto;
  }

  thead {
    background: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
  }

  th {
    padding: 1rem 0.75rem;
    text-align: left;
    font-weight: 600;
    color: #495057;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  td {
    padding: 1rem 0.75rem;
    border-bottom: 1px solid #e9ecef;
    color: #2c3e50;
  }

  tbody tr {
    transition: background 0.2s;
  }

  tbody tr:hover {
    background: #f8f9fa;
  }

  .jobOffer-slug {
    min-width: 120px;
  }

  .jobOffer-slug code {
    background: #e9ecef;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    color: #495057;
    border: 1px solid #dee2e6;
  }

  .jobOffer-url {
    max-width: 250px;
  }

  .jobOffer-url a {
    color: #646cff;
    text-decoration: none;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .jobOffer-url a:hover {
    color: #535bf2;
    text-decoration: underline;
  }

  .external-link {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .jobOffer-action {
    text-align: center;
  }

  .btn-page {
    padding: 0.5rem 1rem;
    background: #646cff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-block;
  }

  .btn-page:hover {
    background: #535bf2;
  }

  .btn-workflow {
    padding: 0.5rem 1rem;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-workflow:hover {
    background: #2980b9;
  }

  .btn-workflow:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .jobOffer-qr-manager {
      padding: 1rem;
    }

    h2 {
      font-size: 1.8rem;
    }

    .section {
      padding: 1rem;
    }
  }
</style>
