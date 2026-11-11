import type { Gym } from "@brofit/types";
type Filters = {
  query?: string;
  district?: string;
  category?: string;
  equipment?: string;
  service?: string;
  maxPrice?: string;
  sort?: string;
};
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}
export function filterGyms(gyms: Gym[], f: Filters) {
  return gyms
    .filter(
      (g) =>
        normalize(`${g.name} ${g.district} ${g.equipment.join(" ")}`).includes(
          normalize(f.query || ""),
        ) &&
        (!f.district || g.district === f.district) &&
        (!f.category || f.category === "Todos" || g.category === f.category) &&
        (!f.equipment || g.equipment.includes(f.equipment)) &&
        (!f.service || g.services.includes(f.service)) &&
        (!f.maxPrice || g.price <= Number(f.maxPrice)),
    )
    .sort((a, b) =>
      f.sort === "price" ? a.price - b.price : a.name.localeCompare(b.name),
    );
}
