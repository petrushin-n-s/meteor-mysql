import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity("translations")
export class Translation {
    @PrimaryGeneratedColumn()
    token!: string

    @Column()
    translation!: string
}