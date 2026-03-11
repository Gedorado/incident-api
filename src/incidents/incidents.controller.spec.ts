import { Test, TestingModule } from '@nestjs/testing';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('IncidentsController', () => {
  let controller: IncidentsController;
  let service: IncidentsService;

  const mockIncidentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidentsController],
      providers: [
        {
          provide: IncidentsService,
          useValue: mockIncidentsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<IncidentsController>(IncidentsController);
    service = module.get<IncidentsService>(IncidentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return the created incident', async () => {
      const dto: CreateIncidentDto = {
        title: 'Test Incident',
        description: 'Something broke',
        severity: 'HIGH',
        serviceId: 'svc-001',
      };

      const expectedResult = {
        Id: '123e4567-e89b-12d3-a456-426614174000',
        Title: dto.title,
        Description: dto.description,
        Severity: dto.severity,
        Status: 'OPEN',
        ServiceId: dto.serviceId,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      };

      mockIncidentsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
      expect(result.Status).toBe('OPEN');
      expect(result.Title).toBe(dto.title);
    });
  });

  describe('findAll', () => {
    it('should return paginated incidents', async () => {
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
      };

      mockIncidentsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll({});

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return an incident with timeline', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const expectedResult = {
        Id: id,
        Title: 'Test',
        Description: 'Desc',
        Severity: 'LOW',
        Status: 'OPEN',
        ServiceId: 'svc-001',
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
        timeline: [],
      };

      mockIncidentsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toHaveProperty('timeline');
    });
  });

  describe('updateStatus', () => {
    it('should update and return the incident', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const dto = { status: 'RESOLVED' };
      const expectedResult = {
        Id: id,
        Status: 'RESOLVED',
      };

      mockIncidentsService.updateStatus.mockResolvedValue(expectedResult);

      const result = await controller.updateStatus(id, dto);

      expect(service.updateStatus).toHaveBeenCalledWith(id, dto);
      expect(result.Status).toBe('RESOLVED');
    });
  });
});
