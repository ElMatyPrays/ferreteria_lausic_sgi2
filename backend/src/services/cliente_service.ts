import { AppDataSource } from "../database/dbORM";
import { ClienteEntity } from "../database/entities/clienteEntity";
import type { CreateClienteDTO, UpdateClienteDTO } from "../DTO/clienteDTO";

export class ClientesService {
  private repo() {
    return AppDataSource.getRepository(ClienteEntity);
  }

  async create(dto: CreateClienteDTO) {
    if (!dto.rut?.trim()) throw new Error("rut es requerido");
    if (!dto.razon_social?.trim()) throw new Error("razon_social es requerido");
    if (!dto.tipo_de_compra?.trim()) throw new Error("tipo_de_compra es requerido");
    if (dto.giro === undefined || dto.giro === null || String(dto.giro).trim() === "")
      throw new Error("giro es requerido");
    if (!dto.direccion?.trim()) throw new Error("direccion es requerido");
    if (!dto.comuna?.trim()) throw new Error("comuna es requerido");
    if (!dto.ciudad?.trim()) throw new Error("ciudad es requerido");

    const entity = this.repo().create({
      rut: dto.rut.trim(),
      razon_social: dto.razon_social.trim(),
      tipo_de_compra: dto.tipo_de_compra.trim(),
      giro: String(dto.giro),
      direccion: dto.direccion.trim(),
      comuna: dto.comuna.trim(),
      ciudad: dto.ciudad.trim(),
      contacto: dto.contacto?.trim() ?? "0",
      tipo_descuento: dto.tipo_descuento ?? 0,
    });

    return await this.repo().save(entity);
  }

  async findAll(opts?: { q?: string }) {
    const q = opts?.q?.trim();
    if (!q) return await this.repo().find({ order: { ID_cliente: "ASC" } });

    return await this.repo()
      .createQueryBuilder("c")
      .where("c.razon_social LIKE :q", { q: `%${q}%` })
      .orWhere("c.rut LIKE :q", { q: `%${q}%` })
      .orderBy("c.ID_cliente", "ASC")
      .getMany();
  }

  async findById(id: number) {
    const item = await this.repo().findOne({ where: { ID_cliente: id } });
    if (!item) throw new Error("Cliente no encontrado");
    return item;
  }

  async update(id: number, dto: UpdateClienteDTO) {
    const item = await this.findById(id);

    if (dto.rut !== undefined) item.rut = dto.rut.trim();
    if (dto.razon_social !== undefined) item.razon_social = dto.razon_social.trim();
    if (dto.tipo_de_compra !== undefined) item.tipo_de_compra = dto.tipo_de_compra.trim();
    if (dto.giro !== undefined) item.giro = String(dto.giro);
    if (dto.direccion !== undefined) item.direccion = dto.direccion.trim();
    if (dto.comuna !== undefined) item.comuna = dto.comuna.trim();
    if (dto.ciudad !== undefined) item.ciudad = dto.ciudad.trim();
    if (dto.contacto !== undefined) item.contacto = dto.contacto.trim();
    if (dto.tipo_descuento !== undefined) item.tipo_descuento = dto.tipo_descuento;

    return await this.repo().save(item);
  }

  async remove(id: number) {
    const item = await this.findById(id);
    await this.repo().remove(item);
    return { ok: true };
  }
}
