import OfferPage from './OfferPage.svelte';

export default {
  title: 'Components/OfferPage',
  component: OfferPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Page de détail d'une offre d'emploi. Affiche toutes les informations sur l'offre incluant le score de correspondance CV, les conseils de personnalisation, etc.",
      },
    },
  },
  argTypes: {
    slug: {
      control: 'text',
      description: "Le slug unique de l'offre à afficher",
    },
  },
};

// Mock data complète
const fullOfferData = {
  id: '1',
  name: 'AlumnForce',
  slug: 'alumnforce',
  url: 'https://www.welcometothejungle.com/fr/companies/alumnforce/jobs/lead-developpeur-architecte-hands-on-h-f_paris',
  companyName: 'AlumnForce',
  jobTitle: 'Lead Développeur / Architecte Hands-on (H/F)',
  resumeJob:
    "AlumnForce recherche un Lead Développeur / Architecte hands-on pour piloter l'architecture et le développement de sa plateforme SaaS dédiée aux communautés (alumni, réseaux professionnels, écoles, etc.). Le rôle consiste à définir et faire évoluer l'architecture technique, encadrer et faire monter en compétence l'équipe de dev, prendre en charge les sujets complexes (performance, sécurité, scalabilité), garantir la qualité du code (revues, bonnes pratiques, tests) et collaborer étroitement avec les équipes produit et business pour faire avancer la roadmap.",
  cvPersonalizationHint:
    "Points de matching forts entre ton profil et le poste AlumnForce :\n\n1) Leadership technique & architecture\n- Tu as occupé des rôles de Lead / Référent technique sur plusieurs projets web complexes (SaaS, plateformes, outils internes) avec une forte implication dans les décisions d'architecture.\n\n2) Expérience full‑stack web robuste\n- Tu as une solide expérience en développement web (front + back), avec un historique sur JS/TS, frameworks modernes et APIs.",
  salary: '55-75K€ selon expérience',
  remotePolicy: 'Hybride - 2 jours de télétravail par semaine',
  cvMatchScore: 84,
  cvMatchScoreReason:
    'Ton profil est très cohérent avec un poste de Lead Développeur / Architecte hands-on dans un contexte SaaS : forte expérience en développement web et sur des produits complexes, dimension de leadership technique déjà présente.',
  status: 'updated',
  createdAt: '2025-12-13T00:00:00Z',
};

// Mock data minimale
const minimalOfferData = {
  id: '2',
  slug: 'techcorp',
  url: 'https://example.com/jobs/techcorp',
  createdAt: '2025-12-12T00:00:00Z',
};

// Helper function pour mocker fetch
const mockFetch = (data, shouldFail = false) => {
  const originalFetch = window.fetch;
  window.fetch = async (url) => {
    if (url.includes('/job-offers/by-slug/')) {
      if (shouldFail) {
        return {
          ok: false,
          json: async () => ({ message: 'Offre non trouvée' }),
        };
      }
      return {
        ok: true,
        json: async () => data,
      };
    }
    return originalFetch(url);
  };
};

// Story avec toutes les données
export const FullData = {
  args: {
    slug: 'alumnforce',
  },
  play: async () => {
    mockFetch(fullOfferData);
  },
};

// Story avec données minimales
export const MinimalData = {
  args: {
    slug: 'techcorp',
  },
  play: async () => {
    mockFetch(minimalOfferData);
  },
};

// Story avec score élevé
export const HighMatchScore = {
  args: {
    slug: 'high-score',
  },
  play: async () => {
    mockFetch({
      ...fullOfferData,
      cvMatchScore: 95,
      status: 'new',
    });
  },
};

// Story avec score faible
export const LowMatchScore = {
  args: {
    slug: 'low-score',
  },
  play: async () => {
    mockFetch({
      ...fullOfferData,
      cvMatchScore: 45,
      cvMatchScoreReason:
        'Le profil présente quelques écarts significatifs avec les compétences requises pour ce poste.',
    });
  },
};

// Story état de chargement
export const Loading = {
  args: {
    slug: 'loading-offer',
  },
  play: async () => {
    const originalFetch = window.fetch;
    window.fetch = async (url) => {
      if (url.includes('/job-offers/by-slug/')) {
        // Simule un chargement lent
        return new Promise(() => {}); // Never resolves
      }
      return originalFetch(url);
    };
  },
};

// Story erreur 404
export const NotFound = {
  args: {
    slug: 'non-existent',
  },
  play: async () => {
    mockFetch(null, true);
  },
};

// Story sans nom (utilise le slug)
export const WithoutName = {
  args: {
    slug: 'company-xyz',
  },
  play: async () => {
    mockFetch({
      ...fullOfferData,
      name: null,
      slug: 'company-xyz',
    });
  },
};

// Story avec très long contenu
export const LongContent = {
  args: {
    slug: 'long-content',
  },
  play: async () => {
    mockFetch({
      ...fullOfferData,
      resumeJob: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50),
      cvPersonalizationHint:
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '.repeat(40),
      cvMatchScoreReason: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco. '.repeat(30),
    });
  },
};
