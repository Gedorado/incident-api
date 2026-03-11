import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from './incident.entity.js';
import { EventsService } from '../events/events.service.js';
import { ServiceCatalogService } from '../service-catalog/service-catalog.service.js';
import { CreateIncidentDto } from './dto/create-incident.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { ListIncidentsQueryDto } from './dto/list-incidents-query.dto.js';
import { randomUUID } from 'crypto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepo: Repository<Incident>,
    private readonly eventsService: EventsService,
    private readonly serviceCatalogService: ServiceCatalogService,
  ) {}

  async create(dto: CreateIncidentDto): Promise<Incident> {
    const now = new Date();
    const incident = this.incidentRepo.create({
      Id: randomUUID(),
      Title: dto.title,
      Description: dto.description,
      Severity: dto.severity,
      Status: 'OPEN',
      ServiceId: dto.serviceId,
      CreatedAt: now,
      UpdatedAt: now,
    });

    const saved = await this.incidentRepo.save(incident);

    await this.eventsService.create(saved.Id, 'incident_created', {
      title: dto.title,
      description: dto.description,
      severity: dto.severity,
      serviceId: dto.serviceId,
    });

    const catalogResult = await this.serviceCatalogService.getService(
      dto.serviceId,
    );
    await this.eventsService.create(
      saved.Id,
      'service_catalog_snapshot',
      catalogResult,
    );

    return saved;
  }

  async findAll(query: ListIncidentsQueryDto) {
    const page = parseInt(query.page ?? '1', 10);
    const pageSize = parseInt(query.pageSize ?? '10', 10);

    const qb = this.incidentRepo.createQueryBuilder('incident');

    if (query.status) {
      qb.andWhere('incident.Status = :status', { status: query.status });
    }
    if (query.severity) {
      qb.andWhere('incident.Severity = :severity', {
        severity: query.severity,
      });
    }
    if (query.serviceId) {
      qb.andWhere('incident.ServiceId = :serviceId', {
        serviceId: query.serviceId,
      });
    }
    if (query.q) {
      qb.andWhere('incident.Title LIKE :q', { q: `%${query.q}%` });
    }

    // Sort
    const sortParam = query.sort || 'createdAt_desc';
    const [sortField, sortDir] = sortParam.split('_');
    const columnMap: Record<string, string> = {
      createdAt: 'incident.CreatedAt',
      updatedAt: 'incident.UpdatedAt',
      title: 'incident.Title',
      severity: 'incident.Severity',
      status: 'incident.Status',
    };
    const orderColumn = columnMap[sortField] || 'incident.CreatedAt';
    const orderDir = sortDir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(orderColumn, orderDir);

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, pageSize };
  }

  async findOne(id: string) {
    const incident = await this.incidentRepo.findOne({ where: { Id: id } });
    if (!incident) {
      throw new NotFoundException(`Incident with Id "${id}" not found`);
    }

    const timeline = await this.eventsService.findByIncidentId(id);

    return { ...incident, timeline };
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<Incident> {
    const incident = await this.incidentRepo.findOne({ where: { Id: id } });
    if (!incident) {
      throw new NotFoundException(`Incident with Id "${id}" not found`);
    }

    const previousStatus = incident.Status;
    incident.Status = dto.status;
    incident.UpdatedAt = new Date();

    const updated = await this.incidentRepo.save(incident);

    await this.eventsService.create(id, 'incident_status_changed', {
      previousStatus,
      newStatus: dto.status,
    });

    return updated;
  }
}
