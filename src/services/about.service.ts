import { Founder, foundersData, companyStory } from '../data/about.data';

export interface AboutService {
  getFounders(): Promise<Founder[]>;
  getCompanyStory(): Promise<typeof companyStory>;
}

class AboutServiceImpl implements AboutService {
  async getFounders(): Promise<Founder[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return foundersData;
  }

  async getCompanyStory(): Promise<typeof companyStory> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return companyStory;
  }
}

export const aboutService = new AboutServiceImpl();