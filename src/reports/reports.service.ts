import { GetEstimateDto } from './dto/get-estimate.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
  ) {}

  create(createReportDto: CreateReportDto, user: User) {
    const report: Report = this.reportRepository.create(createReportDto);
    report.user = user;
    return this.reportRepository.save(report);
  }

  findAll() {
    return `This action returns all reports`;
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  async changeApproval(id: number, approved: boolean) {
    const report = await this.reportRepository.findOne({
      where: { id: id },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    report.approved = approved;
    return this.reportRepository.save(report);
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }

  createEstimate(estimateDto: GetEstimateDto) {
    const { make, model, lng, lat, year, mileage } = estimateDto;
    return this.reportRepository
      .createQueryBuilder('report')
      .select('AVG(report.price)', 'price')
      .where('report.make = :make', { make })
      .andWhere('report.model = :model', { model })
      .andWhere('report.year = :year', { year })
      .andWhere('report.lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('report.lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('report.year - :year BETWEEN -3 AND 3', { year })
      .orderBy('ABS(report.mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
