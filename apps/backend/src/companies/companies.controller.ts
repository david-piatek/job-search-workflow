import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateJobOfferDto } from './dto/create-company.dto';
import { UpdateJobOfferDto } from './dto/update-company.dto';
import { JobOffer } from './entities/company.entity';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(@Body() createJobOfferDto: CreateJobOfferDto): Promise<JobOffer> {
    return await this.companiesService.create(createJobOfferDto);
  }

  @Get()
  async findAll(): Promise<JobOffer[]> {
    return await this.companiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<JobOffer> {
    return await this.companiesService.findOne(id);
  }

  @Get('by-slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<JobOffer> {
    return await this.companiesService.findBySlug(slug);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.companiesService.remove(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobOfferDto: UpdateJobOfferDto,
  ): Promise<JobOffer> {
    return await this.companiesService.update(id, updateJobOfferDto);
  }

  @Patch('by-slug/:slug')
  async updateBySlug(
    @Param('slug') slug: string,
    @Body() updateJobOfferDto: UpdateJobOfferDto,
  ): Promise<JobOffer> {
    return await this.companiesService.updateBySlug(slug, updateJobOfferDto);
  }
}
