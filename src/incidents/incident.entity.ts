import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'Incidents' })
export class Incident {
  @PrimaryColumn('uniqueidentifier')
  Id: string;

  @Column({ type: 'nvarchar', length: 200 })
  Title: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  Description: string;

  @Column({ type: 'nvarchar', length: 20 })
  Severity: string;

  @Column({ type: 'nvarchar', length: 20 })
  Status: string;

  @Column({ type: 'nvarchar', length: 100 })
  ServiceId: string;

  @Column({ type: 'datetime2' })
  CreatedAt: Date;

  @Column({ type: 'datetime2' })
  UpdatedAt: Date;
}
