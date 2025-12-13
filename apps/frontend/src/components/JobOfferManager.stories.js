import JobOfferManager from './JobOfferManager.svelte';

export default {
  title: 'Components/JobOfferManager',
  component: JobOfferManager,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Composant principal pour gérer les offres d'emploi. Permet de créer, lister et relancer le workflow pour les offres.",
      },
    },
  },
};

// Mock data pour les stories
const mockJobOffers = [
  {
    id: '1',
    name: 'AlumnForce',
    slug: 'alumnforce',
    url: 'https://www.welcometothejungle.com/fr/companies/alumnforce/jobs/lead-developpeur-architecte-hands-on-h-f_paris',
    createdAt: '2025-12-13T00:00:00Z',
  },
  {
    id: '2',
    name: 'TechCorp',
    slug: 'techcorp',
    url: 'https://example.com/jobs/techcorp',
    createdAt: '2025-12-12T00:00:00Z',
  },
  {
    id: '3',
    name: 'StartupXYZ',
    slug: 'startupxyz',
    url: 'https://example.com/jobs/startupxyz',
    createdAt: '2025-12-11T00:00:00Z',
  },
];

// Story avec des données
export const WithData = {
  parameters: {
    mockData: [
      {
        url: '/job-offers',
        method: 'GET',
        status: 200,
        response: mockJobOffers,
      },
    ],
  },
  play: async () => {
    // Mock fetch pour cette story
    const originalFetch = window.fetch;
    window.fetch = async (url) => {
      if (url.includes('/job-offers')) {
        return {
          ok: true,
          json: async () => mockJobOffers,
        };
      }
      return originalFetch(url);
    };
  },
};

// Story avec liste vide
export const Empty = {
  play: async () => {
    const originalFetch = window.fetch;
    window.fetch = async (url) => {
      if (url.includes('/job-offers')) {
        return {
          ok: true,
          json: async () => [],
        };
      }
      return originalFetch(url);
    };
  },
};

// Story avec beaucoup de données
export const WithManyItems = {
  play: async () => {
    const manyOffers = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Company ${i + 1}`,
      slug: `company-${i + 1}`,
      url: `https://example.com/jobs/company-${i + 1}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    const originalFetch = window.fetch;
    window.fetch = async (url) => {
      if (url.includes('/job-offers')) {
        return {
          ok: true,
          json: async () => manyOffers,
        };
      }
      return originalFetch(url);
    };
  },
};

// Story avec erreur de chargement
export const LoadingError = {
  play: async () => {
    const originalFetch = window.fetch;
    window.fetch = async (url) => {
      if (url.includes('/job-offers')) {
        throw new Error('Network error');
      }
      return originalFetch(url);
    };
  },
};
