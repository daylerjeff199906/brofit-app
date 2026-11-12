import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Database } from "./database";
export type GymQuery = {
  q?: string;
  district?: string;
  category?: string;
  equipment?: string;
  service?: string;
  maxPrice?: number;
  page: number;
  pageSize: number;
};
const include = {
  offers: {
    where: { active: true },
    select: { id: true, kind: true, priceCents: true },
  },
} satisfies Prisma.GymInclude;
type GymRecord = Prisma.GymGetPayload<{ include: typeof include }>;
export function gymView(g: GymRecord) {
  const prices = g.offers
    .filter((o) => o.kind === "DAY_PASS")
    .map((o) => o.priceCents);
  return {
    id: g.id,
    slug: g.slug,
    name: g.name,
    district: g.district,
    address: g.address,
    category: g.category,
    equipment: g.equipment,
    services: g.services,
    hours: g.hours,
    image: g.image,
    description: g.description,
    demo: g.demo,
    price: prices.length ? Math.min(...prices) / 100 : 0,
    dayOfferId: g.offers.find((o) => o.kind === "DAY_PASS")?.id,
  };
}
@Injectable()
export class CatalogService {
  constructor(@Inject(Database) private readonly db: Database) {}
  async gyms(query: GymQuery) {
    const where: Prisma.GymWhereInput = {
      status: "ACTIVE",
      ...(query.district ? { district: query.district } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.equipment ? { equipment: { has: query.equipment } } : {}),
      ...(query.service ? { services: { has: query.service } } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { district: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.maxPrice !== undefined
        ? {
            offers: {
              some: {
                active: true,
                kind: "DAY_PASS",
                priceCents: { lte: Math.round(query.maxPrice * 100) },
              },
            },
          }
        : {}),
    };
    const [data, totalItems] = await this.db.$transaction([
      this.db.gym.findMany({
        where,
        include,
        orderBy: { name: "asc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.db.gym.count({ where }),
    ]);
    return {
      data: data.map(gymView),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / query.pageSize),
      },
    };
  }
  async gym(slug: string) {
    const g = await this.db.gym.findFirst({
      where: { slug, status: "ACTIVE" },
      include,
    });
    if (!g) throw new NotFoundException("Este gimnasio no está disponible.");
    return gymView(g);
  }
  async offers(gymId?: string) {
    return {
      data: await this.db.offer.findMany({
        where: {
          active: true,
          ...(gymId ? { gyms: { some: { id: gymId, status: "ACTIVE" } } } : {}),
        },
        include: {
          gyms: {
            where: { status: "ACTIVE" },
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { priceCents: "asc" },
        take: 100,
      }),
    };
  }
}
