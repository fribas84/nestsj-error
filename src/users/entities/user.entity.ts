import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  OneToMany
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Report } from '../../reports/entities/report.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Unique(['email'])
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  admin: boolean;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @AfterRemove()
  logRemove() {
    console.log('Removed User with id: ', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated User with id: ', this.id);
  }

  @AfterInsert()
  logInsert() {
    console.log('Inserter User with id: ', this.id);
  }
}
